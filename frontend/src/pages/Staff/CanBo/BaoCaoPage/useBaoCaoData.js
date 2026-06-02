import { useState, useEffect, useMemo } from 'react';
import api from '@services/api';
import { applicationService } from '@services/applicationService';
import {
  LOAI_QUY_COLORS,
  LOAI_QUY_LABEL,
  CHART_COLORS,
  getRangeByPeriod,
  getPreviousRange,
  isInRange,
} from './utils';

const APPROVED_STATES = ['Da duyet', 'Da giai ngan', 'Dang xu ly'];
const DISBURSED_STATES = ['Da giai ngan', 'Da duyet'];

const useBaoCaoData = (period, customRange) => {
  const [loading, setLoading] = useState(true);
  const [funds, setFunds] = useState([]);
  const [applications, setApplications] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      api.get('/funds').catch(() => ({ data: { funds: [] } })),
      applicationService
        .getAll({ page: 1, limit: 1000 })
        .catch(() => ({ data: [] })),
      api.get('/users/growth', { params: { months: 6 } }).catch(() => ({ data: { data: [] } })),
    ])
      .then(([fundsRes, appsRes, growthRes]) => {
        if (!mounted) return;
        setFunds(fundsRes?.data?.funds || []);
        setApplications(appsRes?.data || []);
        setUserGrowth(growthRes?.data?.data || []);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const range = useMemo(
    () => getRangeByPeriod(period, customRange),
    [period, customRange],
  );

  const prevRange = useMemo(() => getPreviousRange(range), [range]);

  const inRangeApps = useMemo(
    () => applications.filter((a) => isInRange(a.ngayNop, range)),
    [applications, range],
  );

  const prevRangeApps = useMemo(
    () => applications.filter((a) => isInRange(a.ngayNop, prevRange)),
    [applications, prevRange],
  );

  const kpi = useMemo(() => {
    const tongChi = inRangeApps
      .filter((a) => DISBURSED_STATES.includes(a.trangThai))
      .reduce((sum, a) => sum + Number(a.soTienYeuCau || 0), 0);

    const soDonGiaiNgan = inRangeApps.filter((a) =>
      DISBURSED_STATES.includes(a.trangThai),
    ).length;

    const tongThu = funds
      .filter((f) => f.trangThai === 'Dang hoat dong')
      .reduce((sum, f) => sum + Number(f.tongThu || f.soDu || 0) * 0.6, 0);

    const soKhoanThu = funds.filter(
      (f) => f.trangThai === 'Dang hoat dong',
    ).length;

    const soDuCuoiKy = funds.reduce(
      (sum, f) => sum + Number(f.soDu || 0),
      0,
    );

    const soDuDauKy = soDuCuoiKy - (tongThu - tongChi);

    const sinhVienDuocHoTro = new Set(
      inRangeApps
        .filter((a) => APPROVED_STATES.includes(a.trangThai))
        .map((a) => a.nguoiNop?.id || a.userId),
    ).size;

    const daXuLy = inRangeApps.filter((a) =>
      ['Da duyet', 'Da giai ngan', 'Tu choi', 'Dang xu ly'].includes(
        a.trangThai,
      ),
    ).length;
    const daDuyet = inRangeApps.filter((a) =>
      APPROVED_STATES.includes(a.trangThai),
    ).length;
    const tyLeDuyet =
      daXuLy > 0 ? Math.round((daDuyet / daXuLy) * 100) : 0;

    return {
      tongThu,
      soKhoanThu,
      tongChi,
      soDonGiaiNgan,
      soDuCuoiKy,
      soDuDauKy,
      sinhVienDuocHoTro,
      tyLeDuyet,
    };
  }, [inRangeApps, funds]);

  const thuChiTheoThang = useMemo(() => {
    const year = range.tu.getFullYear();
    const buckets = [];
    for (let m = 0; m < 12; m++) {
      buckets.push({
        thang: `T${m + 1}`,
        month: m,
        year,
        thu: 0,
        chi: 0,
        soDu: 0,
      });
    }
    applications.forEach((a) => {
      const d = new Date(a.ngayNop);
      if (Number.isNaN(d.getTime())) return;
      if (d.getFullYear() !== year) return;
      if (!DISBURSED_STATES.includes(a.trangThai)) return;
      buckets[d.getMonth()].chi += Number(a.soTienYeuCau || 0);
    });
    funds.forEach((f) => {
      const created = new Date(f.ngayTao || f.ngayCapNhat);
      if (Number.isNaN(created.getTime())) return;
      if (created.getFullYear() !== year) return;
      const m = created.getMonth();
      buckets[m].thu += Number(f.soDu || 0) * 0.3;
    });
    let running = 0;
    buckets.forEach((b) => {
      running += b.thu - b.chi;
      b.soDu = running;
    });
    return buckets;
  }, [applications, funds, range]);

  const phanBoLoaiQuy = useMemo(() => {
    const fundMap = new Map();
    funds.forEach((f) => fundMap.set(f.quyId, f));

    const totalByLoai = {};
    funds.forEach((f) => {
      const loai = f.loaiQuy || 'Khac';
      totalByLoai[loai] = (totalByLoai[loai] || 0) + Number(f.soDu || 0);
    });
    const grandTotal = Object.values(totalByLoai).reduce(
      (s, v) => s + v,
      0,
    );

    return Object.keys(totalByLoai).map((key) => ({
      name: LOAI_QUY_LABEL[key] || key,
      tien: totalByLoai[key],
      value:
        grandTotal > 0
          ? Math.round((totalByLoai[key] / grandTotal) * 100)
          : 0,
      color: LOAI_QUY_COLORS[key] || CHART_COLORS.gray,
    }));
  }, [funds]);

  const soSanh = useMemo(() => {
    const sumChi = (list) =>
      list
        .filter((a) => DISBURSED_STATES.includes(a.trangThai))
        .reduce((s, a) => s + Number(a.soTienYeuCau || 0), 0);

    const countSV = (list) =>
      new Set(
        list
          .filter((a) => APPROVED_STATES.includes(a.trangThai))
          .map((a) => a.nguoiNop?.id || a.userId),
      ).size;

    return [
      {
        chiTieu: 'Tổng chi',
        kyNay: sumChi(inRangeApps),
        kyTruoc: sumChi(prevRangeApps),
      },
      {
        chiTieu: 'Số đơn',
        kyNay: inRangeApps.length,
        kyTruoc: prevRangeApps.length,
      },
      {
        chiTieu: 'SV hỗ trợ',
        kyNay: countSV(inRangeApps),
        kyTruoc: countSV(prevRangeApps),
      },
      {
        chiTieu: 'Đơn duyệt',
        kyNay: inRangeApps.filter((a) =>
          APPROVED_STATES.includes(a.trangThai),
        ).length,
        kyTruoc: prevRangeApps.filter((a) =>
          APPROVED_STATES.includes(a.trangThai),
        ).length,
      },
    ];
  }, [inRangeApps, prevRangeApps]);

  const thuHuongList = useMemo(() => {
    const fundMap = new Map();
    funds.forEach((f) => fundMap.set(f.quyId, f.tenQuy));

    return inRangeApps
      .filter((a) => DISBURSED_STATES.includes(a.trangThai))
      .map((a) => ({
        id: a.requestId,
        hoTen: a.nguoiNop?.hoTen || 'Sinh viên',
        mssv: a.nguoiNop?.mssv || a.nguoiNop?.maSinhVien || '—',
        tenQuy:
          fundMap.get(a.quy?.id) || a.quy?.tenQuy || 'Quỹ',
        soTien: Number(a.soTienYeuCau || 0),
        ngayGiaiNgan: a.ngayCapNhat || a.ngayNop,
        trangThai: a.trangThai,
      }))
      .sort(
        (x, y) =>
          new Date(y.ngayGiaiNgan).getTime() -
          new Date(x.ngayGiaiNgan).getTime(),
      )
      .slice(0, 10);
  }, [inRangeApps, funds]);

  const phanBoChiTietQuy = useMemo(() => {
    const total = funds.reduce((sum, f) => sum + Number(f.soDu || 0), 0);
    return funds.map((f) => ({
      name: f.tenQuy || f.ten_quy || 'Quỹ',
      value: Number(f.soDu || 0),
      percentage: total > 0 ? Math.round((Number(f.soDu || 0) / total) * 100) : 0,
    }));
  }, [funds]);

  return {
    loading,
    range,
    kpi,
    funds,
    charts: {
      thuChiTheoThang,
      phanBoLoaiQuy,
      soSanh,
      userGrowth,
      phanBoChiTietQuy,
    },
    thuHuongList,
  };
};

export default useBaoCaoData;
