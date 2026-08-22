import { memo, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineBuildingLibrary,
  HiOutlineInformationCircle,
  HiOutlineCurrencyDollar,
  HiOutlineCalendarDays,
  HiOutlineBanknotes,
  HiOutlineUsers,
  HiOutlineGift,
  HiOutlineArrowPath,
  HiOutlineDocumentText,
  HiOutlineMagnifyingGlass,
  HiOutlineSquare3Stack3D,
  HiOutlineRocketLaunch,
  HiOutlineCheck,
} from 'react-icons/hi2';
import Input from '@components/common/Input';
import Dropdown from '@components/common/Dropdown';
import fundService from '@services/fundService';
import { formatCurrency } from '@utils/formatters';
import styles from './FundSelectSection.module.scss';

const ALL_VALUE = '__all__';

const formatVND = (amount) => {
  if (amount == null) return '—';
  return formatCurrency(amount);
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
  const [selectedFundId, setSelectedFundId] = useState(null);
  const [allFunds, setAllFunds] = useState([]);
  const [loaiQuyData, setLoaiQuyData] = useState([]);
  const [fundDetail, setFundDetail] = useState(null);
  const [loadingFunds, setLoadingFunds] = useState(false);

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeLoaiQuy, setActiveLoaiQuy] = useState(null);
  const [activeLoaiHoTro, setActiveLoaiHoTro] = useState(null);
  const [sortValue, setSortValue] = useState('newest');

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

  // Filtered fund list
  const filteredFunds = useMemo(() => {
    let result = allFunds.filter((fund) => {
      const isActive = fund.trangThai === 'Dang hoat dong';
      const isNotBeChung = isDonor || fund.loaiDieuHanh !== 'Tap trung - Be chung';
      return isActive && isNotBeChung;
    });

    // Filter by loại quỹ
    if (activeLoaiQuy) {
      result = result.filter((fund) => fund.loaiQuy === activeLoaiQuy);
    }

    // Filter by loại hỗ trợ (chỉ quỹ cấp 3)
    if (activeLoaiHoTro) {
      result = result.filter((fund) => fund.loaiHoTro === activeLoaiHoTro);
    }

    // Filter by search keyword
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase().trim();
      result = result.filter((fund) => {
        const name = (fund.tenQuy || '').toLowerCase();
        const description = (fund.moTa || fund.dieuKienTomTat || '').toLowerCase();
        return name.includes(keyword) || description.includes(keyword);
      });
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortValue === 'newest') return (b.ngayTao || '').localeCompare(a.ngayTao || '');
      if (sortValue === 'oldest') return (a.ngayTao || '').localeCompare(b.ngayTao || '');
      if (sortValue === 'highest') return (b.soDu || 0) - (a.soDu || 0);
      if (sortValue === 'name') return (a.tenQuy || '').localeCompare(b.tenQuy || '');
      return 0;
    });

    return result;
  }, [allFunds, activeLoaiQuy, activeLoaiHoTro, searchKeyword, sortValue, isDonor]);

  // Fetch all funds and types
  useEffect(() => {
    const fetchAllFundsAndTypes = async () => {
      setLoadingFunds(true);
      try {
        const responseFunds = await fundService.getPublicFunds();
        const funds = responseFunds.funds || [];
        setAllFunds(funds);

        const responseTypes = await fundService.getAllLoaiQuy();
        if (responseTypes.success && responseTypes.data) {
          setLoaiQuyData(responseTypes.data);
        }
      } catch (error) {
        console.error('Lỗi tải danh sách quỹ/loại quỹ:', error);
        setAllFunds([]);
        setLoaiQuyData([]);
      } finally {
        setLoadingFunds(false);
      }
    };

    fetchAllFundsAndTypes();
  }, []);

  // Sync selectedFund from parent
  useEffect(() => {
    if (!normalizedSelectedFund?.quyId) return;
    setSelectedFundId(normalizedSelectedFund.quyId);
  }, [normalizedSelectedFund?.quyId]);

  // Update fundDetail when selectedFundId changes
  useEffect(() => {
    if (!selectedFundId || filteredFunds.length === 0) {
      setFundDetail(null);
      return;
    }

    const detail = filteredFunds.find((f) => f.quyId === Number(selectedFundId));
    if (detail) {
      setFundDetail((prev) => (prev?.quyId === detail.quyId ? prev : detail));
    } else {
      // Fund might not be in filtered list, try from allFunds
      const detailFromAll = allFunds.find((f) => f.quyId === Number(selectedFundId));
      if (detailFromAll) {
        setFundDetail((prev) => (prev?.quyId === detailFromAll.quyId ? prev : detailFromAll));
      }
    }
  }, [selectedFundId, filteredFunds, allFunds]);

  // Notify parent on fund select
  useEffect(() => {
    if (fundDetail?.quyId !== Number(selectedFundKey)) {
      onFundSelect?.(fundDetail || null);
    }
  }, [fundDetail, selectedFundKey, onFundSelect]);

  // Filter options
  const loaiQuyOptions = useMemo(() => [
    { value: ALL_VALUE, label: 'Tất cả loại quỹ' },
    ...loaiQuyData.map((item) => ({
      value: item.maLoai || item.ma_loai,
      label: item.tenLoai || item.ten_loai,
    })),
  ], [loaiQuyData]);

  const loaiHoTroOptions = useMemo(() => {
    const level3Funds = allFunds.filter((f) => f.capDo === 3);
    const uniqueLoaiHoTro = [...new Set(level3Funds.map((f) => f.loaiHoTro).filter(Boolean))];
    const mapping = {
      'Tai tro khong hoan lai': 'Tài trợ không thu hồi',
      'Tai tro co thu hoi': 'Tài trợ thu hồi một phần',
      'Cho vay': 'Tài trợ thu hồi toàn phần',
    };
    return [
      { value: ALL_VALUE, label: 'Tất cả loại hỗ trợ' },
      ...uniqueLoaiHoTro.map((val) => ({
        value: val,
        label: mapping[val] || val,
      })),
    ];
  }, [allFunds]);

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'highest', label: 'Số dư cao nhất' },
    { value: 'name', label: 'Tên A→Z' },
  ];

  const handleFundClick = (fund) => {
    setSelectedFundId(fund.quyId);
  };

  // Detail section data
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

  const nhomQuy = fundDetail?.loaiQuy ? loaiQuyData.find(item => item.maLoai === fundDetail.loaiQuy)?.nhom : null;

  const formatNhomQuy = (nhom) => {
    const mapping = {
      'Tai tro khong hoan lai': 'Tài trợ không thu hồi',
      'Tai tro co thu hoi': 'Tài trợ thu hồi một phần',
      'Cho vay': 'Tài trợ thu hồi toàn phần'
    };
    return mapping[nhom] || nhom;
  };

  const getNhomQuyBadgeClass = (nhom) => {
    if (nhom === 'Tai tro khong hoan lai') return styles.badgeGrant;
    if (nhom === 'Tai tro co thu hoi') return styles.badgeRecoverable;
    if (nhom === 'Cho vay') return styles.badgeLoan;
    return styles.badgeDefault;
  };

  const getNhomQuyIcon = (nhom) => {
    if (nhom === 'Tai tro khong hoan lai') return HiOutlineGift;
    if (nhom === 'Tai tro co thu hoi') return HiOutlineArrowPath;
    if (nhom === 'Cho vay') return HiOutlineDocumentText;
    return HiOutlineInformationCircle;
  };

  const formatLoaiQuyLabel = (loaiQuy) => {
    const found = loaiQuyData.find(item => item.maLoai === loaiQuy);
    return found?.tenLoai || loaiQuy;
  };

  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>
        <HiOutlineBuildingLibrary className={styles.titleIcon} />
        <span>
          {isDonor ? 'Phần 1: Chọn Quỹ nhận quyên góp' : 'Phần 1: Thông tin Quỹ hỗ trợ'}
        </span>
      </div>

      {/* Search + Filter Layout - Giống FundsPage */}
      <div className={styles.filterSection}>
        {/* Search Bar */}
        <div className={styles.searchWrapper}>
          <Input
            type="text"
            placeholder="Tìm theo tên quỹ, mô tả..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            leftIcon={<HiOutlineMagnifyingGlass size={20} />}
            className={styles.searchInput}
          />
        </div>

        {/* Filters Row */}
        <div className={styles.filtersRow}>
          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Loại quỹ</label>
            <Dropdown
              options={loaiQuyOptions}
              value={activeLoaiQuy || ALL_VALUE}
              onChange={(val) => setActiveLoaiQuy(val === ALL_VALUE ? null : val)}
              placeholder="Tất cả loại quỹ"
              size="medium"
              className={styles.filterDropdown}
            />
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Loại hỗ trợ</label>
            <Dropdown
              options={loaiHoTroOptions}
              value={activeLoaiHoTro || ALL_VALUE}
              onChange={(val) => setActiveLoaiHoTro(val === ALL_VALUE ? null : val)}
              placeholder="Tất cả loại hỗ trợ"
              size="medium"
              className={styles.filterDropdown}
            />
          </div>

          <div className={styles.filterItem}>
            <label className={styles.filterLabel}>Sắp xếp</label>
            <Dropdown
              options={sortOptions}
              value={sortValue}
              onChange={(val) => setSortValue(val)}
              placeholder="Chọn cách sắp xếp"
              size="medium"
              className={styles.sortDropdown}
            />
          </div>
        </div>
      </div>

      {/* Fund List */}
      <div className={styles.fundListSection}>
        {loadingFunds ? (
          <div className={styles.loadingHint}>Đang tải danh sách quỹ...</div>
        ) : filteredFunds.length === 0 ? (
          <div className={styles.emptyHint}>Không tìm thấy quỹ nào phù hợp</div>
        ) : (
          <div className={styles.fundList}>
            {filteredFunds.map((fund) => (
              <div
                key={fund.quyId}
                className={`${styles.fundItem} ${selectedFundId === fund.quyId ? styles.fundItemSelected : ''}`}
                onClick={() => handleFundClick(fund)}
              >
                <div className={styles.fundItemContent}>
                  <div className={styles.fundItemHeader}>
                    <h4 className={styles.fundItemName}>{fund.tenQuy}</h4>
                    {selectedFundId === fund.quyId && (
                      <HiOutlineCheck className={styles.fundItemCheck} />
                    )}
                  </div>
                  <p className={styles.fundItemDesc}>
                    {fund.dieuKienTomTat || fund.moTa || 'Chưa có mô tả'}
                  </p>
                  <div className={styles.fundItemMeta}>
                    <span className={styles.fundItemBalance}>
                      Số dư: {formatVND(fund.soDu)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fund Detail - Hiển thị khi đã chọn quỹ */}
      {fundDetail && (
        <div className={styles.detailAnimated}>
          {/* Badge nhóm quỹ */}
          {nhomQuy && (
            <div className={`${styles.nhomQuyBadge} ${getNhomQuyBadgeClass(nhomQuy)}`}>
              {(() => {
                const IconComponent = getNhomQuyIcon(nhomQuy);
                return <IconComponent className={styles.nhomQuyIcon} />;
              })()}
              <span className={styles.nhomQuyText}>{formatNhomQuy(nhomQuy)}</span>
            </div>
          )}

          {/* Tóm tắt điều kiện */}
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

          {/* Info Grid */}
          {isDonor ? (
            <div className={styles.infoGrid}>
              <div className={styles.infoCell}>
                <div className={styles.infoLabel}>
                  <HiOutlineBanknotes className={styles.infoIcon} /> Số dư quỹ hiện tại
                </div>
                <div className={styles.infoValue}>{formatVND(soDu)}</div>
              </div>

              <div className={styles.infoCell}>
                <div className={styles.infoLabel}>
                  <HiOutlineUsers className={styles.infoIcon} />
                  {fundDetail.loaiDieuHanh === 'Tap trung - Be chung'
                    ? 'Số quỹ con đang hoạt động'
                    : 'Số người đã nhận hỗ trợ'}
                </div>
                <div className={styles.infoValue}>
                  {fundDetail.loaiDieuHanh === 'Tap trung - Be chung'
                    ? `${fundDetail.soQuyConHoatDong || 0} quỹ con`
                    : `${soDonDaNop || 0} người`}
                </div>
              </div>

              <div className={styles.infoCell}>
                <div className={styles.infoLabel}>
                  <HiOutlineCurrencyDollar className={styles.infoIcon} /> Loại quỹ
                </div>
                <div className={styles.infoValue}>{formatLoaiQuyLabel(fundDetail.loaiQuy)}</div>
              </div>

              <div className={styles.infoCell}>
                <div className={styles.infoLabel}>
                  <HiOutlineInformationCircle className={styles.infoIcon} /> Trạng thái
                </div>
                <div className={`${styles.infoValue} ${styles.valueSuccess}`}>Đang hoạt động</div>
              </div>
            </div>
          ) : (
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
                  className={`${styles.infoValue} ${isDeadlineSoon ? styles.valueDanger : ''} ${isDeadlinePassed ? styles.valueDanger : ''}`}
                >
                  {isDeadlineSoon && '⚠️ '}
                  {isDeadlinePassed ? 'Đã hết hạn' : formatDate(hanNopDon)}
                </div>
              </div>

              <div className={styles.infoCell}>
                <div className={styles.infoLabel}>
                  <HiOutlineBanknotes className={styles.infoIcon} /> Số dư quỹ
                </div>
                <div className={`${styles.infoValue} ${isSoDuLow ? styles.valueDanger : ''}`}>
                  {isSoDuLow && '⚠️ '}
                  {formatVND(soDu)}
                </div>
              </div>

              <div className={styles.infoCell}>
                <div className={styles.infoLabel}>
                  <HiOutlineUsers className={styles.infoIcon} /> Số suất còn lại
                </div>
                <div className={`${styles.infoValue} ${isNearlyFull ? styles.valueWarning : ''}`}>
                  {soLuongChiTieu == null
                    ? 'Không giới hạn suất'
                    : `${soLuongChiTieu - soDonDaNop} / ${soLuongChiTieu} suất`}
                  {isNearlyFull && ' — Sắp đầy'}
                </div>
              </div>
            </div>
          )}

          {/* Progress bar */}
          {!isDonor && soLuongChiTieu != null && (
            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                <span>Tỷ lệ đã nhận</span>
                <span className={styles.progressPercent}>{phanTramDaNhan ?? 0}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${phanTramDaNhan ?? 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Unlimited badge */}
          {!isDonor && soLuongChiTieu == null && (
            <div className={styles.unlimitedBadge}>
              Không giới hạn suất — có thể nộp đơn tự do
            </div>
          )}

          {/* Donor encouragement */}
          {isDonor && (
            <div className={styles.donorMessage}>
              💝 Mỗi đóng góp của bạn đều đáng quý và sẽ tiếp sức cho sinh viên TVU vươn lên trong học tập
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
