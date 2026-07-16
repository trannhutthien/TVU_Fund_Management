import React, { useState, useEffect } from 'react';
import { 
  Table, Tag, Button, Modal, Form, Select, InputNumber, 
  Input, Upload, Space, Popconfirm, Tooltip, Card, Col, Row, Statistic 
} from 'antd';
import { 
  HiOutlineBanknotes, HiOutlineArrowPath, HiOutlineArrowUpTray, 
  HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlineXCircle, 
  HiOutlineTrash, HiOutlineCheck, HiOutlineXMark 
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import useAuthStore from '@stores/authStore';
import api from '@services/api';
import allocationService from '@services/allocationService';
import { uploadService } from '@services/uploadService';
import { formatCurrency, formatCurrencyPlain } from '@utils/formatters';
import styles from './PhanBoPage.module.scss';

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
).replace(/\/api\/?$/, '');

const getFileUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
};

const PhanBoPage = () => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Danh sách quỹ để tạo đề xuất
  const [allFunds, setAllFunds] = useState([]);
  const [beChungList, setBeChungList] = useState([]);
  const [mucChiList, setMucChiList] = useState([]);
  
  // Trạng thái modal
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  
  // File upload state
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFilePath, setUploadedFilePath] = useState('');

  // Bộ lọc
  const [filterStatus, setFilterStatus] = useState('');
  const [filterQuyNguon, setFilterQuyNguon] = useState('');
  const [filterQuyDich, setFilterQuyDich] = useState('');

  // Quyền
  const isAdmin = user?.role_id === 1;
  const isKeToan = user?.role_id === 2;
  const isCanBo = user?.role_id === 3;
  const canRequest = isAdmin || isCanBo;
  const canApprove = isAdmin;

  // Load danh sách đề xuất trích lập
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await allocationService.getAllocationRequests({
        quy_nguon_id: filterQuyNguon,
        quy_dich_id: filterQuyDich,
        trang_thai: filterStatus,
        page,
        page_size: pageSize
      });
      if (res?.success) {
        setData(res.data || []);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Error fetching allocation requests:', err);
      toast.error('Lỗi khi tải danh sách đề xuất trích lập');
    } finally {
      setLoading(false);
    }
  };

  // Load danh sách quỹ
  const fetchFunds = async () => {
    try {
      const res = await api.get('/funds');
      if (res?.data?.funds) {
        const funds = res.data.funds;
        setAllFunds(funds);
        // Lọc bể chung
        setBeChungList(funds.filter(f => f.loaiDieuHanh === 'Tap trung - Be chung'));
      }
    } catch (err) {
      console.error('Error fetching funds:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, pageSize, filterStatus, filterQuyNguon, filterQuyDich]);

  useEffect(() => {
    fetchFunds();
  }, []);

  // Xử lý đổi Bể chung nguồn ở form đề xuất
  const handleSourceFundChange = (value) => {
    form.setFieldsValue({ quyDichId: undefined });
    if (!value) {
      setMucChiList([]);
      return;
    }
    // Lọc các mục chi con thuộc bể chung được chọn
    setMucChiList(allFunds.filter(f => f.loaiDieuHanh === 'Tap trung - Muc chi' && f.quyChaId === parseInt(value)));
  };

  // Xử lý upload file quyết định
  const handleUploadFile = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const res = await uploadService.uploadFile(file);
      if (res?.success && res?.data?.filePath) {
        setUploadedFilePath(res.data.filePath);
        onSuccess("Ok");
        toast.success("Tải quyết định lên thành công");
      } else {
        onError(new Error("Upload failed"));
        toast.error("Không thể tải file lên");
      }
    } catch (err) {
      console.error("Upload file error:", err);
      onError(err);
      toast.error("Lỗi khi tải file lên");
    } finally {
      setUploading(false);
    }
  };

  // Gửi đề xuất trích lập
  const handleRequestSubmit = async (values) => {
    try {
      const payload = {
        quyNguonId: values.quyNguonId,
        quyDichId: values.quyDichId,
        soTien: values.soTien,
        soQuyetDinh: values.soQuyetDinh,
        fileQuyetDinh: uploadedFilePath || null,
        ghiChu: values.ghiChu || null
      };

      const res = await allocationService.requestAllocation(payload);
      if (res?.success) {
        toast.success(res.message || "Gửi đề xuất trích lập thành công");
        setIsRequestModalOpen(false);
        form.resetFields();
        setFileList([]);
        setUploadedFilePath('');
        fetchRequests();
        fetchFunds(); // Cập nhật lại số dư
      }
    } catch (err) {
      console.error("Submit request allocation error:", err);
      toast.error(err.response?.data?.message || "Lỗi khi gửi đề xuất trích lập");
    }
  };

  // Duyệt trích lập
  const handleApprove = async (id) => {
    try {
      const res = await allocationService.approveAllocation(id);
      if (res?.success) {
        toast.success("Phê duyệt trích lập ngân sách thành công");
        fetchRequests();
        fetchFunds(); // Cập nhật lại số dư
      }
    } catch (err) {
      console.error("Approve allocation error:", err);
      toast.error(err.response?.data?.message || "Lỗi khi phê duyệt trích lập");
    }
  };

  // Từ chối trích lập
  const handleRejectSubmit = async (values) => {
    try {
      const res = await allocationService.rejectAllocation(selectedRequestId, values.lyDoTuChoi);
      if (res?.success) {
        toast.success("Từ chối đề xuất trích lập thành công");
        setIsRejectModalOpen(false);
        rejectForm.resetFields();
        fetchRequests();
      }
    } catch (err) {
      console.error("Reject allocation error:", err);
      toast.error(err.response?.data?.message || "Lỗi khi từ chối trích lập");
    }
  };

  // Thu hồi trích lập
  const handleRollback = async (id) => {
    try {
      const res = await allocationService.rollbackAllocation(id);
      if (res?.success) {
        toast.success("Thu hồi ngân sách trích lập thành công");
        fetchRequests();
        fetchFunds(); // Cập nhật lại số dư
      }
    } catch (err) {
      console.error("Rollback allocation error:", err);
      toast.error(err.response?.data?.message || "Lỗi khi thu hồi ngân sách");
    }
  };

  // Định nghĩa các cột cho Table
  const columns = [
    {
      title: 'Mã số',
      dataIndex: 'phanBoNganSachId',
      key: 'phanBoNganSachId',
      width: 80,
      render: (id) => <strong>#{id}</strong>
    },
    {
      title: 'Thông tin quỹ điều chuyển',
      key: 'funds_info',
      render: (_, record) => (
        <div className={styles.fundRoute}>
          <div className={styles.sourceFund}>
            <span className={styles.fundTypeTag}>Bể nguồn</span>
            <span className={styles.fundName}>{record.tenQuyNguon}</span>
          </div>
          <div className={styles.fundArrow}>➔</div>
          <div className={styles.destFund}>
            <span className={styles.fundTypeTagCon}>Mục chi con</span>
            <span className={styles.fundName}>{record.tenQuyDich}</span>
          </div>
        </div>
      )
    },
    {
      title: 'Số tiền trích',
      dataIndex: 'soTien',
      key: 'soTien',
      width: 140,
      render: (amount) => (
        <span className={styles.amountText}>
          {formatCurrency(amount)}
        </span>
      )
    },
    {
      title: 'Quyết định / Văn bản',
      key: 'quyet_dinh',
      width: 180,
      render: (_, record) => (
        <div className={styles.docInfo}>
          <div className={styles.docNo}>QĐ: {record.soQuyetDinh}</div>
          {record.fileQuyetDinh ? (
            <a 
              href={getFileUrl(record.fileQuyetDinh)} 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.docLink}
            >
              <HiOutlineDocumentText /> Xem minh chứng
            </a>
          ) : (
            <span className={styles.noDoc}>Không có file</span>
          )}
        </div>
      )
    },
    {
      title: 'Nhân sự',
      key: 'staff_info',
      width: 180,
      render: (_, record) => (
        <div className={styles.staffInfo}>
          <div>Đề xuất: <strong>{record.tenNguoiDeXuat}</strong></div>
          {record.tenNguoiDuyet && (
            <div>Duyệt: <strong>{record.tenNguoiDuyet}</strong></div>
          )}
        </div>
      )
    },
    {
      title: 'Thời gian',
      key: 'time_info',
      width: 150,
      render: (_, record) => (
        <div className={styles.timeInfo}>
          <div>Đề xuất: {new Date(record.ngayDeXuat).toLocaleDateString('vi-VN')}</div>
          {record.ngayDuyet && (
            <div>Duyệt: {new Date(record.ngayDuyet).toLocaleDateString('vi-VN')}</div>
          )}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      width: 130,
      render: (status) => {
        let color = 'default';
        let label = status;
        if (status === 'Cho duyet') { color = 'orange'; label = 'Chờ duyệt'; }
        else if (status === 'Da duyet') { color = 'green'; label = 'Đã duyệt'; }
        else if (status === 'Tu choi') { color = 'red'; label = 'Từ chối'; }
        else if (status === 'Da thu hoi') { color = 'purple'; label = 'Đã thu hồi'; }
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => {
        const isPending = record.trangThai === 'Cho duyet';
        const isApproved = record.trangThai === 'Da duyet';

        return (
          <Space size="middle">
            {isPending && canApprove && (
              <>
                <Popconfirm
                  title="Duyệt trích lập ngân sách"
                  description="Bạn có chắc chắn muốn duyệt đề xuất trích lập ngân sách này? Hành động này sẽ cập nhật số dư các quỹ."
                  onConfirm={() => handleApprove(record.phanBoNganSachId)}
                  okText="Duyệt"
                  cancelText="Hủy"
                >
                  <Button 
                    type="primary" 
                    size="small" 
                    icon={<HiOutlineCheck />} 
                    className={styles.approveBtn}
                  >
                    Duyệt
                  </Button>
                </Popconfirm>
                <Button 
                  danger 
                  size="small" 
                  icon={<HiOutlineXMark />}
                  onClick={() => {
                    setSelectedRequestId(record.phanBoNganSachId);
                    setIsRejectModalOpen(true);
                  }}
                >
                  Từ chối
                </Button>
              </>
            )}

            {isApproved && canApprove && (
              <Popconfirm
                title="Thu hồi ngân sách trích lập"
                description="Bạn có chắc chắn muốn thu hồi khoản trích lập này? Số dư sẽ được điều chuyển hoàn trả ngược lại Bể chung."
                onConfirm={() => handleRollback(record.phanBoNganSachId)}
                okText="Thu hồi"
                cancelText="Hủy"
              >
                <Button 
                  type="default" 
                  danger
                  size="small" 
                  icon={<HiOutlineArrowPath />}
                >
                  Thu hồi
                </Button>
              </Popconfirm>
            )}

            {isPending && !canApprove && (
              <span className={styles.onlyView}>Đang chờ duyệt</span>
            )}
            {!isPending && !isApproved && (
              <span className={styles.noAction}>N/A</span>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý Trích lập Ngân sách</h1>
          <p className={styles.subtitle}>Điều chuyển hạn mức ngân sách từ Bể tiền chung phát triển sang các Mục chi con</p>
        </div>
        {canRequest && (
          <Button 
            type="primary" 
            icon={<HiOutlineBanknotes />} 
            size="large"
            onClick={() => setIsRequestModalOpen(true)}
            className={styles.mainActionBtn}
          >
            Đề xuất trích tiền
          </Button>
        )}
      </header>

      {/* Grid thống kê số dư Bể lớn */}
      <Row gutter={[16, 16]} className={styles.statCards}>
        {beChungList.map(fund => (
          <Col xs={24} sm={12} md={8} key={fund.quyId}>
            <Card bordered={false} className={styles.statCard}>
              <Statistic
                title={`Bể tiền chung: ${fund.tenQuy}`}
                value={parseFloat(fund.soDu || 0)}
                precision={0}
                valueStyle={{ color: '#1a2f5e', fontWeight: 800 }}
                prefix={<HiOutlineBanknotes style={{ marginRight: '6px' }} />}
                suffix="đ"
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Bộ lọc danh sách */}
      <div className={styles.filterBar}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={6}>
            <Select
              className={styles.filterSelect}
              placeholder="Lọc theo trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'Cho duyet', label: 'Chờ duyệt' },
                { value: 'Da duyet', label: 'Đã duyệt' },
                { value: 'Tu choi', label: 'Từ chối' },
                { value: 'Da thu hoi', label: 'Đã thu hồi' },
              ]}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              className={styles.filterSelect}
              placeholder="Lọc theo Bể tiền chung nguồn"
              value={filterQuyNguon}
              onChange={setFilterQuyNguon}
              options={[
                { value: '', label: 'Tất cả Bể chung nguồn' },
                ...beChungList.map(f => ({ value: f.quyId, label: f.tenQuy }))
              ]}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              className={styles.filterSelect}
              placeholder="Lọc theo Mục chi đích"
              value={filterQuyDich}
              onChange={setFilterQuyDich}
              options={[
                { value: '', label: 'Tất cả Mục chi đích' },
                ...allFunds.filter(f => f.loaiDieuHanh === 'Tap trung - Muc chi').map(f => ({ value: f.quyId, label: f.tenQuy }))
              ]}
            />
          </Col>
        </Row>
      </div>

      {/* Bảng danh sách đề xuất */}
      <Card bordered={false} className={styles.tableCard}>
        <Table 
          columns={columns} 
          dataSource={data}
          loading={loading}
          rowKey="phanBoNganSachId"
          scroll={{ x: 1100 }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng số: ${total} bản ghi`
          }}
        />
      </Card>

      {/* Modal đề xuất trích lập ngân sách */}
      <Modal
        title="Đề xuất trích lập ngân sách"
        open={isRequestModalOpen}
        onCancel={() => {
          setIsRequestModalOpen(false);
          form.resetFields();
          setFileList([]);
          setUploadedFilePath('');
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRequestSubmit}
          initialValues={{ soTien: 1000000 }}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="quyNguonId"
            label="Chọn Bể tiền chung nguồn"
            rules={[{ required: true, message: 'Vui lòng chọn Quỹ phát triển chung nguồn!' }]}
          >
            <Select
              placeholder="Chọn Quỹ chung (Bể lớn)"
              onChange={handleSourceFundChange}
              options={beChungList.map(f => ({
                value: f.quyId,
                label: `${f.tenQuy} (Số dư: ${formatCurrencyPlain(f.soDu)}đ)`
              }))}
            />
          </Form.Item>

          <Form.Item
            name="quyDichId"
            label="Chọn Mục chi con nhận tiền"
            rules={[{ required: true, message: 'Vui lòng chọn Mục chi con!' }]}
          >
            <Select
              placeholder="Chọn Mục chi con"
              disabled={mucChiList.length === 0}
              options={mucChiList.map(f => ({
                value: f.quyId,
                label: `${f.tenQuy} (Số dư: ${formatCurrencyPlain(f.soDu)}đ)`
              }))}
            />
          </Form.Item>

          <Form.Item
            name="soTien"
            label="Số tiền trích lập (đ)"
            rules={[
              { required: true, message: 'Vui lòng nhập số tiền!' },
              { type: 'number', min: 1000, message: 'Số tiền tối thiểu là 1.000đ' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập số tiền điều chuyển"
            />
          </Form.Item>

          <Form.Item
            name="soQuyetDinh"
            label="Số quyết định trích lập"
            rules={[{ required: true, message: 'Vui lòng nhập Số quyết định của Hội đồng trường!' }]}
          >
            <Input placeholder="Ví dụ: QĐ-HĐTr/2026/02-QD" />
          </Form.Item>

          <Form.Item
            label="File quyết định đính kèm (Minh chứng PDF, Word)"
            extra="Đính kèm văn bản quyết định đã được duyệt"
          >
            <Upload
              customRequest={handleUploadFile}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              maxCount={1}
              onRemove={() => {
                setFileList([]);
                setUploadedFilePath('');
              }}
            >
              <Button icon={<HiOutlineArrowUpTray />}>Tải lên văn bản</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="ghiChu"
            label="Ghi chú / Mô tả mục đích"
          >
            <Input.TextArea rows={3} placeholder="Mô tả tóm tắt nội dung quyết định và mục đích phân bổ" />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <Button onClick={() => {
              setIsRequestModalOpen(false);
              form.resetFields();
              setFileList([]);
              setUploadedFilePath('');
            }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={uploading}>Gửi đề xuất</Button>
          </div>
        </Form>
      </Modal>

      {/* Modal từ chối phê duyệt */}
      <Modal
        title="Từ chối đề xuất trích lập ngân sách"
        open={isRejectModalOpen}
        onCancel={() => {
          setIsRejectModalOpen(false);
          rejectForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectSubmit}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="lyDoTuChoi"
            label="Lý do từ chối"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối đề xuất này!' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập lý do cụ thể gửi tới Cán bộ đề xuất..." />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <Button onClick={() => {
              setIsRejectModalOpen(false);
              rejectForm.resetFields();
            }}>Hủy</Button>
            <Button type="primary" danger htmlType="submit">Xác nhận từ chối</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PhanBoPage;
