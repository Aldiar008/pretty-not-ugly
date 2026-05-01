CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  last_request_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (identifier, day)
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_day ON public.ai_usage(day);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Edge function uses service role; no client access needed. Lock down by default.
CREATE POLICY "no_client_access_select" ON public.ai_usage FOR SELECT USING (false);
CREATE POLICY "no_client_access_insert" ON public.ai_usage FOR INSERT WITH CHECK (false);
CREATE POLICY "no_client_access_update" ON public.ai_usage FOR UPDATE USING (false);

-- Atomic increment function (callable from edge with service role).
CREATE OR REPLACE FUNCTION public.increment_ai_usage(_identifier TEXT, _limit INTEGER)
RETURNS TABLE(allowed BOOLEAN, current_count INTEGER, day_limit INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO public.ai_usage (identifier, day, count, last_request_at)
  VALUES (_identifier, CURRENT_DATE, 1, now())
  ON CONFLICT (identifier, day)
  DO UPDATE SET
    count = public.ai_usage.count + 1,
    last_request_at = now()
  RETURNING count INTO v_count;

  RETURN QUERY SELECT (v_count <= _limit) AS allowed, v_count AS current_count, _limit AS day_limit;
END;
$$;