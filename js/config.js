// 공개해도 안전한 키들만 (anon key는 RLS로 보호, 토스 client key는 본래 공개용)
// 🚨 service_role 키, 토스 secret 키는 절대 여기에 넣지 마세요 (Edge Function 환경변수로만)

window.APP_CONFIG = {
  SUPABASE_URL: "https://fizqwyhnqqmumakgplfm.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpenF3eWhucXFtdW1ha2dwbGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMDY2OTksImV4cCI6MjA5NDg4MjY5OX0.8HRdqosqtDUqVWCwH6PIht4nH_7RsBhEcyOSeeX68TA",
  TOSS_CLIENT_KEY: "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm",
};
