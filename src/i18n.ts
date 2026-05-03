import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const ru = {
  nav: {
    dashboard: "Главная",
    plan: "Мой план",
    universities: "Университеты",
    documents: "Документы",
    essay: "Essay Studio",
    ai: "AI-советник",
    interview: "Интервью",
    missions: "Миссии",
    achievements: "Достижения",
    profile: "Профиль",
  },
  common: {
    streak_days: "{{count}} дн.",
    theme: "Тема",
    language: "Язык",
    soon: "Скоро здесь",
    in_dev: "Эта страница в разработке — допилим в следующей итерации.",
  },
  missions: {
    title: "Ежедневные миссии",
    subtitle: "Маленькие шаги каждый день — большая разница за месяц.",
    today: "Сегодня",
    completed: "Готово",
    keep_going: "Продолжай в том же духе!",
  },
  achievements: {
    title: "Достижения",
    subtitle: "Бейджи за прогресс и загруженные грамоты с AI-анализом.",
    badges: "Бейджи",
    uploaded: "Мои грамоты",
    upload_cta: "Загрузить грамоту",
  },
};

const en = {
  nav: {
    dashboard: "Dashboard",
    plan: "My Plan",
    universities: "Universities",
    documents: "Documents",
    essay: "Essay Studio",
    ai: "AI Advisor",
    interview: "Interview",
    missions: "Missions",
    achievements: "Achievements",
    profile: "Profile",
  },
  common: {
    streak_days: "{{count}} d",
    theme: "Theme",
    language: "Language",
    soon: "Coming soon",
    in_dev: "This page is in development — landing in the next iteration.",
  },
  missions: {
    title: "Daily Missions",
    subtitle: "Small steps every day — a big difference in a month.",
    today: "Today",
    completed: "Done",
    keep_going: "Keep going!",
  },
  achievements: {
    title: "Achievements",
    subtitle: "Badges for progress and uploaded certificates with AI analysis.",
    badges: "Badges",
    uploaded: "My certificates",
    upload_cta: "Upload certificate",
  },
};

const stored = typeof window !== "undefined" ? localStorage.getItem("stepwise_lang") : null;

i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, en: { translation: en } },
  lng: stored || "ru",
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
});

export function setLanguage(lng: "ru" | "en") {
  localStorage.setItem("stepwise_lang", lng);
  i18n.changeLanguage(lng);
}

export default i18n;
