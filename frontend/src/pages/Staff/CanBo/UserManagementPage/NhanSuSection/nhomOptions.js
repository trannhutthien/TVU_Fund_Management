// Danh sách nhóm chức vụ tương ứng với vai trò hệ thống (bảng vaitro)
// Giữ nguyên 4 giá trị enum của bảng chucvuquy (không đổi schema),
// chỉ đổi nhãn hiển thị lấy từ cột mota bảng vaitro.
export const ROLE_TO_NHOM = {
  1: 'Hoi dong quy',
  2: 'Ban dieu hanh',
  3: 'Van phong thuong truc',
  5: 'Ban kiem soat',
};

export const NHOM_LABELS = {
  'Hoi dong quy': 'Hội đồng Quỹ',
  'Ban dieu hanh': 'Ban điều hành',
  'Ban kiem soat': 'Ban kiểm soát',
  'Van phong thuong truc': 'Văn phòng thường trực',
};

export const DEFAULT_NHOM_OPTIONS = Object.entries(NHOM_LABELS).map(([id, label]) => ({
  id,
  label,
}));

// Xây danh sách các nhóm dựa theo bảng vaitro (cột mota làm nhãn hiển thị,
// value giữ nguyên giá trị enum của chucvuquy).
export const buildNhomOptions = (roles = []) => {
  const roleByNhom = {};
  for (const role of roles) {
    const id = Number(role.id ?? role.vaitro_id);
    const nhom = ROLE_TO_NHOM[id];
    if (!nhom) continue;
    if (!roleByNhom[nhom]) roleByNhom[nhom] = [];
    roleByNhom[nhom].push(role.moTa || '');
  }

  const nhomList = Object.keys(NHOM_LABELS);
  if (Object.keys(roleByNhom).length === 0) return DEFAULT_NHOM_OPTIONS;

  return nhomList.map((nhom) => {
    const motas = (roleByNhom[nhom] || []).filter(Boolean);
    return {
      id: nhom,
      label: motas.length > 0
        ? `${NHOM_LABELS[nhom]} (${motas.join(', ')})`
        : NHOM_LABELS[nhom],
    };
  });
};

export default buildNhomOptions;