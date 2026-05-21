// 인증 헬퍼. window.sb (supabase-client.js) 로드 이후에 포함.
// 모든 메서드는 { user, error } 형태 또는 단순 값을 반환.

window.auth = {
  // 회원가입. mailer_autoconfirm=true 설정이므로 성공 시 자동 로그인됨.
  async signUp(email, password) {
    const { data, error } = await window.sb.auth.signUp({ email, password });
    if (error) console.error("[auth.signUp]", error);
    return { user: data?.user ?? null, error: error?.message ?? null };
  },

  // 로그인.
  async signIn(email, password) {
    const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
    if (error) console.error("[auth.signIn]", error);
    return { user: data?.user ?? null, error: error?.message ?? null };
  },

  // 로그아웃 후 login.html로 이동.
  async signOut() {
    const { error } = await window.sb.auth.signOut();
    if (error) console.error("[auth.signOut]", error);
    location.replace("login.html");
  },

  // 현재 로그인 user 반환 (없으면 null). Redirect 안 함.
  async getUser() {
    const { data, error } = await window.sb.auth.getUser();
    if (error) {
      // 비로그인 상태에서도 에러가 올 수 있으므로 로그만 남김
      return null;
    }
    return data?.user ?? null;
  },

  // 로그인 필수 가드. 비로그인이면 login.html로 redirect하고 null 반환.
  // 호출자는 반환값이 null이면 early return 처리할 것.
  async requireUser() {
    const user = await window.auth.getUser();
    if (!user) {
      location.replace("login.html");
      return null;
    }
    return user;
  },

  // 현재 사용자의 profile row {id, email, role} 반환. 없거나 비로그인이면 null.
  async getProfile() {
    const user = await window.auth.getUser();
    if (!user) return null;
    const { data, error } = await window.sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    if (error) {
      console.error("[auth.getProfile]", error);
      return null;
    }
    return data ?? null;
  },
};
