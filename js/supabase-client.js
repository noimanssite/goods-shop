// Supabase 클라이언트 전역 인스턴스. config.js와 @supabase/supabase-js CDN 로드 이후에 포함.
window.sb = supabase.createClient(window.APP_CONFIG.SUPABASE_URL, window.APP_CONFIG.SUPABASE_ANON_KEY);
