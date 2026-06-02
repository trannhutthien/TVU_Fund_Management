import { useState } from 'react';
import {
  HiOutlineCalendarDays,
  HiOutlineChartBar,
} from 'react-icons/hi2';
import useBaoCaoData from './useBaoCaoData';
import { labelForRange } from './utils';
import BaoCaoKPIBar from './BaoCaoKPIBar/BaoCaoKPIBar';
import BieuDoThuChi from './BieuDoThuChi/BieuDoThuChi';
import BieuDoPhanBo from './BieuDoPhanBo/BieuDoPhanBo';
import BieuDoSoSanh from './BieuDoSoSanh/BieuDoSoSanh';
import BieuDoUserGrowth from './BieuDoUserGrowth/BieuDoUserGrowth';
import BieuDoQuyChiTiet from './BieuDoQuyChiTiet/BieuDoQuyChiTiet';
import BangThuHuong from './BangThuHuong/BangThuHuong';
import XuatBaoCaoPanel from './XuatBaoCaoPanel/XuatBaoCaoPanel';
import styles from './BaoCaoPage.module.scss';

const PERIOD_OPTIONS = [
  { id: 'thang_nay', label: 'Tháng này' },
  { id: 'quy_nay', label: 'Quý này' },
  { id: 'nam_nay', label: 'Năm này' },
  { id: 'tuy_chon', label: 'Tùy chọn' },
];

const BaoCaoPage = () => {
  const [period, setPeriod] = useState('thang_nay');
  const [customRange, setCustomRange] = useState({ tu: '', den: '' });
  const [chartYear, setChartYear] = useState(new Date().getFullYear());

  const { loading, range, kpi, funds, charts, thuHuongList } = useBaoCaoData(
    period,
    customRange,
  );

  const rangeLabel = labelForRange(period, range);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.breadcrumb}>
          <span>Trang chủ</span>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbActive}>Báo cáo & Thống kê</span>
        </div>

        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <HiOutlineChartBar />
            </div>
            <div>
              <h1 className={styles.title}>Báo cáo & Thống kê</h1>
              <p className={styles.subtitle}>
                Tổng quan thu chi và xuất báo cáo theo kỳ — {rangeLabel}
              </p>
            </div>
          </div>

          <div className={styles.periodPicker}>
            <HiOutlineCalendarDays className={styles.periodIcon} />
            {PERIOD_OPTIONS.map((opt) => {
              const isActive = period === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.periodBtn} ${
                    isActive ? styles.periodBtnActive : ''
                  }`}
                  onClick={() => setPeriod(opt.id)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </header>

        {period === 'tuy_chon' && (
          <div className={styles.customRange}>
            <div className={styles.customField}>
              <label className={styles.customLabel}>Từ ngày</label>
              <input
                type="date"
                className={styles.customInput}
                value={customRange.tu}
                onChange={(e) =>
                  setCustomRange((p) => ({ ...p, tu: e.target.value }))
                }
              />
            </div>
            <span className={styles.customArrow}>→</span>
            <div className={styles.customField}>
              <label className={styles.customLabel}>Đến ngày</label>
              <input
                type="date"
                className={styles.customInput}
                value={customRange.den}
                onChange={(e) =>
                  setCustomRange((p) => ({ ...p, den: e.target.value }))
                }
              />
            </div>
          </div>
        )}

        <BaoCaoKPIBar kpi={kpi} loading={loading} />

        <div className={styles.row2}>
          <BieuDoThuChi
            data={charts.thuChiTheoThang}
            year={chartYear}
            onChangeYear={setChartYear}
            loading={loading}
          />
        </div>

        <div className={styles.row3}>
          <BieuDoUserGrowth data={charts.userGrowth} loading={loading} />
          <BieuDoQuyChiTiet data={charts.phanBoChiTietQuy} loading={loading} />
        </div>

        <div className={styles.row3}>
          <BieuDoPhanBo data={charts.phanBoLoaiQuy} loading={loading} />
          <BieuDoSoSanh data={charts.soSanh} loading={loading} />
        </div>

        <div className={styles.row4}>
          <BangThuHuong data={thuHuongList} loading={loading} />
        </div>

        <div className={styles.row5}>
          <XuatBaoCaoPanel
            funds={funds}
            period={period}
            range={range}
            rangeLabel={rangeLabel}
          />
        </div>
      </div>
    </div>
  );
};

export default BaoCaoPage;
