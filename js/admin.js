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
  const summaryEl = document.getElementById('summary');
  const tableEl = document.getElementById('orders-table');
  const bodyEl = document.getElementById('orders-body');
  const emptyEl = document.getElementById('empty');
  const forbiddenEl = document.getElementById('forbidden');

  try {
    await auth.requireUser();
    const profile = await auth.getProfile();

    // Admin guard
    if (!profile || profile.role !== 'admin') {
      statusEl.hidden = true;
      summaryEl.hidden = true;
      tableEl.hidden = true;
      emptyEl.hidden = true;
      forbiddenEl.hidden = false;
      setTimeout(() => location.replace('index.html'), 2000);
      return;
    }

    await nav.renderHeader();

    // Fetch all orders (RLS lets admin see everything)
    const { data: orders, error: ordersErr } = await sb
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersErr) {
      statusEl.textContent = '결제 내역을 불러오지 못했습니다: ' + ordersErr.message;
      return;
    }

    // Fetch profiles for buyer emails (Option B: two-step join)
    let emailById = {};
    if (orders && orders.length > 0) {
      const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles, error: profErr } = await sb
          .from('profiles')
          .select('id, email')
          .in('id', userIds);
        if (profErr) {
          console.warn('프로필 조회 실패:', profErr.message);
        } else if (profiles) {
          emailById = Object.fromEntries(profiles.map(p => [p.id, p.email]));
        }
      }
    }

    statusEl.hidden = true;

    if (!orders || orders.length === 0) {
      emptyEl.hidden = false;
      return;
    }

    // Summary
    const total = orders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    summaryEl.textContent = `총 결제 건수: ${orders.length}건 / 합계: ${format.won(total)}`;
    summaryEl.hidden = false;

    // Rows
    const rows = orders.map(o => {
      const orderId = escapeHtml(shortOrderId(o.toss_order_id));
      const buyer = escapeHtml(emailById[o.user_id] ?? '(unknown)');
      const name = escapeHtml(o.product_name);
      const amount = format.won(o.amount);
      const when = format.date(o.created_at);
      return `
        <tr>
          <td data-label="주문번호">${orderId}</td>
          <td data-label="구매자">${buyer}</td>
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
