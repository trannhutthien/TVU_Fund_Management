import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiOutlineCheckCircle,
  HiOutlineChatBubbleLeftRight,
  HiOutlineEye,
  HiOutlineNoSymbol,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import Dropdown from '@components/common/Dropdown';
import StatusBadge from '@components/common/StatusBadge/StatusBadge';
import Table from '@components/common/Table';
import danhGiaService from '@services/danhGiaService';
import { getInitial } from '@utils/formatters';
import styles from './DanhGiaPage.module.scss';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'Cho duyet', label: 'Chờ duyệt' },
  { value: 'Da duyet', label: 'Đã duyệt' },
  { value: 'Tu choi', label: 'Từ chối' },
];

const getStatusBadge = (status) => {
  if (status === 'Da duyet') {
    return <StatusBadge status="approved" label="Đã duyệt" size="sm" />;
  }
  if (status === 'Tu choi') {
    return <StatusBadge status="rejected" label="Từ chối" size="sm" />;
  }
  return <StatusBadge status="pending" label="Chờ duyệt" size="sm" />;
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('vi-VN');
};

const truncate = (value, max = 50) => {
  if (!value) return '';
  return value.length > max ? `${value.slice(0, max)}...` : value;
};

const DanhGiaPage = () => {
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({
    'Cho duyet': 0,
    'Da duyet': 0,
    'Tu choi': 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchDanhGia = async () => {
    try {
      setLoading(true);
      const response = await danhGiaService.getManagementList({
        pageSize: 100,
        trangThai: statusFilter || undefined,
      });
      if (response?.success) {
        setItems(response.danhgia || response.testimonials || []);
        setCounts(response.counts || {
          'Cho duyet': 0,
          'Da duyet': 0,
          'Tu choi': 0,
        });
      }
    } catch (error) {
      console.error('Error fetching danhgia:', error);
      toast.error(error?.response?.data?.message || 'Không tải được danh sách cảm nhận');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDanhGia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async (item) => {
    try {
      await danhGiaService.updateTrangThai(item.id, { trangThai: 'Da duyet' });
      toast.success('Đã duyệt cảm nhận');
      fetchDanhGia();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể duyệt cảm nhận');
    }
  };

  const handleReject = async (item) => {
    const reason = window.prompt('Nhập lý do từ chối cảm nhận này:');
    if (reason === null) return;
    if (!reason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await danhGiaService.updateTrangThai(item.id, {
        trangThai: 'Tu choi',
        lyDoTuChoi: reason.trim(),
      });
      toast.success('Đã từ chối cảm nhận');
      fetchDanhGia();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể từ chối cảm nhận');
    }
  };

  const handleToggleNoiBat = async (item) => {
    try {
      await danhGiaService.updateNoiBat(item.id, {
        noiBat: !item.noiBat,
        thuTu: item.thuTu || 0,
      });
      toast.success(item.noiBat ? 'Đã tắt nổi bật' : 'Đã bật nổi bật');
      fetchDanhGia();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật nổi bật');
    }
  };

  const columns = [
    {
      key: 'profile',
      label: 'Avatar + Họ tên',
      width: '230px',
      render: (_, row) => (
        <div className={styles.profileCell}>
          <div className={styles.avatar}>
            {row.avatar ? (
              <img src={row.avatar} alt={row.hoTen} />
            ) : (
              <span>{getInitial(row.hoTen)}</span>
            )}
          </div>
          <div>
            <strong>{row.hoTen}</strong>
            <span>{row.nienKhoa || '—'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'khoa',
      label: 'Khoa',
      render: (value) => value || '—',
    },
    {
      key: 'noiDung',
      label: 'Nội dung',
      render: (value) => <span className={styles.contentPreview}>{truncate(value)}</span>,
    },
    {
      key: 'trangThai',
      label: 'Trạng thái',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'ngayTao',
      label: 'Ngày gửi',
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      label: 'Hành động',
      width: '300px',
      render: (_, row) => (
        <div className={styles.actions}>
          <Button
            variant="success"
            size="sm"
            leftIcon={<HiOutlineCheckCircle />}
            disabled={row.trangThai === 'Da duyet'}
            onClick={() => handleApprove(row)}
          >
            Duyệt
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<HiOutlineNoSymbol />}
            disabled={row.trangThai === 'Tu choi'}
            onClick={() => handleReject(row)}
          >
            Từ chối
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<HiOutlineEye />}
            onClick={() => setSelected(row)}
          >
            Xem
          </Button>
          {row.trangThai === 'Da duyet' && (
            <label className={styles.toggle} title="Bật/tắt nổi bật trên Landing Page">
              <input
                type="checkbox"
                checked={!!row.noiBat}
                onChange={() => handleToggleNoiBat(row)}
              />
              <span />
            </label>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.crumbLink}>Trang chủ</Link>
          <span className={styles.crumbSep}>/</span>
          <span>Quản lý cảm nhận</span>
        </div>

        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1>Quản lý Cảm nhận</h1>
            <p>Duyệt, từ chối và chọn cảm nhận nổi bật hiển thị trên Landing Page.</p>
          </div>
          <div className={styles.pendingPill}>
            <HiOutlineChatBubbleLeftRight />
            <span>Chờ duyệt</span>
            <strong>{counts['Cho duyet'] || 0}</strong>
          </div>
        </header>

        <section className={styles.filterBar}>
          <div className={styles.tabs}>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value || 'all'}
                type="button"
                className={statusFilter === option.value ? styles.tabActive : ''}
                onClick={() => setStatusFilter(option.value)}
              >
                <span>{option.label}</span>
                {option.value === 'Cho duyet' && (counts['Cho duyet'] || 0) > 0 && (
                  <strong>{counts['Cho duyet']}</strong>
                )}
              </button>
            ))}
          </div>

          <div className={styles.dropdownWrap}>
            <Dropdown
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value || '')}
              placeholder="Lọc trạng thái"
            />
          </div>
        </section>

        <Table
          columns={columns}
          data={items}
          loading={loading}
          pagination
          pageSize={10}
          emptyText="Chưa có cảm nhận nào"
        />
      </div>

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>{selected.hoTen}</h2>
                <p>{selected.khoa || '—'}{selected.nienKhoa ? ` • ${selected.nienKhoa}` : ''}</p>
              </div>
              {getStatusBadge(selected.trangThai)}
            </div>
            <div className={styles.modalBody}>
              <p>{selected.noiDung}</p>
              {selected.lyDoTuChoi && (
                <div className={styles.rejectReason}>
                  <strong>Lý do từ chối</strong>
                  <span>{selected.lyDoTuChoi}</span>
                </div>
              )}
            </div>
            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Đóng
              </Button>
              <Button
                variant="success"
                disabled={selected.trangThai === 'Da duyet'}
                onClick={() => {
                  handleApprove(selected);
                  setSelected(null);
                }}
              >
                Duyệt
              </Button>
              <Button
                variant="danger"
                disabled={selected.trangThai === 'Tu choi'}
                onClick={() => {
                  handleReject(selected);
                  setSelected(null);
                }}
              >
                Từ chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanhGiaPage;
