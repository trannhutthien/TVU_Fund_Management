import React, { useState, useEffect } from 'react';
import { DownOutlined, UpOutlined, BankOutlined, FileTextOutlined } from '@ant-design/icons';
import { formatCurrency } from '@utils/formatters';
import { systemSettingsService } from '@services/systemSettingsService';
import BangKyTraNo from '../BangKyTraNo';
import BangKyThuHoi from '../BangKyThuHoi';
import NopTienThuHoiModal from '../NopTienThuHoiModal';
import styles from './index.module.scss';

const LOAI_HO_TRO_LABELS = {
  'Cho vay': { label: 'Cho vay', color: '#1d4ed8', bg: '#eff6ff' },
  'Tai tro co thu hoi': { label: 'Tài trợ thu hồi', color: '#c2410c', bg: '#fff7ed' },
};

const HopDongItem = ({ don, onSubmitProof, onRevokeProof, onSubmitThuHoi, onHuyThuHoi, submitting }) => {
  const [expanded, setExpanded] = useState(false);
  const [modalThuHoiOpen, setModalThuHoiOpen] = useState(false);
  const [bankInfo, setBankInfo] = useState(null);

  useEffect(() => {
    systemSettingsService.getPublicSettings()
      .then((settings) => setBankInfo(settings.tai_khoan_nhan_tai_tro || null))
      .catch(() => {});
  }, []);

  const isVay = don.loaihotro === 'Cho vay';
  const isThuHoiNo = isVay && don.trangThaiDon === 'Dang thu hoi no' && don.dieuKhoan;
  const loaiInfo = isThuHoiNo
    ? { label: 'Thu hồi nợ vay', color: '#b45309', bg: '#fffbeb' }
    : LOAI_HO_TRO_LABELS[don.loaihotro] || { label: don.loaihotro, color: '#64748b', bg: '#f1f5f9' };

  // Tính progress
  let totalPaid = 0;
  let totalDue = 0;
  let overdueCount = 0;
  const kyList = isVay && !isThuHoiNo ? (don.lichTra || []) : [];

  if (isVay && !isThuHoiNo) {
    for (const ky of kyList) {
      totalDue += ky.tongPhaiTra;
      if (ky.trangThaiKy === 'Da tra') {
        totalPaid += ky.sotienthuctra || ky.tongPhaiTra;
      } else if (ky.trangThaiKy === 'Tra mot phan') {
        totalPaid += ky.sotienthuctra || 0;
      }
      if (ky.trangThaiKy === 'Qua han') overdueCount++;
    }
  } else if (isThuHoiNo) {
    // Don vay da that bai nghiem thu → tien thu hoi
    totalDue = don.dieuKhoan?.mucthuhoi || 0;
    totalPaid = don.dieuKhoan?.sotiendadathu || 0;
  } else {
    // Tài trợ thu hồi
    totalDue = don.dieuKhoan?.mucthuhoi || 0;
    totalPaid = don.dieuKhoan?.sotiendadathu || 0;
  }

  const progress = totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0;
  const conLaiAmount = Math.max(0, totalDue - totalPaid);

  return (
    <div className={`${styles.card} ${expanded ? styles.cardExpanded : ''}`}>
      {/* Header */}
      <button className={styles.header} onClick={() => setExpanded(!expanded)}>
        <div className={styles.headerLeft}>
          <span className={styles.fundIcon}>
            <BankOutlined />
          </span>
          <div className={styles.headerInfo}>
            <div className={styles.headerTitle}>
              <span className={styles.fundName}>{don.tenquy}</span>
              <span className={styles.loaiBadge} style={{ color: loaiInfo.color, background: loaiInfo.bg }}>
                {loaiInfo.label}
              </span>
              {overdueCount > 0 && (
                <span className={styles.overdueBadge}>
                  ⚠ {overdueCount} kỳ quá hạn
                </span>
              )}
            </div>
            <div className={styles.headerSub}>
              <span>{don.tieuDe || '—'}</span>
              <span className={styles.dot}>·</span>
              <span>
                {isThuHoiNo
                  ? `Thu hồi nợ vay ${formatCurrency(totalDue)}`
                  : isVay ? `${kyList.length} kỳ trả` : `Thu hồi ${formatCurrency(totalDue)}`
                }
              </span>
              {isThuHoiNo && conLaiAmount > 0 && (
                <>
                  <span className={styles.dot}>·</span>
                  <span className={styles.conLaiText}>Còn nợ {formatCurrency(conLaiAmount)}</span>
                </>
              )}
              {!isVay && !isThuHoiNo && conLaiAmount > 0 && (
                <>
                  <span className={styles.dot}>·</span>
                  <span className={styles.conLaiText}>Còn nợ {formatCurrency(conLaiAmount)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.progressWrap}>
            <div className={styles.progressText}>{progress}%</div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className={styles.expandIcon}>
            {expanded ? <UpOutlined /> : <DownOutlined />}
          </span>
        </div>
      </button>

      {/* Expand content */}
      {expanded && (
        <div className={styles.body}>
          {/* Contract info */}
          {isVay && don.hopDong && (
            <div className={styles.contractInfo}>
              <h4 className={styles.sectionTitle}>
                <FileTextOutlined /> Thông tin hợp đồng vay
              </h4>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Số tiền vay</span>
                  <span className={styles.fieldValue}>{formatCurrency(don.hopDong.sotienvon)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Lãi suất</span>
                  <span className={styles.fieldValue}>{don.hopDong.laisuatphantram}%/năm</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Kỳ hạn</span>
                  <span className={styles.fieldValue}>{don.hopDong.kyhandothang} tháng</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Ngày đáo hạn</span>
                  <span className={styles.fieldValue}>
                    {don.hopDong.ngaydaohan ? new Date(don.hopDong.ngaydaohan).toLocaleDateString('vi-VN') : '—'}
                  </span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Trạng thái</span>
                  <span className={`${styles.fieldValue} ${styles[`status_${don.hopDong.trangThaiHopDong?.replace(/\s/g, '')}`] || ''}`}>
                    {don.hopDong.trangThaiHopDong || '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tài trợ thu hồi / Don vay that bai nghiem thu info */}
          {(!isVay || isThuHoiNo) && don.dieuKhoan && (
            <div className={styles.contractInfo}>
              <h4 className={styles.sectionTitle}>
                <FileTextOutlined /> {isThuHoiNo ? 'Thông tin thu hồi nợ vay' : 'Thông tin tài trợ thu hồi'}
              </h4>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Mức thu hồi</span>
                  <span className={styles.fieldValue}>{formatCurrency(don.dieuKhoan.mucthuhoi)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Thời hạn hoàn trả</span>
                  <span className={styles.fieldValue}>{don.dieuKhoan.thoihanhoantra_thang} tháng</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Số quyết định</span>
                  <span className={styles.fieldValue}>{don.dieuKhoan.soquyetdinh_hopdong || '—'}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Đã thu</span>
                  <span className={styles.fieldValue}>{formatCurrency(don.dieuKhoan.sotiendadathu)}</span>
                </div>
                <div className={styles.field}>
                  <span className={styles.fieldLabel}>Còn lại</span>
                  <span className={`${styles.fieldValue} ${conLaiAmount > 0 ? styles.conLaiRed : styles.status_Da_hoan_tat}`}>
                    {formatCurrency(conLaiAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bảng kỳ trả (chỉ cho vay) */}
          {isVay && kyList.length > 0 && (
            <BangKyTraNo
              kyTraNoList={kyList}
              loaiHotro={don.loaihotro}
              tenQuy={don.tenquy}
              onSubmitProof={onSubmitProof}
              onRevokeProof={onRevokeProof}
            />
          )}

          {/* Bảng lịch sử nộp tiền thu hồi */}
          {(!isVay || isThuHoiNo) && don.lichSuNopTien && don.lichSuNopTien.length > 0 && (
            <BangKyThuHoi
              lichSuNopTien={don.lichSuNopTien}
              onHuy={(lanNopId) => onHuyThuHoi?.(don.dieuKhoan?.dieukhoanthuhoiId, lanNopId)}
            />
          )}

          {/* Nut nop tien thu hoi */}
          {(!isVay || isThuHoiNo) && don.dieuKhoan && conLaiAmount > 0 && (
            <div style={{ paddingTop: 12 }}>
              <button
                className={styles.submitBtn}
                onClick={() => setModalThuHoiOpen(true)}
              >
                Nộp tiền thu hồi
              </button>
            </div>
          )}

          {/* Modal nop tien thu hoi */}
          {(!isVay || isThuHoiNo) && (
            <NopTienThuHoiModal
              isOpen={modalThuHoiOpen}
              conLai={conLaiAmount}
              bankInfo={bankInfo}
              tenQuy={don.tenquy}
              onSubmit={async (data) => {
                await onSubmitThuHoi?.(don.dieuKhoan?.dieukhoanthuhoiId, data);
                setModalThuHoiOpen(false);
              }}
              onClose={() => setModalThuHoiOpen(false)}
              submitting={submitting}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default HopDongItem;
