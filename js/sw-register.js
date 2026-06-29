// Service Worker 등록 — turingshop PWA
// load 이벤트 이후 등록해서 초기 페이지 로드를 막지 않음.

(function () {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', function () {
    // 상대경로 './sw.js'로 등록 → GitHub Pages 서브경로(/goods-shop/) 자동 대응
    navigator.serviceWorker.register('./sw.js').then(
      function (reg) {
        // 업데이트 감지 (선택): 새 SW가 대기 중이면 콘솔에 안내
        if (reg && reg.waiting) {
          console.info('[SW] 업데이트 대기 중 — 모든 탭 닫고 다시 열면 적용됨');
        }
      },
      function (err) {
        console.warn('[SW] 등록 실패:', err);
      }
    );
  });
})();
