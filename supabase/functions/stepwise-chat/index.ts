// Stepwise AI gateway. Streams Lovable AI responses for advisor + interview.
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Daily message limits (Free tier — Pro/billing not implemented yet).
const DAILY_LIMIT = 30;
// Lightweight per-IP burst limiter (in-memory, per-instance).
const BURST_WINDOW_MS = 10_000;
const BURST_MAX = 6;
const burstMap = new Map<string, number[]>();

function checkBurst(ip: string): boolean {
  const now = Date.now();
  const arr = (burstMap.get(ip) || []).filter((t) => now - t < BURST_WINDOW_MS);
  arr.push(now);
  burstMap.set(ip, arr);
  // Cleanup occasionally to avoid memory growth.
  if (burstMap.size > 5000) {
    for (const [k, v] of burstMap) {
      if (!v.length || now - v[v.length - 1] > BURST_WINDOW_MS) burstMap.delete(k);
    }
  }
  return arr.length <= BURST_MAX;
}

interface UserCtx {
  name?: string;
  country?: string;
  grade?: string;
  gpa?: number | null;
  sat?: number | null;
  ielts?: number | null;
  toefl?: number | null;
  nationalExam?: string;
  nationalScore?: number | null;
  targetCountries?: string[];
  targetMajor?: string;
  budget?: string;
}

interface UniCtx {
  name: string;
  country: string;
  status: string;
  chancePercent: number;
  deadline: string;
}

interface PlanCtx {
  totalTasks: number;
  doneTasks: number;
  nextDeadline?: string | null;
  urgentOpen?: string[];
}

function buildAdvisorPrompt(user: UserCtx, unis: UniCtx[], plan: PlanCtx) {
  return `Ты AI-советник платформы Stepwise. Помогаешь ученикам поступить в зарубежные университеты.
Отвечай на языке пользователя: если пишет по-русски — отвечай по-русски, если по-английски — по-английски.
Будь конкретным и практичным. Давай чёткие шаги, а не общие фразы. Никакой воды.
Отвечай в Markdown — жирный, списки, заголовки, цитаты — где это уместно.

Профиль пользователя:
Имя: ${user.name ?? "не указано"}
Страна: ${user.country ?? "не указана"}
Класс: ${user.grade ?? "не указан"}
GPA: ${user.gpa ?? "не указано"}
SAT: ${user.sat ?? "не указано"}
IELTS: ${user.ielts ?? "не указано"}
TOEFL: ${user.toefl ?? "не указано"}
Нац. экзамен ${user.nationalExam ?? ""}: ${user.nationalScore ?? "не указано"}
Целевые страны: ${(user.targetCountries ?? []).join(", ") || "не указаны"}
Специальность: ${user.targetMajor ?? "не указана"}
Бюджет: ${user.budget ?? "не указан"}

Университеты в списке (${unis.length}):
${unis.map((u) => `- ${u.name} (${u.country}) — ${u.status}, шанс ${u.chancePercent}%, дедлайн ${u.deadline}`).join("\n") || "пока пусто"}

План: задач ${plan.totalTasks}, выполнено ${plan.doneTasks}.
Ближайший дедлайн: ${plan.nextDeadline ?? "нет"}.
Срочные невыполненные: ${(plan.urgentOpen ?? []).join("; ") || "нет"}.

Правила:
- Когда просят написать эссе — пиши полный черновик, не шаблон.
- Когда спрашивают про шансы — сравнивай реальные баллы пользователя с требованиями.
- Когда спрашивают что делать — смотри на ближайшие дедлайны и срочные задачи.
- Когда рекомендуешь университеты — учитывай страну, бюджет и специальность.
- Не выдумывай — если не знаешь, скажи честно.`;
}

function buildInterviewPrompt(opts: {
  university: string;
  type: string;
  major: string;
  user: UserCtx;
  language: string;
}) {
  return `Ты строгий, но справедливый интервьюер приёмной комиссии университета ${opts.university}.
Проводишь ${opts.type} интервью для поступающего на специальность ${opts.major}.
Язык интервью: ${opts.language}.

Профиль студента:
Имя: ${opts.user.name ?? "не указано"}
Страна: ${opts.user.country ?? "не указана"}
GPA: ${opts.user.gpa ?? "не указано"}
Специальность: ${opts.user.targetMajor ?? "не указана"}

Правила:
1. Задавай по одному вопросу за раз.
2. После каждого ответа студента — дай краткий анализ строго в формате ниже, затем задай следующий вопрос.
3. Веди себя как реальный интервьюер: профессионально, без избыточной дружелюбности.
4. Для академического типа — про специальность, мотивацию и последние идеи в области.
5. Для личностного — про опыт, лидерство, провалы, ценности.
6. Для стрессового (Oxford/Cambridge) — гипотетические задачи, провокационные вопросы.
7. Для группового — задавай темы для дискуссии.

Формат после каждого ответа студента (СТРОГО):
**📊 Анализ:**
✓ Сильно: [что конкретно хорошо]
△ Улучшить: [конкретный совет]
★ Оценка: X/5
💡 Совет: [1–2 предложения как ответить лучше]

**Следующий вопрос:** [новый вопрос]

Начни сейчас с первого вопроса (без анализа — анализа ещё нет).`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === Rate limiting ===
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";

    if (!checkBurst(ip)) {
      return new Response(
        JSON.stringify({
          error: "Слишком быстро! Подожди пару секунд и попробуй снова.",
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const mode: "advisor" | "interview" = body.mode || "advisor";
    const messages: { role: "user" | "assistant"; content: string }[] =
      body.messages || [];

    // Identifier: prefer logged-in user_id from client; fallback to IP.
    const identifier = body.userId ? `u:${body.userId}` : `ip:${ip}`;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (SUPABASE_URL && SERVICE_KEY) {
      const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: { persistSession: false },
      });
      const { data: rl, error: rlErr } = await admin.rpc("increment_ai_usage", {
        _identifier: identifier,
        _limit: DAILY_LIMIT,
      });
      if (rlErr) {
        console.error("rate-limit rpc error:", rlErr);
      } else {
        const row = Array.isArray(rl) ? rl[0] : rl;
        if (row && !row.allowed) {
          return new Response(
            JSON.stringify({
              error: `Дневной лимит ${DAILY_LIMIT} AI-сообщений исчерпан. Возвращайся завтра или подключи Pro.`,
              limit: DAILY_LIMIT,
              used: row.current_count,
            }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      }
    }
    // === /Rate limiting ===

    let systemPrompt = "";
    if (mode === "advisor") {
      systemPrompt = buildAdvisorPrompt(
        body.user || {},
        body.universities || [],
        body.plan || { totalTasks: 0, doneTasks: 0 }
      );
    } else {
      systemPrompt = buildInterviewPrompt({
        university: body.university || "Общее интервью",
        type: body.type || "Академическое",
        major: body.major || "Computer Science",
        user: body.user || {},
        language: body.language || "Русский",
      });
    }

    const upstream = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: body.model || "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return new Response(
          JSON.stringify({ error: "Слишком много запросов. Попробуй позже." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (upstream.status === 402) {
        return new Response(
          JSON.stringify({ error: "Закончились AI-кредиты. Пополни баланс в настройках." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await upstream.text();
      console.error("AI gateway error:", upstream.status, t);
      return new Response(JSON.stringify({ error: "Ошибка AI шлюза" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
