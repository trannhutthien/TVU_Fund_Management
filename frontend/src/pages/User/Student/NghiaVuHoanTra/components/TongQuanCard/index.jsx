import React from 'react';
import { formatCurrency } from '@utils/formatters';
import styles from './index.module.scss';

const TongQuanCard = ({ tongQuan }) => {
  if (!tongQuan) return null;

  const { tongNhan, daHoanTra, conLai, dangQuaHan } = tongQuan;

  const cards = [
    {
      label: 'Tổng đã nhận',
      value: tongNhan,
      color: '#64748b',
      bg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    },
    {
      label: 'Đã hoàn trả',
      value: daHoanTra,
      color: '#047857',
      bg: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    },
    {
      label: 'Còn phải trả',
      value: conLai,
      color: '#1d4ed8',
      bg: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      highlight: true,
    },
    {
      label: 'Đang quá hạn',
      value: dangQuaHan,
      color: dangQuaHan > 0 ? '#dc2626' : '#94a3b8',
      bg: dangQuaHan > 0
        ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${styles.card} ${card.highlight ? styles.cardHighlight : ''}`}
          style={{ background: card.bg }}
        >
          <span className={styles.label}>{card.label}</span>
          <span className={styles.value} style={{ color: card.color }}>
            {formatCurrency(card.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default TongQuanCard;
