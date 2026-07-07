import { useState, useEffect } from 'react';
import { HiCheck } from 'react-icons/hi2';
import { getPublicDisbursementRounds } from '@services/fundService';
import './DisbursementTimeline.scss';

/**
 * DisbursementTimeline Component
 * Hiển thị timeline tiến độ giải ngân của quỹ
 * Chỉ hiển thị khi quỹ có đợt giải ngân trong bảng dotgiaingan
 */
const DisbursementTimeline = ({ fundId, ngayBatDau, ngayKetThuc, compact = false }) => {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fundId) {
      setLoading(false);
      return;
    }

    const fetchRounds = async () => {
      try {
        const response = await getPublicDisbursementRounds(fundId);
        if (response.success && response.data) {
          setRounds(response.data);
        }
      } catch (error) {
        console.error('Error fetching disbursement rounds:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRounds();
  }, [fundId]);

  const formatDateShort = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Chỉ hiển thị khi có đợt giải ngân trong database
  if (loading || !rounds || rounds.length === 0) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sorted = [...rounds].sort((a, b) => (a.thutu || 0) - (b.thutu || 0));

  // Xác định đợt hiện tại (ngày hôm nay nằm trong khoảng ngaydukien của đợt)
  const getCurrentRoundIndex = () => {
    for (let i = 0; i < sorted.length; i++) {
      const round = sorted[i];
      const hasActualDate = round.ngayThucTe && round.trangThai === 'hoanthanh';
      if (hasActualDate) continue; // Đã hoàn thành, bỏ qua

      const roundDate = new Date(round.ngayDuKien);
      if (roundDate <= today) {
        // Đợt này đã tới ngày nhưng chưa hoàn thành → đang trong đợt
        return i;
      }
    }
    // Kiểm tra đợt tiếp theo chưa tới
    for (let i = 0; i < sorted.length; i++) {
      const round = sorted[i];
      const hasActualDate = round.ngayThucTe && round.trangThai === 'hoanthanh';
      if (hasActualDate) continue;
      const roundDate = new Date(round.ngayDuKien);
      if (roundDate > today) {
        return i; // Đợt tiếp theo chưa tới
      }
    }
    return -1;
  };

  const currentRoundIndex = getCurrentRoundIndex();

  const buildMilestones = () => {
    const startDate = ngayBatDau;
    const endDate = ngayKetThuc;

    // Step 0: Mở đơn
    const moDonDate = startDate || sorted[0]?.ngayDuKien;
    const moDonStatus = moDonDate ? (new Date(moDonDate) <= today ? 'completed' : 'upcoming') : 'pending';

    // Round steps
    const roundSteps = sorted.map((round, i) => {
      const hasActualDate = round.ngayThucTe && round.trangThai === 'hoanthanh';
      const isCompleted = hasActualDate;
      const isUpcoming = round.ngayDuKien && new Date(round.ngayDuKien) > today;
      const isCurrent = i === currentRoundIndex && !isCompleted;

      return {
        key: round.dotId,
        label: round.tenDot || `Đợt ${i + 1}`,
        status: isCompleted ? 'completed' : isUpcoming ? 'upcoming' : 'pending',
        date: isCompleted ? round.ngayThucTe : round.ngayDuKien,
        expected: !isCompleted,
        isCurrent
      };
    });

    // Last step: Hoàn thành
    const lastRound = sorted[sorted.length - 1];
    const hoanThanhDate = endDate || lastRound?.ngayThucTe || lastRound?.ngayDuKien;
    const hoanThanhStatus = hoanThanhDate ? (new Date(hoanThanhDate) <= today ? 'completed' : 'pending') : 'pending';

    return [
      { key: 'mo_don', label: 'Mở đơn', date: moDonDate, status: moDonStatus, expected: moDonStatus !== 'completed' && !!moDonDate, isCurrent: false },
      ...roundSteps,
      { key: 'hoan_thanh', label: 'Hoàn thành', date: hoanThanhDate, status: hoanThanhStatus, expected: hoanThanhStatus !== 'completed' && !!hoanThanhDate, isCurrent: false }
    ];
  };

  const milestones = buildMilestones();

  if (compact) {
    // Compact version for FundCard - horizontal dots
    return (
      <div className="dt-compact">
        <div className="dt-compact-label">Tiến độ giải ngân</div>
        <div className="dt-compact-dots">
          {milestones.map((ms, index) => (
            <div key={ms.key} className="dt-compact-step">
              {index < milestones.length - 1 && (
                <div className={`dt-compact-line ${ms.status === 'completed' ? 'dt-compact-line-done' : ''}`} />
              )}
              <div className={`dt-compact-node ${ms.status === 'completed' ? 'dt-node-done' : ms.status === 'upcoming' ? 'dt-node-upcoming' : 'dt-node-pending'} ${ms.isCurrent ? 'dt-node-current' : ''}`}>
                {ms.status === 'completed' ? <HiCheck /> : <span />}
              </div>
            </div>
          ))}
        </div>
        <div className="dt-compact-labels">
          {milestones.map((ms) => (
            <span key={ms.key} className={`dt-compact-text ${ms.status === 'completed' ? 'dt-text-done' : ''} ${ms.isCurrent ? 'dt-text-current' : ''}`}>
              {ms.label}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Full version for FundDetailPage
  return (
    <div className="dt-full">
      <div className="dt-full-title">Tiến độ giải ngân</div>
      <div className="dt-full-timeline">
        {milestones.map((ms, index) => (
          <div key={ms.key} className={`dt-full-step ${ms.status === 'completed' ? 'dt-step-done' : ms.status === 'upcoming' ? 'dt-step-upcoming' : 'dt-step-pending'} ${ms.isCurrent ? 'dt-step-current' : ''}`}>
            {index < milestones.length - 1 && (
              <div className={`dt-full-connector ${ms.status === 'completed' ? 'dt-connector-done' : ''}`} />
            )}
            <div className={`dt-full-node ${ms.isCurrent ? 'dt-full-node-current' : ''}`}>
              {ms.status === 'completed' ? (
                <div className="dt-node-check"><HiCheck /></div>
              ) : ms.isCurrent ? (
                <div className="dt-node-pulse" />
              ) : (
                <div className="dt-node-dot" />
              )}
            </div>
            <div className="dt-full-content">
              <span className={`dt-full-label ${ms.isCurrent ? 'dt-label-current' : ''}`}>{ms.label}</span>
              {ms.status === 'completed' && ms.date && (
                <span className="dt-full-date">{formatDateShort(ms.date)}</span>
              )}
              {ms.expected && ms.date && (
                <span className="dt-full-date dt-date-expected">~{formatDateShort(ms.date)}</span>
              )}
              {ms.isCurrent && (
                <span className="dt-full-badge">Đang triển khai</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisbursementTimeline;
