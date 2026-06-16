import { useEffect, useMemo, useRef, useState } from 'react';
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';
import BackgroundImage from '@components/common/BackgroundImage';
import Button from '@components/common/Button/Button';
import Dropdown from '@components/common/Dropdown';
import Input from '@components/common/Input/Input';
import {
  TestimonialCard,
  TestimonialForm,
  TestimonialModal,
} from '@components/common/Testimonials';
import danhGiaService from '@services/danhGiaService';
import styles from './TestimonialsPage.module.scss';

const PAGE_SIZE = 12;

const TestimonialsPage = () => {
  const [items, setItems] = useState([]);
  const [khoaOptions, setKhoaOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedKhoa, setSelectedKhoa] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setKeyword(searchInput.trim());
      setPage(1);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await danhGiaService.getPublicList({
        page,
        pageSize: PAGE_SIZE,
        khoa: selectedKhoa || undefined,
        keyword: keyword || undefined,
      });

      if (response?.success) {
        setItems(response.danhgia || response.testimonials || []);
        setTotal(response.total || 0);
        setKhoaOptions(response.khoaOptions || []);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedKhoa, keyword]);

  const dropdownOptions = useMemo(() => ([
    { value: '', label: 'Tất cả khoa' },
    ...khoaOptions.map((item) => ({ value: item, label: item })),
  ]), [khoaOptions]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const fromItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toItem = Math.min(page * PAGE_SIZE, total);

  return (
    <div className={styles.page}>
      <BackgroundImage className={styles.banner} overlayType="dark">
        <div className={styles.bannerContent}>
          <h1>Sinh viên nói gì về TVU Fund</h1>
          <p>Những cảm nhận đã được kiểm duyệt từ sinh viên và cộng đồng TVU Fund.</p>
        </div>
      </BackgroundImage>

      <main className={styles.container}>
        <section className={styles.filterBar}>
          <div className={styles.filterControl}>
            <Dropdown
              options={dropdownOptions}
              value={selectedKhoa}
              onChange={(value) => {
                setSelectedKhoa(value || '');
                setPage(1);
              }}
              placeholder="Lọc theo khoa"
              clearable
            />
          </div>

          <div className={styles.searchControl}>
            <Input
              placeholder="Tìm theo tên hoặc nội dung..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              leftIcon={<HiOutlineMagnifyingGlass />}
            />
          </div>

          <div className={styles.countText}>
            Hiển thị {fromItem}-{toItem} trong tổng số {total} cảm nhận
          </div>
        </section>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={styles.skeletonCard} />
            ))}
          </div>
        ) : items.length > 0 ? (
          <section className={styles.grid}>
            {items.map((item) => (
              <TestimonialCard
                key={item.id || item.danhGiaId}
                testimonial={item}
                fixedHeight
                onReadMore={setSelectedTestimonial}
              />
            ))}
          </section>
        ) : (
          <section className={styles.emptyState}>
            Không có cảm nhận phù hợp với bộ lọc hiện tại.
          </section>
        )}

        {!loading && total > 0 && (
          <div className={styles.pagination}>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<HiOutlineChevronLeft />}
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Trước
            </Button>
            <span>{page} / {totalPages}</span>
            <Button
              variant="secondary"
              size="sm"
              rightIcon={<HiOutlineChevronRight />}
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Tiếp
            </Button>
          </div>
        )}

        <section className={styles.submitSection}>
          <div className={styles.submitIntro}>
            <h2>Bạn cũng muốn chia sẻ?</h2>
            <p>Gửi câu chuyện của bạn để TVU Fund có thể lan tỏa thêm những trải nghiệm thật.</p>
          </div>
          <TestimonialForm inline onSuccess={fetchTestimonials} />
        </section>
      </main>

      <TestimonialModal
        open={!!selectedTestimonial}
        mode="detail"
        testimonial={selectedTestimonial}
        onClose={() => setSelectedTestimonial(null)}
      />
    </div>
  );
};

export default TestimonialsPage;
