// 홈 화면 추가 안내 배너
// - Android/Chrome: beforeinstallprompt 활용 (네이티브 프롬프트 호출)
// - iOS Safari: 수동 안내 텍스트 표시 (시스템이 자동 프롬프트 안 띄움)
// - 7일간 dismiss 기억

(function () {
  const DISMISS_KEY = 'pwa-dismissed-until';
  const DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    // 이미 standalone(설치 상태)이면 안내 안 함
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    ) return;

    // 모바일 폭 아니면 안내 안 함 (PC 사용자에겐 불필요)
    if (!window.matchMedia('(max-width: 768px)').matches) return;

    // dismiss 기간 내면 안내 안 함
    const dismissedUntil = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() < dismissedUntil) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    let deferredPrompt = null;

    // Android/Chrome: beforeinstallprompt 캡쳐
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showBanner(false);
    });

    // iOS: 자동 이벤트 없으니 약간 지연 후 직접 표시
    if (isIOS) {
      setTimeout(() => showBanner(true), 1500);
    }

    function showBanner(forIOS) {
      // 중복 생성 방지
      if (document.querySelector('.install-banner')) return;

      const banner = document.createElement('div');
      banner.className = 'install-banner';
      banner.innerHTML = forIOS
        ? `
          <div class="msg">
            <strong>홈 화면에 추가하면 더 편해요</strong>
            <div class="sub">Safari 공유 메뉴 → "홈 화면에 추가"</div>
          </div>
          <div class="actions">
            <button type="button" class="btn btn-secondary" data-act="dismiss">나중에</button>
          </div>
        `
        : `
          <div class="msg">
            <strong>홈 화면에 추가하시겠어요?</strong>
            <div class="sub">앱처럼 빠르게 접속할 수 있어요</div>
          </div>
          <div class="actions">
            <button type="button" class="btn btn-secondary" data-act="dismiss">나중에</button>
            <button type="button" class="btn" data-act="install">추가</button>
          </div>
        `;
      document.body.appendChild(banner);
      // 다음 프레임에 is-open으로 슬라이드인
      requestAnimationFrame(() => banner.classList.add('is-open'));

      banner.addEventListener('click', async (ev) => {
        const act = ev.target.closest('[data-act]')?.dataset?.act;
        if (!act) return;
        if (act === 'install' && deferredPrompt) {
          deferredPrompt.prompt();
          try { await deferredPrompt.userChoice; } catch (_e) {}
          deferredPrompt = null;
          hide();
        } else if (act === 'dismiss') {
          localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_MS));
          hide();
        }
      });

      function hide() {
        banner.classList.remove('is-open');
        setTimeout(() => banner.remove(), 320);
      }
    }
  }
})();
