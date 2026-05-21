function escapeHtml(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shortOrderId(id) {
  if (!id) return '';
  return id.length > 12 ? id.slice(0, 12) + '...' : id;
}

document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  const tableEl = document.getElementById('orders-table');
  const bodyEl = document.getElementById('orders-body');
  const emptyEl = document.getElementById('empty');

  try {
    await auth.requireUser();
    await nav.renderHeader();

    const { data: orders, error } = await sb
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      statusEl.textContent = '결제 내역을 불러오지 못했습니다: ' + error.message;
      return;
    }

    statusEl.hidden = true;

    if (!orders || orders.length === 0) {
      emptyEl.hidden = false;
      return;
    }

    const rows = orders.map(o => {
      const orderId = escapeHtml(shortOrderId(o.toss_order_id));
      const name = escapeHtml(o.product_name);
      const amount = format.won(o.amount);
      const when = format.date(o.created_at);
      return `
        <tr>
          <td data-label="주문번호">${orderId}</td>
          <td data-label="상품명">${name}</td>
          <td data-label="금액">${amount}</td>
          <td data-label="결제일시">${when}</td>
        </tr>
      `;
    }).join('');

    bodyEl.innerHTML = rows;
    tableEl.hidden = false;
  } catch (e) {
    console.error(e);
    statusEl.textContent = '오류가 발생했습니다.';
  }
});
