/**
 * Danh sách check nhanh xét duyệt — dựa trên Điều lệ Quỹ phát triển ĐH Trà Vinh
 * Khi user check vào, text tương ứng tự thêm vào ô ghi chú xét duyệt.
 */

export const REVIEW_CHECKLIST = {
  duyet: [
    {
      id: 'hosu_day_du',
      label: 'Hồ sơ đầy đủ theo yêu cầu',
      text: 'Hồ sơ đầy đủ, đúng mẫu theo quy định.',
    },
    {
      id: 'dung_doi_tuong',
      label: 'Đúng đối tượng được hỗ trợ',
      text: 'Thuộc đối tượng được hỗ trợ theo Điều 5 Điều lệ Quỹ.',
    },
    {
      id: 'dung_muc_dich',
      label: 'Sử dụng đúng mục đích quỹ',
      text: 'Nội dung đề nghị phù hợp mục đích hoạt động của Quỹ.',
    },
    {
      id: 'du_dieu_kien',
      label: 'Đủ điều kiện xét duyệt',
      text: 'Đáp ứng đầy đủ điều kiện xét hỗ trợ theo Điều 7 Điều lệ.',
    },
    {
      id: 'so_tien_hop_ly',
      label: 'Mức đề nghị hợp lý',
      text: 'Mức kinh phí đề nghị phù hợp với quy mô và nội dung dự án.',
    },
    {
      id: 'co_nghiem_thu',
      label: 'Cần nghiệm thu sau giải ngân',
      text: 'Yêu cầu nghiệm thu theo đúng cam kết sau khi giải ngân (Điều 15).',
    },
  ],
  tuChoi: [
    {
      id: 'thieu_ho_so',
      label: 'Thiếu hồ sơ / tài liệu',
      text: 'Hồ sơ chưa đầy đủ, thiếu tài liệu minh chứng theo yêu cầu.',
    },
    {
      id: 'sai_doi_tuong',
      label: 'Không đúng đối tượng',
      text: 'Không thuộc đối tượng được hỗ trợ theo Điều 5 Điều lệ Quỹ.',
    },
    {
      id: 'sai_muc_dich',
      label: 'Không phù hợp mục đích quỹ',
      text: 'Nội dung đề nghị không phù hợp với mục đích hoạt động của Quỹ.',
    },
    {
      id: 'vuot_han_muc',
      label: 'Vượt hạn mức cho phép',
      text: 'Mức đề nghị vượt quá hạn mức hỗ trợ tối đa theo quy định.',
    },
    {
      id: 'thieu_minh_chung',
      label: 'Thiếu minh chứng cần thiết',
      text: 'Chưa cung cấp đủ minh chứng cho nội dung đề nghị.',
    },
  ],
};
