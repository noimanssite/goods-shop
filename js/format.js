// 표시 포맷 유틸. 의존성 없음.

window.format = {
  // 숫자를 원화 표기로 변환. 예: 12900 -> "₩12,900"
  won(n) {
    const num = Number(n) || 0;
    return "₩" + new Intl.NumberFormat("ko-KR").format(num);
  },

  // ISO 문자열을 로컬 시간 기준 "YYYY-MM-DD HH:MM" 으로 변환.
  date(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    const pad = function pad(n) { return String(n).padStart(2, "0"); };
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day} ${hh}:${mm}`;
  },
};
