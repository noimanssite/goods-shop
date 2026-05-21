// 헤더 우측 인증 네비게이션 렌더링 (모든 페이지 공용)
// 사용법: <nav id="nav-auth"></nav> 가 있는 페이지에서 DOMContentLoaded 시 nav.renderHeader() 호출
(function () {
  window.nav = {
    // #nav-auth 컨테이너에 인증 상태에 따른 링크/버튼을 렌더링한다.
    async renderHeader() {
      const container = document.getElementById('nav-auth');
      if (!container) return;

      let profile = null;
      try {
        profile = await window.auth.getProfile();
      } catch (e) {
        profile = null;
      }

      const links = ['<a href="index.html">홈</a>'];
      if (profile) {
        links.push('<a href="orders.html">내 결제 내역</a>');
        if (profile.role === 'admin') {
          links.push('<a href="admin.html">관리자</a>');
        }
        links.push(`<span class="nav-email">${escapeText(profile.email)}</span>`);
        links.push('<button type="button" class="btn btn-link" id="signout-btn">로그아웃</button>');
      } else {
        links.push('<a href="login.html">로그인</a>');
      }
      container.innerHTML = links.join(' ');

      const signout = document.getElementById('signout-btn');
      if (signout) {
        signout.onclick = () => window.auth.signOut();
      }
    },
  };

  // 헤더 내부에 들어가는 이메일 텍스트 보호용 (XSS 방지)
  function escapeText(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
