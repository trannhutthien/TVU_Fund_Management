// Loại hình hỗ trợ — 3 giá trị thật theo schema yeucauhotro.loaihotro
export const LOAI_HO_TRO = {
  TAI_TRO_KHONG_HOAN_LAI: 'Tai tro khong hoan lai',
  TAI_TRO_CO_THU_HOI: 'Tai tro co thu hoi',
  CHO_VAY: 'Cho vay',
};

export const LOAI_HO_TRO_OPTIONS = [
  {
    value: LOAI_HO_TRO.TAI_TRO_KHONG_HOAN_LAI,
    label: 'Tài trợ không hoàn lại',
    description: 'Hỗ trợ tài chính, không cần hoàn trả',
    canGhiTongKinhPhi: false,
  },
  {
    value: LOAI_HO_TRO.TAI_TRO_CO_THU_HOI,
    label: 'Tài trợ có thu hồi một phần',
    description: 'Áp dụng cho dự án/đề tài có thể phát triển thành sáng chế hoặc chuyển giao công nghệ — thu hồi tối đa 30% tổng kinh phí dự án',
    canGhiTongKinhPhi: true,
  },
  {
    value: LOAI_HO_TRO.CHO_VAY,
    label: 'Vay vốn',
    description: 'Vay có hoặc không tính lãi (tối đa 70% lãi suất ngân hàng), có lịch trả góp theo kỳ hạn',
    canGhiTongKinhPhi: false,
  },
];

export const LOAI_HO_TRO_LABELS = Object.fromEntries(
  LOAI_HO_TRO_OPTIONS.map((opt) => [opt.value, opt.label])
);
