import NewsSection from '../NewsSection';

const FeaturedNewsSection = ({ data, loading = false }) => {
  return (
    <NewsSection
      title="TIN NỔI BẬT"
      subtitle="Các bài viết nổi bật, sự kiện tiêu biểu và tin tức quan trọng được quan tâm nhiều nhất"
      data={data}
      loading={loading}
      sidebarPosition="left"
      type="noibat"
    />
  );
};

export default FeaturedNewsSection;
