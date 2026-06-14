import { useState, useEffect, useMemo } from 'react';
import api from '@services/api';
import { applicationService } from '@services/applicationService';
import {
  CHART_COLORS,
  LOAI_QUY_COLORS,
  LOAI_QUY_LABEL,
} from './constants';
import { daysUntil, formatCurrency, monthLabel } from './utils';

// Helper status checks matching database values
const isPending = (status) => ['Cho duyet', 'Cho duyet cap 1'].includes(status);

const isProcessing = (status) => [
  'Cho duyet cap 2',
  'Cho duyet cap 3',
  'Da duyet cap 1',
  'Da duyet cap 2',
  'Da duyet cap 3',
  'Dang xu ly',
  'Cho giai ngan',
].includes(status);

const isRejected = (status) => [
  'Tu choi',
  'Tu choi cap 1',
  'Tu choi cap 2',
  'Tu choi cap 3',
].includes(status);

const isApproved = (status) => [
  'Da giai ngan',
  'Da duyet',
  'Hoan thanh',
].includes(status);

const useDashboardData = (selectedYear) => {
  const [loading, setLoading] = useState(true);
  const [funds, setFunds] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recentPending, setRecentPending] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      api.get('/funds').catch(() => ({ data: { funds: [] } })),
      applicationService
        .getAll({ page: 1, limit: 500 })
        .catch(() => ({ data: [] })),
      applicationService
        .getAll({ page: 1, limit: 5, trangThai: 'Cho duyet cap 1' })
        .catch(() => ({ data: [] })),
    ])
      .then(([fundsRes, appsRes, pendingRes]) => {
        if (!mounted) return;
        setFunds(fundsRes?.data?.funds || []);
        setApplications(appsRes?.data || []);
        setRecentPending(pendingRes?.data || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const choDuyet = applications.filter(
      (a) => isPending(a.trangThai),
    ).length;
    const dangXuLy = applications.filter(
      (a) => isProcessing(a.trangThai),
    ).length;

    const soQuyHoatDong = funds.filter(
      (f) => f.trangThai === 'Dang hoat dong',
    ).length;
    const tongSoDu = funds
      .filter((f) => f.trangThai === 'Dang hoat dong')
      .reduce((sum, f) => sum + Number(f.soDu || 0), 0);

    const now = new Date();
    const thangNay = now.getMonth();
    const namNay = now.getFullYear();
    const processedThisMonth = applications.filter((a) => {
      const d = new Date(a.ngayNop);
      if (Number.isNaN(d.getTime())) return false;
      return (
        d.getMonth() === thangNay &&
        d.getFullYear() === namNay &&
        !isPending(a.trangThai)
      );
    });

    const daDuyet = processedThisMonth.filter((a) =>
      !isRejected(a.trangThai),
    ).length;
    const daXuLyThangNay = processedThisMonth.length;
    const tyLeDuyet =
      daXuLyThangNay > 0
        ? Math.round((daDuyet / daXuLyThangNay) * 100)
        : 0;

    return {
      choDuyet,
      dangXuLy,
      tongSoDu,
      soQuyHoatDong,
      daXuLyThangNay,
      tyLeDuyet,
    };
  }, [applications, funds]);

  const donTheoThang = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      result.push({
        thang: monthLabel(d),
        month: d.getMonth(),
        year: d.getFullYear(),
        choDuyet: 0,
        dangXuLy: 0,
        tuChoi: 0,
        daGiaiNgan: 0,
      });
    }

    applications.forEach((a) => {
      const d = new Date(a.ngayNop);
      if (Number.isNaN(d.getTime())) return;
      const bucket = result.find(
        (b) => b.month === d.getMonth() && b.year === d.getFullYear(),
      );
      if (!bucket) return;
      if (isPending(a.trangThai)) bucket.choDuyet += 1;
      else if (isProcessing(a.trangThai)) bucket.dangXuLy += 1;
      else if (isRejected(a.trangThai)) bucket.tuChoi += 1;
      else if (isApproved(a.trangThai)) bucket.daGiaiNgan += 1;
    });

    return result;
  }, [applications]);

  const phanBoLoaiQuy = useMemo(() => {
    const fundMap = new Map();
    funds.forEach((f) => fundMap.set(f.quyId, f.loaiQuy));

    const counts = {};
    applications.forEach((a) => {
      const quyId = a.quy?.id;
      const loai = fundMap.get(quyId);
      if (!loai) return;
      counts[loai] = (counts[loai] || 0) + 1;
    });

    return Object.keys(counts).map((key) => ({
      name: LOAI_QUY_LABEL[key] || key,
      value: counts[key],
      color: LOAI_QUY_COLORS[key] || CHART_COLORS.gray,
    }));
  }, [applications, funds]);

  const tienYeuCau = useMemo(() => {
    const result = [];
    for (let m = 0; m < 12; m++) {
      result.push({
        thang: `T${m + 1}`,
        month: m,
        tong: 0,
        daDuyet: 0,
      });
    }
    applications.forEach((a) => {
      const d = new Date(a.ngayNop);
      if (Number.isNaN(d.getTime())) return;
      if (d.getFullYear() !== selectedYear) return;
      const bucket = result[d.getMonth()];
      const amount = Number(a.soTienYeuCau || 0);
      bucket.tong += amount;
      if (isApproved(a.trangThai) || a.trangThai === 'Cho giai ngan' || a.trangThai === 'Da duyet cap 3') {
        bucket.daDuyet += amount;
      }
    });
    return result;
  }, [applications, selectedYear]);

  const topQuy = useMemo(() => {
    const counts = {};
    applications.forEach((a) => {
      const quyId = a.quy?.id;
      if (!quyId) return;
      counts[quyId] = (counts[quyId] || 0) + 1;
    });

    return funds
      .map((f) => ({
        ten:
          (f.tenQuy || '').length > 22
            ? `${f.tenQuy.slice(0, 22)}…`
            : f.tenQuy,
        tenFull: f.tenQuy,
        soDon: counts[f.quyId] || 0,
        soDu: f.soDu,
      }))
      .sort((a, b) => b.soDon - a.soDon)
      .slice(0, 5);
  }, [applications, funds]);

  const warnings = useMemo(() => {
    const list = [];

    funds.forEach((f) => {
      if (f.trangThai !== 'Dang hoat dong') return;

      const d = daysUntil(f.hanNopDon);
      if (d !== null && d >= 0 && d <= 7) {
        list.push({
          type: 'het_han',
          severity: d <= 3 ? 'high' : 'medium',
          message: `Quỹ "${f.tenQuy}" còn ${d} ngày là hết hạn nộp đơn`,
          link: `/can-bo/quy`,
        });
      }

      if (Number(f.soDu || 0) < 1_000_000) {
        list.push({
          type: 'can_tien',
          severity: 'high',
          message: `Quỹ "${f.tenQuy}" sắp cạn tiền (${formatCurrency(
            f.soDu,
          )})`,
          link: `/can-bo/quy`,
        });
      }
    });

    applications.forEach((a) => {
      if (!isPending(a.trangThai)) return;
      const d = daysUntil(
        new Date(new Date(a.ngayNop).getTime() + 7 * 24 * 60 * 60 * 1000),
      );
      if (d !== null && d < 0) {
        list.push({
          type: 'don_lau',
          severity: 'medium',
          message: `Đơn #${a.requestId} của ${
            a.nguoiNop?.hoTen || 'sinh viên'
          } đã chờ duyệt hơn 7 ngày`,
          link: `/xet-duyet/${a.requestId}`,
        });
      }
    });

    return list.slice(0, 8);
  }, [funds, applications]);

  return {
    loading,
    stats,
    recentPending,
    warnings,
    charts: {
      donTheoThang,
      phanBoLoaiQuy,
      tienYeuCau,
      topQuy,
    },
  };
};

export default useDashboardData;
