import { memo, useState, useEffect, useMemo } from 'react';
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

const normalizeSelectedFund = (fund) => {
  if (!fund) return null;
  const quyId = fund.quyId ?? fund.quy_id ?? fund.id;
  if (!quyId) return null;

  const loaiQuy = fund.loaiQuy ?? fund.loai_quy ?? fund.typeCode ?? fund.category ?? null;
  return {
    ...fund,
    quyId: Number(quyId),
    tenQuy: fund.tenQuy ?? fund.ten_quy ?? fund.name ?? '',
    loaiQuy,
    trangThai: fund.trangThai ?? fund.trang_thai ?? 'Dang hoat dong',
  };
};

const FundSelectSection = ({ onFundSelect, selectedFund, isDonor = false, nextButton }) => {
  const [selectedLoaiQuy, setSelectedLoaiQuy] = useState(null);
  const [selectedFundId, setSelectedFundId] = useState(null);
  const [allFunds, setAllFunds] = useState([]); // Tất cả quỹ từ database
  const [loaiQuyOptions, setLoaiQuyOptions] = useState([]); // Danh sách loại quỹ động
  const [fundDetail, setFundDetail] = useState(null);
  const [loadingFunds, setLoadingFunds] = useState(false);
  const [donationTarget, setDonationTarget] = useState('parent_fund'); // parent_fund hoặc custom_fund
  const selectedFundKey = selectedFund?.quyId ?? selectedFund?.quy_id ?? selectedFund?.id ?? null;
  const normalizedSelectedFund = useMemo(
    () => normalizeSelectedFund(selectedFund),
    [
      selectedFund?.quyId,
      selectedFund?.quy_id,
      selectedFund?.id,
      selectedFund?.tenQuy,
      selectedFund?.ten_quy,
      selectedFund?.name,
      selectedFund?.loaiQuy,
      selectedFund?.loai_quy,
      selectedFund?.typeCode,
      selectedFund?.category,
      selectedFund?.trangThai,
      selectedFund?.trang_thai,
    ]
  );

  // Tự động chọn Quỹ phát triển Đại học Trà Vinh khi ở chế độ parent_fund
  useEffect(() => {
    if (!isDonor || donationTarget !== 'parent_fund' || allFunds.length === 0) return;

    const parentFund = allFunds.find(
      (f) => f.tenQuy === 'Quỹ phát triển Đại học Trà Vinh'
    );
    if (parentFund) {
      setSelectedLoaiQuy(parentFund.loaiQuy);
      setSelectedFundId(parentFund.quyId);
    }
  }, [isDonor, donationTarget, allFunds]);

  const handleTargetChange = (target) => {
    setDonationTarget(target);
    if (target === 'custom_fund') {
      setSelectedLoaiQuy(null);
      setSelectedFundId(null);
      onFundSelect?.(null);
    }
  };

  const fundList = useMemo(() => {
    if (!selectedLoaiQuy) return [];

    const filtered = allFunds.filter((fund) => {
      const isMatchLoai = fund.loaiQuy === selectedLoaiQuy;
      const isActive = fund.trangThai === 'Dang hoat dong';
      const isNotBeChung = isDonor || fund.loaiDieuHanh !== 'Tap trung - Be chung';

      // Ẩn Quỹ phát triển Đại học Trà Vinh khi người dùng chọn chế độ custom_fund
      if (isDonor && donationTarget === 'custom_fund' && fund.tenQuy === 'Quỹ phát triển Đại học Trà Vinh') {
        return false;
      }
      return isMatchLoai && isActive && isNotBeChung;
    });

    if (
      normalizedSelectedFund?.quyId &&
      normalizedSelectedFund.loaiQuy === selectedLoaiQuy &&
      !filtered.some((fund) => fund.quyId === normalizedSelectedFund.quyId)
    ) {
      return [normalizedSelectedFund, ...filtered];
    }

    return filtered;
  }, [
    allFunds,
    selectedLoaiQuy,
    normalizedSelectedFund?.quyId,
    normalizedSelectedFund?.tenQuy,
    normalizedSelectedFund?.loaiQuy,
    normalizedSelectedFund?.trangThai,
    isDonor,
    donationTarget,
  ]);

  // Lấy tất cả quỹ và loại quỹ từ database khi component mount
  useEffect(() => {
    const fetchAllFundsAndTypes = async () => {
      setLoadingFunds(true);
      try {
        // Lấy danh sách quỹ
        const responseFunds = await fundService.getPublicFunds();
        const funds = responseFunds.funds || [];
        setAllFunds(funds);

        // Lấy danh sách loại quỹ từ bảng loaiquy
        const responseTypes = await fundService.getAllLoaiQuy();
        if (responseTypes.success && responseTypes.data) {
          const typeOptions = responseTypes.data.map(item => ({
            value: item.maLoai,
            label: item.tenLoai
          }));
          setLoaiQuyOptions(typeOptions);
        } else {
          // Fallback: Tạo danh sách loại quỹ động từ dữ liệu thực nếu API lỗi
          const uniqueTypes = [...new Set(funds.map(f => f.loaiQuy))].filter(Boolean);
          const typeOptions = uniqueTypes.map(type => ({
            value: type,
            label: formatLoaiQuyLabel(type)
          }));
          setLoaiQuyOptions(typeOptions);
        }
      } catch (error) {
        console.error('Lỗi tải danh sách quỹ/loại quỹ:', error);
        setAllFunds([]);
        setLoaiQuyOptions([]);
      } finally {
        setLoadingFunds(false);
      }
    };

    fetchAllFundsAndTypes();
  }, []);

  useEffect(() => {
    if (!normalizedSelectedFund?.quyId) return;

    const matchedFund = allFunds.find((fund) => fund.quyId === normalizedSelectedFund.quyId) || normalizedSelectedFund;
    if (!matchedFund.loaiQuy) return;

    setSelectedLoaiQuy((currentLoaiQuy) => (
      currentLoaiQuy === matchedFund.loaiQuy ? currentLoaiQuy : matchedFund.loaiQuy
    ));
    setSelectedFundId((currentFundId) => (
      currentFundId === matchedFund.quyId ? currentFundId : matchedFund.quyId
    ));
  }, [
    normalizedSelectedFund?.quyId,
    normalizedSelectedFund?.loaiQuy,
    allFunds
  ]);

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

  useEffect(() => {
    if (!selectedLoaiQuy || !selectedFundId) return;

    const shouldKeepSelectedFund = fundList.some((fund) => fund.quyId === Number(selectedFundId));
    if (shouldKeepSelectedFund) return;

    setSelectedFundId(null);
    setFundDetail((currentDetail) => (currentDetail ? null : currentDetail));
    if (Number(selectedFundKey) === Number(selectedFundId)) {
      onFundSelect?.(null);
    }
  }, [selectedLoaiQuy, selectedFundId, fundList, selectedFundKey, onFundSelect]);

  useEffect(() => {
    if (!selectedFundId || fundList.length === 0) {
      setFundDetail((currentDetail) => (currentDetail ? null : currentDetail));
      return;
    }

    const detail = fundList.find((f) => f.quyId === Number(selectedFundId));
    setFundDetail((currentDetail) => (
      currentDetail?.quyId === detail?.quyId ? currentDetail : detail || null
    ));

    if ((detail?.quyId || null) !== (Number(selectedFundKey) || null)) {
      onFundSelect?.(detail || null);
    }

  }, [selectedFundId, fundList, onFundSelect, selectedFundKey]);

  const fundOptions = fundList.map((f) => ({
    value: f.quyId,
    label: f.tenQuy,
    description: formatVND(f.soDu),
    loaiDieuHanh: f.loaiDieuHanh,
    tenQuyCha: f.tenQuyCha,
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
        <span>
          {isDonor ? 'Phần 1: Chọn Quỹ nhận quyên góp' : 'Phần 1: Thông tin Quỹ hỗ trợ'}
        </span>
      </div>

      {isDonor && (
        <div className={styles.targetSelection}>
          <div className={styles.fieldLabel}>Hình thức quyên góp</div>
          <div className={styles.targetCards}>
            <div
              className={`${styles.targetCard} ${donationTarget === 'parent_fund' ? styles.targetCardActive : ''}`}
              onClick={() => handleTargetChange('parent_fund')}
            >
              <div className={styles.targetCardHeader}>
                <div className={`${styles.targetRadio} ${donationTarget === 'parent_fund' ? styles.targetRadioActive : ''}`} />
                <span className={styles.targetTitle}>Quỹ phát triển chung (Quỹ mẹ)</span>
              </div>
              <p className={styles.targetDesc}>
                Quyên góp trực tiếp vào Quỹ phát triển Đại học Trà Vinh.
              </p>
            </div>

            <div
              className={`${styles.targetCard} ${donationTarget === 'custom_fund' ? styles.targetCardActive : ''}`}
              onClick={() => handleTargetChange('custom_fund')}
            >
              <div className={styles.targetCardHeader}>
                <div className={`${styles.targetRadio} ${donationTarget === 'custom_fund' ? styles.targetRadioActive : ''}`} />
                <span className={styles.targetTitle}>Mục đích / Quỹ cụ thể</span>
              </div>
              <p className={styles.targetDesc}>
                Chọn loại quỹ và mục chi con mong muốn ủng hộ (Học bổng, Y tế...).
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <div className={styles.fieldLabel}>Loại quỹ</div>
        <Dropdown
          options={loaiQuyOptions}
          value={selectedLoaiQuy}
          onChange={(val) => setSelectedLoaiQuy(val)}
          placeholder="-- Chọn loại quỹ --"
          disabled={loadingFunds || loaiQuyOptions.length === 0 || (isDonor && donationTarget === 'parent_fund')}
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
            placeholder={
              isDonor
                ? '-- Chọn quỹ bạn muốn quyên góp --'
                : '-- Chọn quỹ bạn muốn đăng ký --'
            }
            disabled={loadingFunds || fundList.length === 0 || (isDonor && donationTarget === 'parent_fund')}
            className={styles.dropdown}
            renderOption={(option) => (
              <div className={styles.fundOption}>
                <span className={styles.fundOptionName}>{option.label}</span>
                <div className={styles.fundOptionRight}>
                  {isDonor && (
                    <span className={`${styles.typeBadge} ${option.loaiDieuHanh === 'Tap trung - Be chung' ? styles.badgeParent : styles.badgeChild}`}>
                      {option.loaiDieuHanh === 'Tap trung - Be chung' ? 'Bể lớn' : 'Mục chi con'}
                    </span>
                  )}
                  <span className={styles.fundOptionBadge}>
                    {option.description}
                  </span>
                </div>
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
          {/* Tóm tắt điều kiện - Hiển thị cho cả 2 */}
          <div className={styles.conditionCard}>
            <div className={styles.conditionHeader}>
              <HiOutlineInformationCircle className={styles.conditionIcon} />
              <span className={styles.conditionTitle}>
                {isDonor ? 'Thông tin quỹ' : 'Tóm tắt điều kiện'}
              </span>
            </div>
            <p className={styles.conditionText}>
              {fundDetail.dieuKienTomTat ||
                (isDonor 
                  ? 'Cảm ơn bạn đã quan tâm đến quỹ này. Mọi đóng góp của bạn sẽ được sử dụng đúng mục đích.'
                  : 'Chưa có thông tin điều kiện cho quỹ này.'
                )}
            </p>
            {fundDetail.loaiDieuHanh === 'Tap trung - Muc chi' && fundDetail.tenQuyCha && (
              <div className={styles.parentFundInfo}>
                <span className={styles.parentLabel}>Thuộc bể tiền chung: </span>
                <span className={styles.parentName}>{fundDetail.tenQuyCha}</span>
              </div>
            )}
          </div>

          {/* Info Grid - Khác nhau cho Donor và Student */}
          {isDonor ? (
            // Nhà tài trợ: Hiển thị thông tin tổng quan về quỹ
            <div className={styles.infoGrid}>
              <div className={styles.infoCell}>
                <div className={styles.infoLabel}>
                  <HiOutlineBanknotes className={styles.infoIcon} /> Số dư quỹ hiện tại
                </div>
                <div className={styles.infoValue}>
                  {formatVND(soDu)}
                </div>
              </div>

              <div className={styles.infoCell}>
                <div className={styles.infoLabel}>
                  <HiOutlineUsers className={styles.infoIcon} /> Số người đã nhận hỗ trợ
                </div>
                <div className={styles.infoValue}>
                  {soDonDaNop || 0} người
                </div>
              </div>

              <div className={styles.infoCell}>
                <div className={styles.infoLabel}>
                  <HiOutlineCurrencyDollar className={styles.infoIcon} /> Loại quỹ
                </div>
                <div className={styles.infoValue}>
                  {formatLoaiQuyLabel(fundDetail.loaiQuy)}
                </div>
              </div>

              <div className={styles.infoCell}>
                <div className={styles.infoLabel}>
                  <HiOutlineInformationCircle className={styles.infoIcon} /> Trạng thái
                </div>
                <div className={`${styles.infoValue} ${styles.valueSuccess}`}>
                  Đang hoạt động
                </div>
              </div>
            </div>
          ) : (
            // Sinh viên: Hiển thị thông tin điều kiện hỗ trợ
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
          )}

          {/* Progress bar - Chỉ hiển thị cho sinh viên */}
          {!isDonor && soLuongChiTieu != null && (
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

          {/* Unlimited badge - Chỉ hiển thị cho sinh viên */}
          {!isDonor && soLuongChiTieu == null && (
            <div className={styles.unlimitedBadge}>
              Không giới hạn suất — có thể nộp đơn tự do
            </div>
          )}

          {/* Donor encouragement message */}
          {isDonor && (
            <div className={styles.donorMessage}>
              💝 Mọi đóng góp của bạn đều có ý nghĩa và sẽ giúp đỡ những sinh viên có hoàn cảnh khó khăn
            </div>
          )}

          {nextButton}
        </div>
      )}
    </div>
  );
};

FundSelectSection.propTypes = {
  onFundSelect: PropTypes.func,
  selectedFund: PropTypes.object,
  isDonor: PropTypes.bool,
  nextButton: PropTypes.node,
};

export default memo(FundSelectSection);
