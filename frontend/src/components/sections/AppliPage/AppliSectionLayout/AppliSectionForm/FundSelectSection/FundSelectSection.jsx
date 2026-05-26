import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  HiOutlineBuildingLibrary, 
  HiOutlineInformationCircle,
  HiOutlineCurrencyDollar,
  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlineUsers
} from 'react-icons/hi2';
import Dropdown from '@components/common/Dropdown/Dropdown';
import fundService from '@services/fundService';
import styles from './FundSelectSection.module.scss';

const formatVND = (amount) => {
  if (amount == null) return '—';
  return amount.toLocaleString('vi-VN') + 'đ';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const daysRemaining = (dateStr) => {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};

const FundSelectSection = ({ onFundSelect }) => {
  const [selectedLoaiQuy, setSelectedLoaiQuy] = useState(null);
  const [selectedFundId, setSelectedFundId] = useState(null);
  const [allFunds, setAllFunds] = useState([]); // Tất cả quỹ từ database
  const [loaiQuyOptions, setLoaiQuyOptions] = useState([]); // Danh sách loại quỹ động
  const [fundList, setFundList] = useState([]); // Quỹ đã filter theo loại
  const [fundDetail, setFundDetail] = useState(null);
  const [loadingFunds, setLoadingFunds] = useState(false);

  // Lấy tất cả quỹ từ database khi component mount
  useEffect(() => {
    const fetchAllFunds = async () => {
      setLoadingFunds(true);
      try {
        const response = await fundService.getPublicFunds();
        const funds = response.funds || [];
        setAllFunds(funds);

        // Tạo danh sách loại quỹ động từ dữ liệu thực
        const uniqueTypes = [...new Set(funds.map(f => f.loaiQuy))].filter(Boolean);
        const typeOptions = uniqueTypes.map(type => ({
          value: type,
          label: formatLoaiQuyLabel(type)
        }));
        setLoaiQuyOptions(typeOptions);
      } catch (error) {
        console.error('Lỗi tải danh sách quỹ:', error);
        setAllFunds([]);
        setLoaiQuyOptions([]);
      } finally {
        setLoadingFunds(false);
      }
    };

    fetchAllFunds();
  }, []);

  // Format label cho loại quỹ
  const formatLoaiQuyLabel = (loaiQuy) => {
    const mapping = {
      'Tu thien': 'Từ thiện',
      'Hoc bong': 'Học bổng',
      'Y te': 'Y tế',
      'Moi truong': 'Môi trường',
      'Khac': 'Khác'
    };
    return mapping[loaiQuy] || loaiQuy;
  };

  // Filter quỹ theo loại quỹ được chọn
  useEffect(() => {
    if (!selectedLoaiQuy) {
      setFundList([]);
      setSelectedFundId(null);
      setFundDetail(null);
      return;
    }

    // Filter quỹ theo loại và trạng thái "Đang hoạt động"
    const filtered = allFunds.filter(
      f => f.loaiQuy === selectedLoaiQuy && f.trangThai === 'Dang hoat dong'
    );
    setFundList(filtered);
    setSelectedFundId(null);
    setFundDetail(null);
  }, [selectedLoaiQuy, allFunds]);

  useEffect(() => {
    if (!selectedFundId || fundList.length === 0) {
      setFundDetail(null);
      return;
    }

    const detail = fundList.find((f) => f.quyId === selectedFundId);
    setFundDetail(detail || null);
    onFundSelect?.(detail || null);
  }, [selectedFundId, fundList, onFundSelect]);

  const fundOptions = fundList.map((f) => ({
    value: f.quyId,
    label: f.tenQuy,
    description: formatVND(f.soDu),
  }));

  const soDu = fundDetail?.soDu;
  const hanNopDon = fundDetail?.hanNopDon;
  const soLuongChiTieu = fundDetail?.soLuongChiTieu;
  const soDonDaNop = fundDetail?.soDonDaNop || 0;

  const isSoDuLow = soDu != null && soDu < 10000000;
  const daysLeft = daysRemaining(hanNopDon);
  const isDeadlineSoon = daysLeft != null && daysLeft <= 7 && daysLeft >= 0;
  const isDeadlinePassed = daysLeft != null && daysLeft < 0;

  const phanTramDaNhan =
    soLuongChiTieu != null && soLuongChiTieu > 0
      ? Math.round((soDonDaNop / soLuongChiTieu) * 100)
      : null;

  const isNearlyFull = phanTramDaNhan != null && phanTramDaNhan >= 80;

  const soTienToiThieu = fundDetail?.soTienToiThieu;
  const soTienToiDa = fundDetail?.soTienToiDa;

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <HiOutlineBuildingLibrary className={styles.titleIcon} />
        <span>Phần 1: Thông tin Quỹ hỗ trợ</span>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel}>Loại quỹ</div>
        <Dropdown
          options={loaiQuyOptions}
          value={selectedLoaiQuy}
          onChange={(val) => setSelectedLoaiQuy(val)}
          placeholder="-- Chọn loại quỹ --"
          disabled={loadingFunds || loaiQuyOptions.length === 0}
          className={styles.dropdown}
        />
        {loadingFunds && (
          <div className={styles.loadingHint}>Đang tải danh sách quỹ...</div>
        )}
      </div>

      {selectedLoaiQuy && (
        <div className={styles.fieldGroupAnimated}>
          <div className={styles.fieldLabel}>Tên quỹ</div>
          <Dropdown
            options={fundOptions}
            value={selectedFundId}
            onChange={(val) => setSelectedFundId(val)}
            placeholder="-- Chọn quỹ bạn muốn đăng ký --"
            disabled={loadingFunds || fundList.length === 0}
            className={styles.dropdown}
            renderOption={(option) => (
              <div className={styles.fundOption}>
                <span className={styles.fundOptionName}>{option.label}</span>
                <span className={styles.fundOptionBadge}>
                  {option.description}
                </span>
              </div>
            )}
          />
          {loadingFunds && (
            <div className={styles.loadingHint}>Đang tải danh sách quỹ...</div>
          )}
          {!loadingFunds && fundList.length === 0 && (
            <div className={styles.emptyHint}>
              Không có quỹ nào thuộc loại này đang hoạt động
            </div>
          )}
        </div>
      )}

      {fundDetail && (
        <div className={styles.detailAnimated}>
          <div className={styles.conditionCard}>
            <div className={styles.conditionHeader}>
              <HiOutlineInformationCircle className={styles.conditionIcon} />
              <span className={styles.conditionTitle}>Tóm tắt điều kiện</span>
            </div>
            <p className={styles.conditionText}>
              {fundDetail.dieuKienTomTat ||
                'Chưa có thông tin điều kiện cho quỹ này.'}
            </p>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoCell}>
              <div className={styles.infoLabel}>
                <HiOutlineCurrencyDollar className={styles.infoIcon} /> Giá trị hỗ trợ
              </div>
              <div className={styles.infoValue}>
                {soTienToiThieu && soTienToiDa
                  ? `${formatVND(soTienToiThieu)} – ${formatVND(soTienToiDa)}`
                  : soTienToiThieu
                  ? `Từ ${formatVND(soTienToiThieu)}`
                  : soTienToiDa
                  ? `Tối đa ${formatVND(soTienToiDa)}`
                  : 'Chưa xác định'}
              </div>
            </div>

            <div className={styles.infoCell}>
              <div className={styles.infoLabel}>
                <HiOutlineCalendarDays className={styles.infoIcon} /> Hạn nộp đơn
              </div>
              <div
                className={`${styles.infoValue} ${
                  isDeadlineSoon ? styles.valueDanger : ''
                } ${isDeadlinePassed ? styles.valueDanger : ''}`}
              >
                {isDeadlineSoon && '⚠️ '}
                {isDeadlinePassed ? 'Đã hết hạn' : formatDate(hanNopDon)}
              </div>
            </div>

            <div className={styles.infoCell}>
              <div className={styles.infoLabel}>
                <HiOutlineBanknotes className={styles.infoIcon} /> Số dư quỹ
              </div>
              <div
                className={`${styles.infoValue} ${isSoDuLow ? styles.valueDanger : ''}`}
              >
                {isSoDuLow && '⚠️ '}
                {formatVND(soDu)}
              </div>
            </div>

            <div className={styles.infoCell}>
              <div className={styles.infoLabel}>
                <HiOutlineUsers className={styles.infoIcon} /> Số suất còn lại
              </div>
              <div
                className={`${styles.infoValue} ${isNearlyFull ? styles.valueWarning : ''}`}
              >
                {soLuongChiTieu == null
                  ? 'Không giới hạn suất'
                  : `${soLuongChiTieu - soDonDaNop} / ${soLuongChiTieu} suất`}
                {isNearlyFull && ' — Sắp đầy'}
              </div>
            </div>
          </div>

          {soLuongChiTieu != null && (
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                <span>Tỷ lệ đã nhận</span>
                <span className={styles.progressPercent}>
                  {phanTramDaNhan ?? 0}%
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${phanTramDaNhan ?? 0}%` }}
                />
              </div>
            </div>
          )}

          {soLuongChiTieu == null && (
            <div className={styles.unlimitedBadge}>
              Không giới hạn suất — có thể nộp đơn tự do
            </div>
          )}
        </div>
      )}
    </div>
  );
};

FundSelectSection.propTypes = {
  onFundSelect: PropTypes.func,
};

export default FundSelectSection;
