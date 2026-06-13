import FundTitleSection from '../FundsPage/FundTitleSection/FundTitleSection';

/**
 * DonorTitleSection Component
 * 
 * Section tiêu đề cho trang Nhà tài trợ
 * Tái sử dụng FundTitleSection với nội dung phù hợp
 */
const DonorTitleSection = () => {
  return (
    <FundTitleSection
      title="Bảng vinh danh"
      highlight="Đối tác & Nhà tài trợ"
      subtitle="Vinh danh những nhà hảo tâm và đối tác chiến lược đã đồng hành cùng Quỹ TVU để thắp sáng tương lai cho các thế hệ sinh viên Đại học Trà Vinh."
    />
  );
};

export default DonorTitleSection;
