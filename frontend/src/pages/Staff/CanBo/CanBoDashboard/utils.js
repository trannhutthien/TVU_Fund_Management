export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0đ';
  const n = Number(amount);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ đ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)} triệu đ`;
  return n.toLocaleString('vi-VN') + 'đ';
};

export const formatDateShort = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN');
};

export const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

export const getInitial = (name) => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};

export const daysUntil = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const monthLabel = (date) => `T${date.getMonth() + 1}`;
