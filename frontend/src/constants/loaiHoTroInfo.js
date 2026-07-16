import { LOAI_HO_TRO } from './loaiHoTro';

/**
 * Thông tin chi tiết 3 loại hình hỗ trợ — Điều 15 Điều lệ Quỹ
 * Dùng cho panel mô tả động (Method A) và modal so sánh (Method C)
 */
export const LOAI_HO_TRO_INFO = {
  [LOAI_HO_TRO.TAI_TRO_KHONG_HOAN_LAI]: {
    label: 'Tài trợ không hoàn lại',
    shortDesc: 'Hỗ trợ tài chính, không cần hoàn trả',
    legalRef: 'Điều 15.1',
    color: '#10b981',
    icon: 'gift',
    purpose: [
      'Xây dựng cơ sở vật chất phục vụ đào tạo',
      'Nghiên cứu khoa học',
      'Phát triển các lĩnh vực ưu tiên',
      'Tổ chức sự kiện quan trọng',
    ],
    conditions: [
      'Không phải hoàn trả lại kinh phí',
      'Được Quỹ xem xét và duyệt theo quy định',
    ],
    examples: 'Học bổng, hỗ trợ chi phí học tập, tổ chức sự kiện, xây dựng phòng lab',
    note: null,
  },

  [LOAI_HO_TRO.TAI_TRO_CO_THU_HOI]: {
    label: 'Tài trợ có thu hồi',
    shortDesc: 'Thu hồi tối đa 30% khi dự án phát triển thành sáng chế/chuyển giao',
    legalRef: 'Điều 15.2',
    color: '#f59e0b',
    icon: 'arrowPath',
    purpose: [
      'Dự án / đề tài có khả năng phát triển thành sáng chế',
      'Phát minh, chuyển giao công nghệ',
      'Đưa vào thương mại hóa',
    ],
    conditions: [
      'Quỹ thu hồi tối đa 30% tổng kinh phí dự án',
      'Phải khai báo tổng kinh phí thực hiện dự án',
      'Tỷ lệ tài trợ không quá 30% tổng kinh phí',
    ],
    examples: 'Đề tài nghiên cứu ứng dụng, dự án khởi nghiệp công nghệ, chuyển giao quy trình sản xuất',
    note: 'Bạn cần nhập tổng kinh phí dự án để hệ thống tính tỷ lệ tài trợ tối đa.',
  },

  [LOAI_HO_TRO.CHO_VAY]: {
    label: 'Vay vốn',
    shortDesc: 'Vay có/không lãi, trả góp theo kỳ hạn',
    legalRef: 'Điều 18',
    color: '#3b6ff5',
    icon: 'banknotes',
    purpose: [
      'Hoàn thiện sản phẩm công nghệ',
      'Nghiên cứu ứng dụng',
      'Chuyển giao công nghệ',
      'Tinh chế thử nghiệm sản phẩm',
    ],
    conditions: [
      'Lãi suất: 0% hoặc tối đa 70% lãi suất ngân hàng cùng thời điểm',
      'Phải hoàn trả gốc + lãi theo lịch trả góp',
      'Trễ hạn phải chịu lãi phạt',
      'Ký hợp đồng vay vốn sau khi hồ sơ được duyệt',
    ],
    examples: 'Vay vốn khởi nghiệp, vay hoàn thiện sản phẩm, vay nghiên cứu ứng dụng',
    note: 'Đây là khoản VAY — bạn bắt buộc phải hoàn trả. Quỹ sẽ liên hệ ký hợp đồng sau khi duyệt.',
  },
};

export const LOAI_HO_TRO_COMPARE = [
  {
    key: 'purpose',
    label: 'Mục đích',
  },
  {
    key: 'repayment',
    label: 'Hoàn trả',
  },
  {
    key: 'interest',
    label: 'Lãi suất',
  },
  {
    key: 'conditions',
    label: 'Điều kiện đặc biệt',
  },
  {
    key: 'legalRef',
    label: 'Căn cứ pháp lý',
  },
];

export const LOAI_HO_TRO_COMPARE_DATA = {
  [LOAI_HO_TRO.TAI_TRO_KHONG_HOAN_LAI]: {
    purpose: 'Đào tạo, nghiên cứu KH, sự kiện, CSVC',
    repayment: 'Không hoàn trả',
    interest: 'Không áp dụng',
    conditions: 'Không có',
    legalRef: 'Điều 15.1 Điều lệ',
  },
  [LOAI_HO_TRO.TAI_TRO_CO_THU_HOI]: {
    purpose: 'Sáng chế, chuyển giao CN, thương mại hóa',
    repayment: 'Thu hồi tối đa 30% tổng kinh phí',
    interest: 'Không áp dụng',
    conditions: 'Phải khai báo tổng kinh phí dự án',
    legalRef: 'Điều 15.2 Điều lệ',
  },
  [LOAI_HO_TRO.CHO_VAY]: {
    purpose: 'Hoàn thiện SP CN, NC Ứng dụng, tinh chế',
    repayment: 'Trả góp theo lịch (gốc + lãi)',
    interest: '0% hoặc ≤70% lãi suất NH',
    conditions: 'Ký HĐ vay vốn; lãi phạt trễ hạn',
    legalRef: 'Điều 18 Điều lệ',
  },
};
