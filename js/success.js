(function () {
  'use strict';

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderHtml(html) {
    const statusEl = document.getElementById('status');
    const resultEl = document.getElementById('result');
    resultEl.innerHTML = html;
    statusEl.hidden = true;
    resultEl.hidden = false;
  }

  function renderFailure(message) {
    renderHtml(`
      <div class="alert">결제 확인에 실패했습니다: ${escapeHtml(message)}</div>
      <p><a href="index.html" class="btn">상품 목록으로 돌아가기</a></p>
    `);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      window.nav.renderHeader();

      const user = await window.auth.requireUser();
      if (!user) return;

      const params = new URLSearchParams(location.search);
      const paymentKey = params.get('paymentKey');
      const orderId = params.get('orderId');
      const amountRaw = params.get('amount');
      const amount = Number(amountRaw);

      if (!paymentKey || !orderId || !amountRaw || Number.isNaN(amount)) {
        renderFailure('결제 정보가 올바르지 않습니다.');
        return;
      }

      const pendingRaw = sessionStorage.getItem('pending_order');
      if (!pendingRaw) {
        renderFailure('주문 정보를 찾을 수 없습니다.');
        return;
      }

      let pending;
      try {
        pending = JSON.parse(pendingRaw);
      } catch (e) {
        renderFailure('주문 정보가 손상되었습니다.');
        return;
      }

      if (!pending || pending.orderId !== orderId) {
        renderFailure('주문번호가 일치하지 않습니다.');
        return;
      }

      const { data: { session } } = await window.sb.auth.getSession();
      if (!session) {
        renderFailure('로그인 세션이 만료되었습니다.');
        return;
      }

      const endpoint = `${window.APP_CONFIG.SUPABASE_URL}/functions/v1/confirm-payment`;
      let response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': window.APP_CONFIG.SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount,
            productId: pending.productId,
          }),
        });
      } catch (err) {
        renderFailure((err && err.message) ? err.message : '네트워크 오류');
        return;
      }

      let body;
      try {
        body = await response.json();
      } catch (e) {
        renderFailure('서버 응답을 해석할 수 없습니다.');
        return;
      }

      if (!response.ok || !body || !body.ok) {
        const msg = (body && body.message) ? body.message : `요청 실패 (${response.status})`;
        renderFailure(msg);
        return;
      }

      sessionStorage.removeItem('pending_order');

      renderHtml(`
        <div class="alert success">결제가 완료되었습니다.</div>
        <p>주문번호: ${escapeHtml(orderId)}</p>
        <p>금액: ${escapeHtml(window.format.won(amount))}</p>
        <p>
          <a href="orders.html" class="btn">내 결제 내역 보기</a>
          <a href="index.html" class="btn btn-secondary">상품 목록으로</a>
        </p>
      `);
    } catch (err) {
      renderFailure((err && err.message) ? err.message : '알 수 없는 오류');
    }
  });
})();
