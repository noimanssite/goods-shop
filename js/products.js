// 홈(상품 목록) 페이지 로직
(function () {
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    // 헤더 인증 네비게이션 렌더링 (실패해도 상품 목록은 계속 진행)
    try {
      if (window.nav && typeof window.nav.renderHeader === 'function') {
        await window.nav.renderHeader();
      }
    } catch (e) {
      // 헤더 렌더링 실패는 무시
    }

    await loadProducts();
  }

  async function loadProducts() {
    const grid = document.getElementById('product-grid');
    const empty = document.getElementById('empty');
    const errorBanner = document.getElementById('error-banner');

    if (!grid) return;

    try {
      const { data, error } = await window.sb
        .from('products')
        .select('*')
        .order('id');

      if (error) {
        showError(errorBanner, '상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }

      const products = Array.isArray(data) ? data : [];
      if (products.length === 0) {
        if (empty) empty.hidden = false;
        return;
      }

      grid.innerHTML = products.map(renderCard).join('');
      const countEl = document.getElementById('product-count');
      if (countEl) countEl.textContent = `${products.length}개의 상품`;
    } catch (err) {
      showError(errorBanner, '상품을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  function renderCard(p) {
    const id = encodeURIComponent(p.id);
    const name = escapeHtml(p.name || '');
    const imageUrl = escapeHtml(p.image_url || '');
    const price = window.format && typeof window.format.won === 'function'
      ? window.format.won(p.price)
      : `₩${p.price}`;
    return `
      <div class="card">
        <a href="checkout.html?productId=${id}">
          <img src="${imageUrl}" alt="${name}" loading="lazy">
          <div class="card-body">
            <div class="card-name name">${name}</div>
            <div class="card-price price">${price}</div>
          </div>
        </a>
      </div>
    `;
  }

  function showError(el, text) {
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
  }

  // 사용자/외부 데이터 문자열을 HTML에 안전하게 삽입하기 위한 헬퍼
  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
