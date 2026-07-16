import { formatCurrencyShort, formatCurrency } from '@utils/formatters';

export { formatCurrencyShort as formatCurrency, formatCurrency as formatCurrencyFull };

export const CHART_COLORS = {
  primary: '#1a2f5e',
  gold: '#f0a500',
  green: '#10b981',
  red: '#ef4444',
  orange: '#f59e0b',
  blue: '#3b82f6',
  gray: '#94a3b8',
};

export const LOAI_QUY_COLORS = {
  'Hoc bong': '#f0a500',
  'Tu thien': '#1a2f5e',
  'Y te': '#10b981',
  'Moi truong': '#3b82f6',
  Khac: '#94a3b8',
};

export const LOAI_QUY_LABEL = {
  'Hoc bong': 'Học bổng',
  'Tu thien': 'Từ thiện',
  'Y te': 'Y tế',
  'Moi truong': 'Môi trường',
  Khac: 'Khác',
};

export const formatDateShort = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN');
};

export const formatDateInput = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getRangeByPeriod = (period, customRange) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  if (period === 'thang_nay') {
    return {
      tu: new Date(y, m, 1),
      den: new Date(y, m + 1, 0, 23, 59, 59),
    };
  }
  if (period === 'quy_nay') {
    const qStart = Math.floor(m / 3) * 3;
    return {
      tu: new Date(y, qStart, 1),
      den: new Date(y, qStart + 3, 0, 23, 59, 59),
    };
  }
  if (period === 'nam_nay') {
    return {
      tu: new Date(y, 0, 1),
      den: new Date(y, 11, 31, 23, 59, 59),
    };
  }
  if (period === 'tuy_chon') {
    return {
      tu: customRange?.tu ? new Date(customRange.tu) : new Date(y, m, 1),
      den: customRange?.den
        ? new Date(customRange.den + 'T23:59:59')
        : new Date(y, m + 1, 0, 23, 59, 59),
    };
  }
  return { tu: new Date(y, m, 1), den: new Date(y, m + 1, 0, 23, 59, 59) };
};

export const getPreviousRange = (range) => {
  const tu = new Date(range.tu);
  const den = new Date(range.den);
  const diff = den.getTime() - tu.getTime();
  const prevDen = new Date(tu.getTime() - 1);
  const prevTu = new Date(prevDen.getTime() - diff);
  return { tu: prevTu, den: prevDen };
};

export const isInRange = (date, range) => {
  if (!date) return false;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() >= range.tu.getTime() && d.getTime() <= range.den.getTime();
};

export const labelForRange = (period, range) => {
  if (period === 'thang_nay') {
    return `Tháng ${range.tu.getMonth() + 1}/${range.tu.getFullYear()}`;
  }
  if (period === 'quy_nay') {
    const q = Math.floor(range.tu.getMonth() / 3) + 1;
    return `Quý ${q}/${range.tu.getFullYear()}`;
  }
  if (period === 'nam_nay') {
    return `Năm ${range.tu.getFullYear()}`;
  }
  return `${formatDateShort(range.tu)} → ${formatDateShort(range.den)}`;
};

export const monthLabel = (date) => `T${date.getMonth() + 1}`;
