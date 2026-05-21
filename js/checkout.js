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

  function showError(message) {
    const errEl = document.getElementById('error');
    if (!errEl) return;
    errEl.textContent = message || '오류가 발생했습니다.';
    errEl.hidden = false;
  }

  function disableUi() {
    const btn = document.getElementById('pay-btn');
    if (btn) btn.disabled = true;
  }

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      window.nav.renderHeader();

      const user = await window.auth.requireUser();
      if (!user) return;

      const params = new URLSearchParams(location.search);
      const productIdRaw = params.get('productId');
      const productId = Number(productIdRaw);
      if (!productIdRaw || Number.isNaN(productId)) {
        disableUi();
        showError('잘못된 상품입니다.');
        return;
      }

      const { data: product, error: productError } = await window.sb
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      if (productError) {
        disableUi();
        showError('상품 정보를 불러오지 못했습니다: ' + productError.message);
        return;
      }
      if (!product) {
        disableUi();
        showError('잘못된 상품입니다.');
        return;
      }

      const productInfoEl = document.getElementById('product-info');
      productInfoEl.innerHTML = `
        <div class="product-info">
          <img src="${escapeHtml(product.image_url)}" alt="${escapeHtml(product.name)}">
          <div>
            <div class="product-info-name">${escapeHtml(product.name)}</div>
            <div class="product-info-price">${escapeHtml(window.format.won(product.price))}</div>
          </div>
        </div>
      `;

      const tossPayments = TossPayments(window.APP_CONFIG.TOSS_CLIENT_KEY);
      const widgets = tossPayments.widgets({ customerKey: user.id });
      await widgets.setAmount({ currency: 'KRW', value: product.price });
      await Promise.all([
        widgets.renderPaymentMethods({ selector: '#payment-method' }),
        widgets.renderAgreement({ selector: '#agreement' }),
      ]);

      const payBtn = document.getElementById('pay-btn');
      payBtn.disabled = false;
      payBtn.addEventListener('click', async () => {
        payBtn.disabled = true;
        const errEl = document.getElementById('error');
        if (errEl) errEl.hidden = true;
        try {
          const orderId = 'order_' + crypto.randomUUID();
          sessionStorage.setItem(
            'pending_order',
            JSON.stringify({ orderId, productId: product.id, amount: product.price })
          );
          await widgets.requestPayment({
            orderId,
            orderName: product.name,
            successUrl: new URL('success.html', location.href).toString(),
            failUrl: new URL('fail.html', location.href).toString(),
            customerEmail: user.email,
          });
        } catch (err) {
          showError((err && err.message) ? err.message : '결제를 시작할 수 없습니다.');
          payBtn.disabled = false;
        }
      });
    } catch (err) {
      disableUi();
      showError((err && err.message) ? err.message : '결제 페이지를 불러오지 못했습니다.');
    }
  });
})();
