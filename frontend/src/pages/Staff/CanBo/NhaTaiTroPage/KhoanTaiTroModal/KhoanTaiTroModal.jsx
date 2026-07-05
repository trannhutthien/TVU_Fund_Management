import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineCurrencyDollar,
  HiOutlinePhoto,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineUserPlus,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import api from '@services/api';
import { uploadService } from '@services/uploadService';
import { getStaffDonors } from '@services/donorService';
import { createStaffDonation } from '@services/donationService';
import FundSelectSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/FundSelectSection/FundSelectSection';
import DonationAmountSection from '@components/sections/AppliPage/AppliSectionLayout/AppliSectionForm/DonationAmountSection/DonationAmountSection';
import DonorInfoSection from '@components/sections/DonationForm/DonorInfoSection';
import styles from './KhoanTaiTroModal.module.scss';

const LOAI_LABEL = {
  'Ca nhan': 'Cá nhân',
  'To chuc': 'Tổ chức',
  'Doanh nghiep': 'Doanh nghiệp',
  'Doi tac': 'Đối tác',
};

const initialForm = (preselected) => ({
  nha_tai_tro_id: preselected?.nha_tai_tro_id || '',
  quy_id: '',
  so_tien: '',
  ghi_chu: '',
  hinh_anh_minh_chung: null,
  hinh_thuc: 'Tien mat', // Mặc định là Tiền mặt
});

const initialNewDonor = {
  guestHoTen: '',
  guestEmail: '',
  guestSoDienThoai: '',
  guestToChuc: '',
  guestDiaChi: '',
  loaiNhaTaiTro: 'Ca nhan',
};

const KhoanTaiTroModal = ({
  isOpen,
  onClose,
  preselectedSponsor,
  onSuccess,
}) => {
  const [donorMode, setDonorMode] = useState('existing');
  const [form, setForm] = useState(initialForm(preselectedSponsor));
  const [newDonor, setNewDonor] = useState(initialNewDonor);
  const [isNewDonorValid, setIsNewDonorValid] = useState(false);
  const [newDonorResetKey, setNewDonorResetKey] = useState(0);
  const [selectedFund, setSelectedFund] = useState(null);
  const [schoolBankAccounts, setSchoolBankAccounts] = useState([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState(null);
  const [transactionId, setTransactionId] = useState('');
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sponsorList, setSponsorList] = useState([]);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Reset form mỗi lần mở
  useEffect(() => {
    if (isOpen) {
      setForm(initialForm(preselectedSponsor));
      setNewDonor(initialNewDonor);
      setIsNewDonorValid(false);
      setNewDonorResetKey((prev) => prev + 1);
      setSelectedFund(null);
      setDonorMode(preselectedSponsor ? 'existing' : 'existing');
      setErrors({});
      setPreview(null);
      // Generate transaction ID for this donation
      setTransactionId('TXN' + Math.floor(10000000 + Math.random() * 90000000));
    }
  }, [isOpen, preselectedSponsor]);

  // Fetch danh sách sponsor (nếu chưa có preselected)
  useEffect(() => {
    if (!isOpen) return;

    if (!preselectedSponsor) {
      getStaffDonors({ page: 1, page_size: 100 })
        .then((res) => setSponsorList(res?.data || []))
        .catch(() => setSponsorList([]));
    }
  }, [isOpen, preselectedSponsor]);

  // Fetch school bank accounts (optional - for reference only in staff modal)
  useEffect(() => {
    if (!isOpen) return;

    import('@services/bankAccountService').then(({ bankAccountService }) => {
      bankAccountService.getSchoolBankAccounts()
        .then((res) => {
          if (res.success) {
            setSchoolBankAccounts(res.data || []);
            if (res.data?.length > 0) {
              setSelectedBankAccountId(res.data[0].taiKhoanId);
            }
          }
        })
        .catch(() => setSchoolBankAccounts([]));
    });
  }, [isOpen]);

  // CRITICAL: useCallback hooks MUST be before any conditional return
  const handleNewDonorFieldsChange = useCallback((fields) => {
    setNewDonor(fields);
  }, []);

  const handleNewDonorValidityChange = useCallback((isValid) => {
    setIsNewDonorValid(isValid);
  }, []);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File vượt quá 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }

    setForm((f) => ({ ...f, hinh_anh_minh_chung: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setForm((f) => ({ ...f, hinh_anh_minh_chung: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFundSelect = (fund) => {
    setSelectedFund(fund);
    setForm((f) => ({ ...f, quy_id: fund ? (fund.quyId || fund.quy_id || fund.id) : '' }));
  };

  const handleAmountChange = (amount) => {
    setForm((f) => ({ ...f, so_tien: amount }));
  };

  const validate = () => {
    const errs = {};
    if (donorMode === 'existing' && !form.nha_tai_tro_id) {
      errs.nha_tai_tro_id = 'Bắt buộc chọn nhà tài trợ';
    }
    if (donorMode === 'new' && !isNewDonorValid) {
      errs.new_donor = 'Thông tin nhà tài trợ mới chưa hợp lệ';
    }
    if (!form.quy_id) {
      errs.quy_id = 'Bắt buộc chọn quỹ';
    }
    const amount = Number(form.so_tien);
    if (!amount || amount < 10000) {
      errs.so_tien = 'Số tiền tối thiểu là 10,000đ';
    } else if (amount > 1000000000) {
      errs.so_tien = 'Số tiền tối đa là 1,000,000,000đ';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      let urlMinhChung = null;
      if (form.hinh_anh_minh_chung) {
        const upRes = await uploadService.uploadFile(form.hinh_anh_minh_chung);
        urlMinhChung = upRes?.data?.filePath || null;
      }

      await createStaffDonation({
        donorMode,
        nha_tai_tro_id: donorMode === 'existing' ? Number(form.nha_tai_tro_id) : undefined,
        donor_info: donorMode === 'new' ? {
          tenNhaTaiTro: newDonor.guestHoTen,
          email: newDonor.guestEmail,
          soDienThoai: newDonor.guestSoDienThoai,
          loaiNhaTaiTro: newDonor.loaiNhaTaiTro,
          diaChi: newDonor.guestDiaChi,
          toChuc: newDonor.guestToChuc,
        } : undefined,
        quy_id: Number(form.quy_id),
        so_tien: Number(form.so_tien),
        ghi_chu: form.ghi_chu?.trim() || null,
        hinh_thuc: form.hinh_thuc,
        hinh_anh_minh_chung: urlMinhChung,
      });

      toast.success('Đã ghi nhận khoản tài trợ thành công. Chờ duyệt.');
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Không thể ghi nhận khoản tài trợ. Vui lòng thử lại.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formValid =
    (donorMode === 'existing' ? !!form.nha_tai_tro_id : isNewDonorValid) &&
    !!form.quy_id &&
    Number(form.so_tien) >= 10000 &&
    Number(form.so_tien) <= 1000000000;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            <HiOutlineCurrencyDollar className={styles.titleIcon} />
            Tạo khoản tài trợ mới
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <HiOutlineXMark />
          </button>
        </div>

        {/* Form Body */}
        <div className={styles.body}>
          {/* Tabs switch mode (chỉ hiển thị khi không có preselected) */}
          {!preselectedSponsor && (
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${donorMode === 'existing' ? styles.tabActive : ''}`}
                onClick={() => setDonorMode('existing')}
              >
                <HiOutlineUser className={styles.tabIcon} />
                Nhà tài trợ đã có tài khoản
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${donorMode === 'new' ? styles.tabActive : ''}`}
                onClick={() => setDonorMode('new')}
              >
                <HiOutlineUserPlus className={styles.tabIcon} />
                Nhà tài trợ mới
              </button>
            </div>
          )}

          {/* Section: Nhà tài trợ */}
          <div className={styles.field}>
            {preselectedSponsor ? (
              <>
                <label className={styles.label}>Nhà tài trợ</label>
                <div className={styles.sponsorCard}>
                  <div className={styles.sponsorAvatar}>
                    {preselectedSponsor.avatar ? (
                      <img
                        src={preselectedSponsor.avatar}
                        alt={preselectedSponsor.ten_nha_tai_tro}
                      />
                    ) : (
                      <span>
                        {preselectedSponsor.ten_nha_tai_tro
                          ?.charAt(0)
                          .toUpperCase() || '?'}
                      </span>
                    )}
                  </div>
                  <div className={styles.sponsorInfo}>
                    <div className={styles.sponsorName}>
                      {preselectedSponsor.ten_nha_tai_tro}
                    </div>
                    <span className={styles.sponsorLoai}>
                      {LOAI_LABEL[preselectedSponsor.loai] ||
                        preselectedSponsor.loai}
                    </span>
                  </div>
                </div>
              </>
            ) : donorMode === 'existing' ? (
              <>
                <label className={styles.label}>
                  Chọn nhà tài trợ <span className={styles.required}>*Bắt buộc</span>
                </label>
                <select
                  className={`${styles.select} ${
                    errors.nha_tai_tro_id ? styles.selectError : ''
                  }`}
                  value={form.nha_tai_tro_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nha_tai_tro_id: e.target.value }))
                  }
                >
                  <option value="">-- Chọn nhà tài trợ --</option>
                  {sponsorList.map((s) => (
                    <option key={s.nha_tai_tro_id} value={s.nha_tai_tro_id}>
                      {s.ten_nha_tai_tro}
                      {s.email ? ` (${s.email})` : ''}
                    </option>
                  ))}
                </select>
                {errors.nha_tai_tro_id && (
                  <div className={styles.errorText}>{errors.nha_tai_tro_id}</div>
                )}
              </>
            ) : (
              <DonorInfoSection
                initialValues={newDonor}
                onFieldsChange={handleNewDonorFieldsChange}
                onValidityChange={handleNewDonorValidityChange}
                resetKey={newDonorResetKey}
                showTypeSelector={true}
                showGhiChu={false}
              />
            )}
          </div>

          {/* Section: Quỹ nhận tài trợ (reused public component) */}
          <div className={styles.field}>
            <label className={styles.label}>
              Chọn Quỹ nhận tài trợ <span className={styles.required}>*Bắt buộc</span>
            </label>
            <FundSelectSection
              selectedFund={selectedFund}
              onFundSelect={handleFundSelect}
              isDonor={true}
            />
            {errors.quy_id && (
              <div className={styles.errorText}>{errors.quy_id}</div>
            )}
          </div>

          {/* Section: Số tiền (reused public component) */}
          <div className={styles.field}>
            <DonationAmountSection
              selectedFund={selectedFund}
              donationAmount={form.so_tien}
              onAmountChange={handleAmountChange}
              schoolBankAccounts={schoolBankAccounts}
              selectedBankAccountId={selectedBankAccountId}
              onBankAccountSelect={setSelectedBankAccountId}
            />
            {errors.so_tien && (
              <div className={styles.errorText}>{errors.so_tien}</div>
            )}
          </div>

          {/* Section: Hình thức thanh toán */}
          <div className={styles.field}>
            <label className={styles.label}>
              Hình thức đóng góp <span className={styles.required}>*Bắt buộc</span>
            </label>
            <select
              className={styles.select}
              value={form.hinh_thuc}
              onChange={(e) =>
                setForm((f) => ({ ...f, hinh_thuc: e.target.value }))
              }
            >
              <option value="Tien mat">Tiền mặt</option>
              <option value="Chuyen khoan">Chuyển khoản</option>
              <option value="Khac">Khác</option>
            </select>
          </div>

          {/* Section: Ghi chú */}
          <div className={styles.field}>
            <label className={styles.label}>Ghi chú</label>
            <textarea
              className={styles.textarea}
              rows={3}
              placeholder="Ghi chú về khoản tài trợ này (nếu có)..."
              value={form.ghi_chu}
              onChange={(e) =>
                setForm((f) => ({ ...f, ghi_chu: e.target.value }))
              }
            />
          </div>

          {/* Section: Minh chứng */}
          <div className={styles.field}>
            <label className={styles.label}>
              Ảnh minh chứng{' '}
              <span className={styles.labelHint}>
                (ảnh chụp màn hình, biên lai chuyển khoản — tối đa 5MB)
              </span>
            </label>

            {preview ? (
              <div className={styles.previewWrap}>
                <img
                  src={preview}
                  alt="Xem trước"
                  className={styles.previewImg}
                />
                <div className={styles.previewInfo}>
                  <span className={styles.previewName}>
                    {form.hinh_anh_minh_chung?.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className={styles.removeBtn}
                  >
                    <HiOutlineTrash />
                    Xóa
                  </button>
                </div>
              </div>
            ) : (
              <div
                className={styles.dropzone}
                onClick={() => fileInputRef.current?.click()}
              >
                <HiOutlinePhoto className={styles.dropzoneIcon} />
                <span>Kéo thả hoặc click để chọn ảnh</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="primary"
            leftIcon={<HiOutlineCheckCircle />}
            disabled={!formValid}
            loading={submitting}
            onClick={handleSubmit}
          >
            Lưu khoản tài trợ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KhoanTaiTroModal;
