import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Popconfirm } from 'antd';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  HiOutlineArrowLeft,
  HiOutlineNewspaper,
  HiOutlineCog6Tooth,
  HiOutlinePhoto,
  HiOutlineArrowUpTray,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlinePencilSquare,
  HiOutlineListBullet,
  HiOutlinePlusCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineXMark,
} from 'react-icons/hi2';
import Button from '@components/common/Button/Button';
import newsService from '@services/newsService';
import { uploadService } from '@services/uploadService';
import useAuthStore from '@stores/authStore';
import styles from './TaoTinTucPage.module.scss';

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
).replace(/\/api\/?$/, '');

const buildImageUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
};

// ─── Constants ──────────────────────────────────────────────────
const DANHMUC_OPTIONS = [
  { value: 'Tin hoc bong', label: 'Tin học bổng' },
  { value: 'Tin giao duc', label: 'Tin giáo dục' },
  { value: 'Su kien', label: 'Sự kiện' },
  { value: 'Thong bao', label: 'Thông báo' },
  { value: 'Khac', label: 'Khác' },
];

const TRANGTHAI_OPTIONS = [
  { value: 'Ban nhap', label: 'Bản nháp' },
  { value: 'Da xuat ban', label: 'Đã xuất bản' },
  { value: 'Da an', label: 'Đã ẩn' },
];

const LANOIBAT_OPTIONS = [
  { value: 0, label: 'Bình thường', note: 'Hiển thị trong danh sách tin thường' },
  { value: 1, label: 'Featured lớn', note: 'Ảnh bìa to nhất, đặt đầu trang chủ' },
  { value: 2, label: 'Featured nhỏ', note: 'Ảnh vừa, hiển thị bên cạnh featured lớn' },
  { value: 3, label: 'Sidebar', note: 'Tin ngắn ở cột phụ bên phải trang chủ' },
];

const DANHMUC_LABEL = Object.fromEntries(DANHMUC_OPTIONS.map(o => [o.value, o.label]));
const TRANGTHAI_LABEL = Object.fromEntries(TRANGTHAI_OPTIONS.map(o => [o.value, o.label]));
const LANOIBAT_LABEL = Object.fromEntries(LANOIBAT_OPTIONS.map(o => [o.value, o.label]));

const QUILL_MODULES = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  },
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'indent',
  'blockquote', 'code-block', 'link', 'image',
];

const INITIAL_FORM = {
  title: '',
  summary: '',
  content: '',
  avatarFile: null,
  avatarPreviewUrl: '',
  avatarPath: '',
  category: 'Thong bao',
  status: 'Ban nhap',
  publishDate: '',
  lanoibat: 0,
};

// ─── Badge helpers ───────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    'Da xuat ban': { label: 'Đã xuất bản', cls: styles.badgeGreen },
    'Ban nhap': { label: 'Bản nháp', cls: styles.badgeGray },
    'Da an': { label: 'Đã ẩn', cls: styles.badgeRed },
  };
  const cfg = map[status] || { label: status, cls: styles.badgeGray };
  return <span className={`${styles.badge} ${cfg.cls}`}>{cfg.label}</span>;
};

const CategoryBadge = ({ category }) => {
  const map = {
    'Tin hoc bong': styles.badgeBlue,
    'Tin giao duc': styles.badgePurple,
    'Su kien': styles.badgeOrange,
    'Thong bao': styles.badgeNavy,
    'Khac': styles.badgeGray,
  };
  return (
    <span className={`${styles.badge} ${map[category] || styles.badgeGray}`}>
      {DANHMUC_LABEL[category] || category}
    </span>
  );
};

const LanoibatBadge = ({ value }) => {
  const map = {
    0: styles.badgeGray,
    1: styles.badgeGold,
    2: styles.badgeGold,
    3: styles.badgeBlue,
  };
  return (
    <span className={`${styles.badge} ${map[value] ?? styles.badgeGray}`}>
      {LANOIBAT_LABEL[value] ?? value}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const TaoTinTucPage = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const isEditMode = !!editId;
  const { user } = useAuthStore();
  const isAdmin = user?.vaiTro === 1;

  const avatarInputRef = useRef(null);
  const quillRef = useRef(null);

  const location = useLocation();

  // Tab state — default sang "quan-ly" khi ở chế độ xem danh sách
  const [activeTab, setActiveTab] = useState(() => {
    if (isEditMode) return 'tao';
    return location.state?.activeTab || 'tao';
  });

  // ── Form state ──────────────────────────────────────────────
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // ── List state ──────────────────────────────────────────────
  const [newsList, setNewsList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listPage, setListPage] = useState(1);
  const PAGE_SIZE = 10;

  // Filters
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterDanhmuc, setFilterDanhmuc] = useState('');
  const [filterTrangthai, setFilterTrangthai] = useState('');
  const [filterLanoibat, setFilterLanoibat] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, title }
  const [deletingId, setDeletingId] = useState(null);

  // ── URL helpers ──────────────────────────────────────────────
  const prefix = window.location.pathname.startsWith('/admin') ? '/admin' : '/can-bo';
  const parentUrl = `${prefix}/tin-tuc`;

  // ── Load edit data ───────────────────────────────────────────
  useEffect(() => {
    if (!isEditMode) return;
    const load = async () => {
      try {
        setLoadingEdit(true);
        const res = await newsService.getNewsAdminById(editId);
        if (res?.success && res?.news) {
          const n = res.news;
          const pd = n.publishDate
            ? new Date(new Date(n.publishDate).getTime() - new Date().getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16)
            : '';
          setForm({
            title: n.title || '',
            summary: n.summary || '',
            content: n.content || '',
            avatarFile: null,
            avatarPreviewUrl: n.avatar || '',
            avatarPath: n.avatarPath || '',
            category: n.category || 'Thong bao',
            status: n.status || 'Ban nhap',
            publishDate: pd,
            lanoibat: n.lanoibat ?? 0,
          });
        }
      } catch {
        toast.error('Không thể tải thông tin bài viết');
      } finally {
        setLoadingEdit(false);
      }
    };
    load();
  }, [editId, isEditMode]);

  // ── Load news list khi vào tab quản lý ──────────────────────
  const fetchNewsList = useCallback(async () => {
    try {
      setLoadingList(true);
      const res = await newsService.getAllNews();
      if (res?.success) {
        setNewsList(res.news || []);
      }
    } catch {
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'quan-ly') {
      fetchNewsList();
    }
  }, [activeTab, fetchNewsList]);

  // ── Status auto-fill ─────────────────────────────────────────
  useEffect(() => {
    if (form.status === 'Da xuat ban' && !form.publishDate) {
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setForm(prev => ({ ...prev, publishDate: local }));
    }
    if (form.status !== 'Da xuat ban') {
      setForm(prev => ({ ...prev, publishDate: '' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.status]);

  // ── Quill image handler ──────────────────────────────────────
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const result = await uploadService.uploadNewsImage(file);
        if (result?.success && result?.data?.filePath) {
          const url = buildImageUrl(result.data.filePath);
          const editor = quillRef.current?.getEditor();
          if (editor) {
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, 'image', url);
            editor.setSelection(range.index + 1);
          }
        } else {
          toast.error('Không thể tải ảnh lên');
        }
      } catch {
        toast.error('Lỗi khi tải ảnh lên editor');
      }
    };
  }, []);

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (editor) {
      const toolbar = editor.getModule('toolbar');
      toolbar.addHandler('image', imageHandler);
    }
  }, [imageHandler]);

  // ── Avatar ───────────────────────────────────────────────────
  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(prev => ({ ...prev, avatarFile: file, avatarPreviewUrl: ev.target.result, avatarPath: '' }));
    reader.readAsDataURL(file);
    try {
      setUploadingAvatar(true);
      const result = await uploadService.uploadNewsImage(file);
      if (result?.success && result?.data?.filePath) {
        setForm(prev => ({ ...prev, avatarPath: result.data.filePath }));
        toast.success('Tải ảnh đại diện thành công');
      } else {
        toast.error('Không thể tải ảnh đại diện');
      }
    } catch {
      toast.error('Lỗi khi tải ảnh đại diện');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => setForm(prev => ({ ...prev, avatarFile: null, avatarPreviewUrl: '', avatarPath: '' }));

  // ── Validation ───────────────────────────────────────────────
  const validate = () => {
    const next = {};
    if (!form.title.trim()) next.title = 'Vui lòng nhập tiêu đề bài viết';
    else if (form.title.trim().length > 255) next.title = 'Tiêu đề tối đa 255 ký tự';
    if (!form.summary.trim()) next.summary = 'Vui lòng nhập mô tả ngắn';
    else if (form.summary.trim().length > 500) next.summary = 'Mô tả ngắn tối đa 500 ký tự';
    const rawText = quillRef.current?.getEditor()?.getText().trim();
    if (!rawText) next.content = 'Vui lòng nhập nội dung bài viết';
    if (form.status === 'Da xuat ban' && !form.publishDate) next.publishDate = 'Vui lòng chọn ngày xuất bản';
    return next;
  };

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e?.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }
    setErrors({});
    try {
      setSubmitting(true);
      const payload = {
        title: form.title.trim(),
        summary: form.summary.trim(),
        content: form.content,
        avatar: form.avatarPath || null,
        category: form.category,
        status: form.status,
        publishDate: form.status === 'Da xuat ban' && form.publishDate ? new Date(form.publishDate).toISOString() : null,
        lanoibat: Number(form.lanoibat),
      };
      let result;
      if (isEditMode) {
        result = await newsService.updateNews(editId, payload);
      } else {
        result = await newsService.createNews(payload);
      }
      if (result?.success) {
        toast.success(isEditMode ? 'Cập nhật bài viết thành công!' : 'Tạo bài viết thành công!');
        navigate(`${prefix}/tintuc/tao`, { state: { activeTab: 'quan-ly' } });
      } else {
        toast.error(result?.message || 'Không thể lưu bài viết');
      }
    } catch {
      toast.error('Lỗi kết nối, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Filter list ──────────────────────────────────────────────
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(filterKeyword), 300);
    return () => clearTimeout(t);
  }, [filterKeyword]);

  const filteredList = useMemo(() => {
    return newsList.filter(item => {
      if (debouncedKeyword && !item.title?.toLowerCase().includes(debouncedKeyword.toLowerCase())) return false;
      if (filterDanhmuc && item.category !== filterDanhmuc) return false;
      if (filterTrangthai && item.status !== filterTrangthai) return false;
      if (filterLanoibat !== '' && String(item.lanoibat ?? (item.isFeatured ? 1 : 0)) !== filterLanoibat) return false;
      return true;
    });
  }, [newsList, debouncedKeyword, filterDanhmuc, filterTrangthai, filterLanoibat]);

  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE);
  const pagedList = filteredList.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE);

  useEffect(() => { setListPage(1); }, [debouncedKeyword, filterDanhmuc, filterTrangthai, filterLanoibat]);

  // ── Toggle status (nút Tạm dừng/Kích hoạt) ──────────────────
  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'Da xuat ban' ? 'Da an' : 'Da xuat ban';
    try {
      const res = await newsService.updateNewsStatus(item.id, newStatus);
      if (res?.success) {
        setNewsList(prev => prev.map(n => n.id === item.id ? { ...n, status: newStatus } : n));
        toast.success(newStatus === 'Da xuat ban' ? 'Đã kích hoạt bài viết' : 'Đã ẩn bài viết');
      } else {
        toast.error('Không thể cập nhật trạng thái');
      }
    } catch {
      toast.error('Lỗi kết nối');
    }
  };

  // ── Delete ───────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeletingId(deleteTarget.id);
      const res = await newsService.deleteNews(deleteTarget.id);
      if (res?.success) {
        setNewsList(prev => prev.filter(n => n.id !== deleteTarget.id));
        toast.success('Đã xóa bài viết');
        setDeleteTarget(null);
      } else {
        toast.error('Không thể xóa bài viết');
      }
    } catch {
      toast.error('Lỗi khi xóa bài viết');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Format date ──────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  };

  const selectedLanoibat = LANOIBAT_OPTIONS.find(o => o.value === Number(form.lanoibat));

  // ── Breadcrumb label ─────────────────────────────────────────
  const pageTitle = isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới';

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/" className={styles.crumbLink}>Trang chủ</Link>
          <span className={styles.crumbSep}>/</span>
          <Link to={parentUrl} className={styles.crumbLink}>Tin tức</Link>
          <span className={styles.crumbSep}>/</span>
          <span>{pageTitle}</span>
        </div>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Tin tức & Sự kiện</h1>
            <p className={styles.subtitle}>Quản lý và đăng tải bài viết tin tức cho hệ thống</p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="ghost" leftIcon={<HiOutlineArrowLeft />} onClick={() => navigate(parentUrl)}>
              Quay lại
            </Button>
          </div>
        </header>

        {/* Tab Navigation */}
        {!isEditMode && (
          <div className={styles.tabNav}>
            <Button
              variant="ghost"
              className={`${styles.tabItem} ${activeTab === 'tao' ? styles.tabItemActive : ''}`}
              onClick={() => setActiveTab('tao')}
              leftIcon={<HiOutlinePlusCircle className={styles.tabIcon} />}
            >
              Tạo bài viết mới
            </Button>
            <Button
              variant="ghost"
              className={`${styles.tabItem} ${activeTab === 'quan-ly' ? styles.tabItemActive : ''}`}
              onClick={() => setActiveTab('quan-ly')}
              leftIcon={<HiOutlineListBullet className={styles.tabIcon} />}
            >
              Quản lý bài viết
            </Button>
          </div>
        )}

        {/* ── TAB: TẠO / CHỈNH SỬA ───────────────────────────── */}
        {(activeTab === 'tao' || isEditMode) && (
          <>
            {loadingEdit ? (
              <div className={styles.loadingState}>Đang tải dữ liệu...</div>
            ) : (
              <>
                {/* Edit mode sub-header */}
                {isEditMode && (
                  <div className={styles.editBanner}>
                    <HiOutlinePencilSquare />
                    <span>Đang chỉnh sửa bài viết</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className={styles.layout}>
                    {/* Left Column */}
                    <div className={styles.leftCol}>
                      {/* Tiêu đề + Mô tả */}
                      <div className={styles.card}>
                        <div className={styles.cardHead}>
                          <HiOutlineNewspaper className={styles.cardIcon} />
                          <div>
                            <h2 className={styles.cardTitle}>Nội dung bài viết</h2>
                            <p className={styles.cardDesc}>Tiêu đề, mô tả và nội dung chi tiết</p>
                          </div>
                        </div>
                        {/* Title */}
                        <div className={styles.field}>
                          <label className={styles.label}>Tiêu đề <span className={styles.required}>*</span></label>
                          <input
                            id="news-title"
                            className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                            type="text"
                            placeholder="Nhập tiêu đề bài viết..."
                            value={form.title}
                            maxLength={255}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                          />
                          <div className={styles.fieldFoot}>
                            {errors.title ? <span className={styles.errorMsg}>{errors.title}</span> : <span />}
                            <span className={styles.counter}>{form.title.length} / 255</span>
                          </div>
                        </div>
                        {/* Summary */}
                        <div className={styles.field} style={{ marginTop: 12 }}>
                          <label className={styles.label}>Mô tả ngắn <span className={styles.required}>*</span></label>
                          <textarea
                            id="news-summary"
                            className={`${styles.textarea} ${errors.summary ? styles.textareaError : ''}`}
                            rows={3}
                            placeholder="Nhập mô tả ngắn hiển thị ở card preview..."
                            value={form.summary}
                            maxLength={500}
                            onChange={e => setForm(p => ({ ...p, summary: e.target.value }))}
                          />
                          <div className={styles.fieldFoot}>
                            {errors.summary ? <span className={styles.errorMsg}>{errors.summary}</span> : <span />}
                            <span className={styles.counter}>{form.summary.length} / 500</span>
                          </div>
                        </div>
                      </div>

                      {/* Quill Editor */}
                      <div className={styles.card}>
                        <div className={styles.cardHead}>
                          <HiOutlineNewspaper className={styles.cardIcon} />
                          <div>
                            <h2 className={styles.cardTitle}>Nội dung chi tiết</h2>
                            <p className={styles.cardDesc}>Soạn nội dung đầy đủ của bài viết</p>
                          </div>
                        </div>
                        <div className={`${styles.quillWrapper} ${errors.content ? styles.quillError : ''}`}>
                          <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={form.content}
                            onChange={val => setForm(p => ({ ...p, content: val }))}
                            modules={QUILL_MODULES}
                            formats={QUILL_FORMATS}
                            placeholder="Nhập nội dung bài viết..."
                          />
                        </div>
                        {errors.content && (
                          <div className={styles.fieldFoot} style={{ marginTop: 6 }}>
                            <span className={styles.errorMsg}>{errors.content}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className={styles.rightCol}>
                      {/* Cài đặt xuất bản */}
                      <div className={styles.card}>
                        <div className={styles.cardHead}>
                          <HiOutlineCog6Tooth className={styles.cardIcon} />
                          <div>
                            <h2 className={styles.cardTitle}>Cài đặt xuất bản</h2>
                            <p className={styles.cardDesc}>Trạng thái, ngày xuất bản, danh mục</p>
                          </div>
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Trạng thái</label>
                          <select id="news-status" className={styles.select} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                            {TRANGTHAI_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                        {form.status === 'Da xuat ban' && (
                          <div className={styles.field} style={{ marginTop: 12 }}>
                            <label className={styles.label}>Ngày xuất bản <span className={styles.required}>*</span></label>
                            <input id="news-publish-date" className={styles.dateInput} type="datetime-local" value={form.publishDate} onChange={e => setForm(p => ({ ...p, publishDate: e.target.value }))} />
                            {errors.publishDate && <span className={styles.errorMsg}>{errors.publishDate}</span>}
                          </div>
                        )}
                        <hr className={styles.divider} style={{ marginTop: 14 }} />
                        <div className={styles.field} style={{ marginTop: 12 }}>
                          <label className={styles.label}>Danh mục</label>
                          <select id="news-category" className={styles.select} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                            {DANHMUC_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                        </div>
                        <div className={styles.field} style={{ marginTop: 12 }}>
                          <label className={styles.label}>Vị trí hiển thị</label>
                          <select id="news-lanoibat" className={styles.select} value={form.lanoibat} onChange={e => setForm(p => ({ ...p, lanoibat: Number(e.target.value) }))}>
                            {LANOIBAT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                          </select>
                          {selectedLanoibat && <div className={styles.classifyNote}>💡 {selectedLanoibat.note}</div>}
                        </div>
                        <div style={{ marginTop: 16 }}>
                          <Button variant="primary" leftIcon={<HiOutlineCheckCircle />} onClick={handleSubmit} loading={submitting} disabled={submitting} style={{ width: '100%' }}>
                            {submitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Đăng bài')}
                          </Button>
                        </div>
                      </div>

                      {/* Ảnh đại diện */}
                      <div className={styles.card}>
                        <div className={styles.cardHead}>
                          <HiOutlinePhoto className={styles.cardIcon} />
                          <div>
                            <h2 className={styles.cardTitle}>Ảnh đại diện</h2>
                            <p className={styles.cardDesc}>Ảnh thumbnail hiển thị ở card bài viết</p>
                          </div>
                        </div>
                        <div className={styles.imageUploadBlock}>
                          <div className={styles.imagePreviewBox} onClick={() => avatarInputRef.current?.click()} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && avatarInputRef.current?.click()}>
                            {form.avatarPreviewUrl ? (
                              <img src={form.avatarPreviewUrl} alt="Preview" className={styles.previewImg} />
                            ) : (
                              <div className={styles.uploadPlaceholder}>
                                <HiOutlineArrowUpTray className={styles.uploadIcon} />
                                <span>Nhấn để chọn ảnh</span>
                                <span className={styles.uploadHint}>JPG, PNG, WEBP · Tối đa 5 MB</span>
                              </div>
                            )}
                          </div>
                          <div className={styles.imageActionsRow}>
                            <Button variant="secondary" size="sm" leftIcon={<HiOutlineArrowUpTray />} onClick={() => avatarInputRef.current?.click()} loading={uploadingAvatar} disabled={uploadingAvatar} style={{ flex: 1 }}>
                              {form.avatarPreviewUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
                            </Button>
                            {form.avatarPreviewUrl && (
                              <Button variant="outline-danger" size="sm" leftIcon={<HiOutlineTrash />} onClick={handleRemoveAvatar} style={{ flex: 1 }}>
                                Xóa
                              </Button>
                            )}
                          </div>
                          <input ref={avatarInputRef} type="file" accept="image/*" className={styles.hiddenFile} onChange={handleAvatarSelect} />
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </>
            )}
          </>
        )}

        {/* ── TAB: QUẢN LÝ ────────────────────────────────────── */}
        {activeTab === 'quan-ly' && !isEditMode && (
          <div className={styles.manageSection}>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <div className={styles.searchBox}>
                <HiOutlineMagnifyingGlass className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="Tìm theo tiêu đề..."
                  value={filterKeyword}
                  onChange={e => setFilterKeyword(e.target.value)}
                />
              </div>
              <select className={styles.filterSelect} value={filterDanhmuc} onChange={e => setFilterDanhmuc(e.target.value)}>
                <option value="">Tất cả danh mục</option>
                {DANHMUC_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className={styles.filterSelect} value={filterTrangthai} onChange={e => setFilterTrangthai(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                {TRANGTHAI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className={styles.filterSelect} value={filterLanoibat} onChange={e => setFilterLanoibat(e.target.value)}>
                <option value="">Tất cả vị trí</option>
                {LANOIBAT_OPTIONS.map(o => <option key={o.value} value={String(o.value)}>{o.label}</option>)}
              </select>
            </div>

            {/* Table */}
            <div className={styles.tableCard}>
              {loadingList ? (
                <div className={styles.loadingState}>Đang tải danh sách...</div>
              ) : filteredList.length === 0 ? (
                <div className={styles.emptyState}>
                  <HiOutlineNewspaper className={styles.emptyIcon} />
                  <p>Không có bài viết nào phù hợp</p>
                </div>
              ) : (
                <>
                  <div className={styles.tableInfo}>
                    Hiển thị {Math.min((listPage - 1) * PAGE_SIZE + 1, filteredList.length)} - {Math.min(listPage * PAGE_SIZE, filteredList.length)} trong tổng số {filteredList.length} bài viết
                  </div>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th className={styles.thAvatar}>Ảnh</th>
                          <th className={styles.thTitle}>Tiêu đề</th>
                          <th>Danh mục</th>
                          <th>Vị trí</th>
                          <th>Trạng thái</th>
                          <th>Ngày đăng</th>
                          <th className={styles.thActions}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedList.map(item => (
                          <tr key={item.id} className={styles.tableRow}>
                            <td>
                              <div className={styles.thumbCell}>
                                {item.avatar ? (
                                  <img src={item.avatar} alt="" className={styles.thumb} />
                                ) : (
                                  <div className={styles.thumbPlaceholder}>
                                    <HiOutlinePhoto />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className={styles.titleCell}>
                                <span className={styles.titleText}>{item.title}</span>
                                {item.summary && <span className={styles.summaryText}>{item.summary}</span>}
                              </div>
                            </td>
                            <td><CategoryBadge category={item.category} /></td>
                            <td><LanoibatBadge value={item.lanoibat ?? (item.isFeatured ? 1 : 0)} /></td>
                            <td><StatusBadge status={item.status} /></td>
                            <td className={styles.dateCell}>{formatDate(item.publishDate)}</td>
                            <td>
                              <div className={styles.actionButtons}>
                                {/* Edit */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`${styles.actionBtn} ${styles.actionEdit}`}
                                  title="Chỉnh sửa"
                                  onClick={() => navigate(`${prefix}/tintuc/chinh-sua/${item.id}`)}
                                >
                                  <HiOutlinePencilSquare />
                                </Button>
                                {/* Toggle status */}
                                <Popconfirm
                                  title={item.status === 'Da xuat ban' ? 'Ẩn bài viết này?' : 'Kích hoạt bài viết này?'}
                                  description={item.status === 'Da xuat ban' ? 'Bài viết sẽ bị ẩn khỏi trang công khai.' : 'Bài viết sẽ hiển thị công khai.'}
                                  onConfirm={() => handleToggleStatus(item)}
                                  okText="Xác nhận"
                                  cancelText="Hủy"
                                  okButtonProps={{ danger: item.status === 'Da xuat ban' }}
                                >
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`${styles.actionBtn} ${styles.actionToggle}`}
                                    title={item.status === 'Da xuat ban' ? 'Ẩn bài viết' : 'Kích hoạt'}
                                  >
                                    {item.status === 'Da xuat ban' ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                                  </Button>
                                </Popconfirm>
                                {/* Delete — chỉ Admin */}
                                {isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`${styles.actionBtn} ${styles.actionDelete}`}
                                    title="Xóa bài viết"
                                    onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                                  >
                                    <HiOutlineTrash />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className={styles.pagination}>
                      <Button
                        variant="secondary"
                        size="sm"
                        className={styles.pageBtn}
                        onClick={() => setListPage(p => Math.max(1, p - 1))}
                        disabled={listPage === 1}
                      >
                        ‹
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - listPage) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, idx) => p === '...'
                          ? <span key={`e${idx}`} className={styles.pageEllipsis}>…</span>
                          : <Button
                              key={p}
                              variant={p === listPage ? 'primary' : 'ghost'}
                              size="sm"
                              className={`${styles.pageBtn} ${p === listPage ? styles.pageBtnActive : ''}`}
                              onClick={() => setListPage(p)}
                            >
                              {p}
                            </Button>
                        )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className={styles.pageBtn}
                        onClick={() => setListPage(p => Math.min(totalPages, p + 1))}
                        disabled={listPage === totalPages}
                      >
                        ›
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Delete Confirm Modal ──────────────────────────────── */}
      {deleteTarget && (
        <div className={styles.modalOverlay} onClick={() => setDeleteTarget(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Xác nhận xóa bài viết</h3>
              <Button variant="ghost" className={styles.modalClose} onClick={() => setDeleteTarget(null)}>
                <HiOutlineXMark />
              </Button>
            </div>
            <div className={styles.modalBody}>
              <p>Bài viết <strong>"{deleteTarget.title}"</strong> sẽ bị xóa vĩnh viễn.</p>
              <p className={styles.modalWarning}>Hành động này không thể hoàn tác.</p>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Hủy</Button>
              <Button variant="danger" onClick={handleDeleteConfirm} loading={!!deletingId} disabled={!!deletingId}>
                Xóa bài viết
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaoTinTucPage;
