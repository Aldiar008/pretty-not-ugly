REVOKE EXECUTE ON FUNCTION public.increment_ai_usage(TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_ai_usage(TEXT, INTEGER) TO service_role;