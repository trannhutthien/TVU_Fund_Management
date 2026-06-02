import { useState, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineDocumentArrowDown,
  HiOutlineDocumentChartBar,
  HiOutlineHandRaised,
  HiOutlineAcademicCap,
  HiOutlineBuildingLibrary,
  HiOutlineDocument,
  HiOutlineTableCells,
  HiOutlineEye,
  HiOutlineArrowDownTray,
  HiCheckCircle,
  HiOutlineUsers,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import api from '@services/api';
import { formatDateInput } from '../utils';
import styles from './XuatBaoCaoPanel.module.scss';

const BAO_CAO_TYPES = [
  {
    id: 'thu_chi_tong_hop',
    label: 'Thu Chi Tổng hợp',
    icon: HiOutlineDocumentChartBar,
    desc: 'Báo cáo tổng thu, tổng chi và số dư theo kỳ',
  },
  {
    id: 'danh_sach_nha_tai_tro',
    label: 'Danh sách Nhà tài trợ',
    icon: HiOutlineHandRaised,
    desc: 'Hồ sơ liên hệ và thống kê đóng góp tích lũy',
  },
  {
    id: 'danh_sach_thu_huong',
    label: 'Danh sách Thụ hưởng',
    icon: HiOutlineAcademicCap,
    desc: 'Sinh viên đã được giải ngân hỗ trợ trong kỳ',
  },
  {
    id: 'bao_cao_quy',
    label: 'Báo cáo theo Quỹ',
    icon: HiOutlineBuildingLibrary,
    desc: 'Tình trạng thu chi của từng quỹ riêng lẻ',
  },
  {
    id: 'bao_cao_nguoi_dung',
    label: 'Báo cáo Người dùng',
    icon: HiOutlineUsers,
    desc: 'Tổng số người dùng và chi tiết đăng ký mới',
  },
  {
    id: 'bao_cao_de_xuat',
    label: 'Báo cáo Đề xuất Hỗ trợ',
    icon: HiOutlineClipboardDocumentList,
    desc: 'Danh sách đề xuất, số tiền và trạng thái xét duyệt',
  },
];

const FORMATS = [
  {
    id: 'docx',
    label: 'Word (.docx)',
    icon: HiOutlineDocument,
    recommended: true,
  },
  {
    id: 'xlsx',
    label: 'Excel (.xlsx)',
    icon: HiOutlineTableCells,
    recommended: false,
  },
];

const TYPE_LABEL_MAP = BAO_CAO_TYPES.reduce((map, t) => {
  map[t.id] = t.label;
  return map;
}, {});

const XuatBaoCaoPanel = ({ funds, range, rangeLabel }) => {
  const [selectedTypes, setSelectedTypes] = useState(['thu_chi_tong_hop']);
  const [selectedQuyId, setSelectedQuyId] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('docx');
  const [exporting, setExporting] = useState(false);

  const previewText = useMemo(() => {
    const typesLabel = selectedTypes.map(id => TYPE_LABEL_MAP[id] || id).join(', ');
    const fundLabel = selectedQuyId
      ? funds.find((f) => String(f.quyId) === String(selectedQuyId))?.tenQuy
      : 'Tất cả quỹ';
    return `${typesLabel} — ${fundLabel} — ${rangeLabel}`;
  }, [selectedTypes, selectedQuyId, funds, rangeLabel]);

  const handleToggleType = (id) => {
    setSelectedTypes((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) {
          toast.warning('Bạn phải chọn ít nhất một loại báo cáo');
          return prev;
        }
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handlePreview = () => {
    toast.info('Tính năng xem trước đang được phát triển');
  };

  const handleExport = async () => {
    if (selectedTypes.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một loại báo cáo');
      return;
    }
    setExporting(true);
    try {
      const payload = {
        loai_bao_cao: selectedTypes,
        quy_id: selectedQuyId || null,
        tu_ngay: formatDateInput(range.tu),
        den_ngay: formatDateInput(range.den),
        dinh_dang: selectedFormat,
      };

      const response = await api.post('/bao-cao/xuat', payload, {
        responseType: 'blob',
      });

      let mimeType = 'application/octet-stream';
      if (selectedTypes.length > 1) {
        mimeType = 'application/zip';
      } else {
        mimeType = selectedFormat === 'docx'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let fileName = '';
      const disposition = response.headers?.['content-disposition'];
      if (disposition && disposition.includes('attachment')) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
        }
      }

      if (!fileName) {
        const ts = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        if (selectedTypes.length > 1) {
          fileName = `BaoCao_TongHop_${ts}.zip`;
        } else {
          fileName = `BaoCao_${selectedTypes[0]}_${ts}.${selectedFormat}`;
        }
      }

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Xuất báo cáo thành công!');
    } catch (err) {
      const message =
        err?.response?.status === 404
          ? 'API xuất báo cáo chưa được cấu hình ở backend'
          : 'Có lỗi khi xuất báo cáo, vui lòng thử lại';
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={styles.panel}>
      <header className={styles.head}>
        <div className={styles.headIcon}>
          <HiOutlineDocumentArrowDown />
        </div>
        <div>
          <h2 className={styles.title}>Xuất Báo cáo</h2>
          <p className={styles.subtitle}>
            Tạo file Word/Excel theo bộ lọc bên dưới
          </p>
        </div>
      </header>

      <section className={styles.step}>
        <div className={styles.stepLabel}>
          <span className={styles.stepNumber}>1</span>
          LOẠI BÁO CÁO
        </div>
        <div className={styles.typeGrid}>
          {BAO_CAO_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = selectedTypes.includes(type.id);
            return (
              <button
                type="button"
                key={type.id}
                className={`${styles.typeCard} ${
                  isActive ? styles.typeCardActive : ''
                }`}
                onClick={() => handleToggleType(type.id)}
              >
                <div className={styles.typeIcon}>
                  <Icon />
                </div>
                <div className={styles.typeText}>
                  <div className={styles.typeLabel}>{type.label}</div>
                  <div className={styles.typeDesc}>{type.desc}</div>
                </div>
                {isActive && (
                  <HiCheckCircle className={styles.typeCheck} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.step}>
        <div className={styles.stepLabel}>
          <span className={styles.stepNumber}>2</span>
          PHẠM VI XUẤT
        </div>
        <div className={styles.scopeRow}>
          <div className={styles.scopeField}>
            <label className={styles.scopeLabel}>Quỹ</label>
            <select
              className={styles.scopeSelect}
              value={selectedQuyId}
              onChange={(e) => setSelectedQuyId(e.target.value)}
            >
              <option value="">Tất cả quỹ</option>
              {funds.map((f) => (
                <option key={f.quyId} value={f.quyId}>
                  {f.tenQuy}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.scopeField}>
            <label className={styles.scopeLabel}>Kỳ báo cáo</label>
            <div className={styles.scopePeriod}>{rangeLabel}</div>
          </div>
        </div>
      </section>

      <section className={styles.step}>
        <div className={styles.stepLabel}>
          <span className={styles.stepNumber}>3</span>
          ĐỊNH DẠNG XUẤT
        </div>
        <div className={styles.formatRow}>
          {FORMATS.map((fmt) => {
            const Icon = fmt.icon;
            const isActive = selectedFormat === fmt.id;
            return (
              <button
                type="button"
                key={fmt.id}
                className={`${styles.formatBtn} ${
                  isActive ? styles.formatBtnActive : ''
                }`}
                onClick={() => setSelectedFormat(fmt.id)}
              >
                <Icon className={styles.formatIcon} />
                <span>{fmt.label}</span>
                {fmt.recommended && (
                  <span className={styles.recommendedBadge}>
                    Khuyên dùng
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div className={styles.preview}>
        <div className={styles.previewLabel}>Sẽ xuất:</div>
        <div className={styles.previewText}>{previewText}</div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="ghost"
          leftIcon={<HiOutlineEye />}
          onClick={handlePreview}
        >
          Xem trước
        </Button>
        <Button
          variant="primary"
          leftIcon={<HiOutlineArrowDownTray />}
          onClick={handleExport}
          loading={exporting}
          disabled={exporting}
        >
          Xuất báo cáo
        </Button>
      </div>
    </div>
  );
};

export default XuatBaoCaoPanel;
