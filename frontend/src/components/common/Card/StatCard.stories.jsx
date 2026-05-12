import React, { useState } from 'react';
import StatCard from './StatCard';

/**
 * StatCard Examples / Stories
 * Demo các variants của StatCard component
 */

// Icon examples
const MoneyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const StatCardExamples = () => {
  const [loading, setLoading] = useState(false);

  const handleCardClick = (title) => {
    alert(`Clicked: ${title}`);
  };

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div style={{ padding: '40px', background: '#EEF0F5', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '32px', fontFamily: 'Plus Jakarta Sans', color: '#0F172A' }}>
        StatCard Component Examples
      </h1>

      {/* Basic Cards */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Basic Stats Cards
        </h2>
        <div className="stat-card-grid">
          <StatCard
            title="Tổng Quỹ"
            value="45,234,567 đ"
            icon={<MoneyIcon />}
            iconBgColor="blue"
            trend="up"
            trendValue="+12.5%"
            subtitle="So với tháng trước"
          />

          <StatCard
            title="Sinh Viên"
            value="1,234"
            icon={<UsersIcon />}
            iconBgColor="purple"
            trend="up"
            trendValue="+8.2%"
            subtitle="Đang hoạt động"
          />

          <StatCard
            title="Đơn Yêu Cầu"
            value="156"
            icon={<FileIcon />}
            iconBgColor="yellow"
            trend="down"
            trendValue="-3.1%"
            subtitle="Chờ duyệt"
          />

          <StatCard
            title="Đã Phê Duyệt"
            value="89"
            icon={<CheckIcon />}
            iconBgColor="green"
            trend="up"
            trendValue="+15.3%"
            subtitle="Trong tháng này"
          />
        </div>
      </section>

      {/* Clickable Cards */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Clickable Cards (Có thể click)
        </h2>
        <div className="stat-card-grid">
          <StatCard
            title="Tổng Thu"
            value="123,456,789 đ"
            icon={<TrendingUpIcon />}
            iconBgColor="blue"
            trend="up"
            trendValue="+25.4%"
            subtitle="Xem chi tiết"
            onClick={() => handleCardClick('Tổng Thu')}
          />

          <StatCard
            title="Nhà Tài Trợ"
            value="45"
            icon={<HeartIcon />}
            iconBgColor="red"
            trend="up"
            trendValue="+5"
            subtitle="Xem danh sách"
            onClick={() => handleCardClick('Nhà Tài Trợ')}
          />
        </div>
      </section>

      {/* Without Trend */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Without Trend (Không có xu hướng)
        </h2>
        <div className="stat-card-grid">
          <StatCard
            title="Tổng Giao Dịch"
            value="567"
            icon={<MoneyIcon />}
            iconBgColor="teal"
            subtitle="Tất cả thời gian"
          />

          <StatCard
            title="Người Dùng"
            value="2,345"
            icon={<UsersIcon />}
            iconBgColor="purple"
          />
        </div>
      </section>

      {/* Loading State */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Loading State
        </h2>
        <button
          onClick={handleLoadingTest}
          style={{
            padding: '10px 20px',
            marginBottom: '20px',
            background: '#3B6FF5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Plus Jakarta Sans',
            fontWeight: 600,
          }}
        >
          Test Loading (2s)
        </button>
        <div className="stat-card-grid">
          <StatCard
            title="Đang Tải"
            value="Loading..."
            icon={<MoneyIcon />}
            iconBgColor="blue"
            loading={loading}
          />
        </div>
      </section>

      {/* Compact Variant */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Compact Variant (Nhỏ gọn)
        </h2>
        <div className="stat-card-grid">
          <StatCard
            title="Compact Card"
            value="12,345"
            icon={<MoneyIcon />}
            iconBgColor="blue"
            className="stat-card-compact"
          />

          <StatCard
            title="Small Size"
            value="678"
            icon={<UsersIcon />}
            iconBgColor="purple"
            className="stat-card-compact"
          />
        </div>
      </section>

      {/* Large Variant */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Large Variant (Lớn)
        </h2>
        <div className="stat-card-grid">
          <StatCard
            title="Large Card"
            value="999,999,999 đ"
            icon={<MoneyIcon />}
            iconBgColor="blue"
            trend="up"
            trendValue="+50%"
            subtitle="Impressive growth"
            className="stat-card-large"
          />
        </div>
      </section>

      {/* Special Effects */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          Special Effects (Hiệu ứng đặc biệt)
        </h2>
        <div className="stat-card-grid">
          <StatCard
            title="Gradient Border"
            value="Hover me!"
            icon={<TrendingUpIcon />}
            iconBgColor="blue"
            className="stat-card-gradient"
            subtitle="Gradient border effect"
          />

          <StatCard
            title="Glow Effect"
            value="Hover me!"
            icon={<HeartIcon />}
            iconBgColor="red"
            className="stat-card-glow"
            subtitle="Glow shadow effect"
          />
        </div>
      </section>

      {/* All Icon Colors */}
      <section>
        <h2 style={{ marginBottom: '20px', fontSize: '18px', color: '#334155' }}>
          All Icon Colors
        </h2>
        <div className="stat-card-grid">
          <StatCard
            title="Blue"
            value="123"
            icon={<MoneyIcon />}
            iconBgColor="blue"
          />
          <StatCard
            title="Purple"
            value="456"
            icon={<UsersIcon />}
            iconBgColor="purple"
          />
          <StatCard
            title="Yellow"
            value="789"
            icon={<FileIcon />}
            iconBgColor="yellow"
          />
          <StatCard
            title="Teal"
            value="012"
            icon={<CheckIcon />}
            iconBgColor="teal"
          />
          <StatCard
            title="Green"
            value="345"
            icon={<TrendingUpIcon />}
            iconBgColor="green"
          />
          <StatCard
            title="Red"
            value="678"
            icon={<HeartIcon />}
            iconBgColor="red"
          />
        </div>
      </section>
    </div>
  );
};

export default StatCardExamples;
