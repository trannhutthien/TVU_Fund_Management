import { formatCurrency, getInitial, daysUntil } from '@utils/formatters';

export { formatCurrency, getInitial, daysUntil };

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

export const monthLabel = (date) => `T${date.getMonth() + 1}`;
