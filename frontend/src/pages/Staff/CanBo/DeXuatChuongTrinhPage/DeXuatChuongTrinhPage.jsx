import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { 
  Table, Tag, Button, Modal, Form, Select, InputNumber, 
  Input, Space, Popconfirm, Card, Col, Row, Statistic, DatePicker 
} from 'antd';
import { 
  HiOutlineLightBulb, HiOutlineCheck, HiOutlineXMark,
  HiOutlineBanknotes, HiOutlineDocumentCheck,
  HiOutlineEye, HiOutlineRocketLaunch
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import useAuthStore from '@stores/authStore';
import proposalService from '@services/proposalService';
import api from '@services/api';
import { formatCurrency, formatCurrencyPlain } from '@utils/formatters';
import styles from './DeXuatChuongTrinhPage.module.scss';

const { RangePicker } = DatePicker;

const DeXuatChuongTrinhPage = ({ embedded = false }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const soLuongSuat = Form.useWatch('soLuongSuat', form);
  const soTienMoiSuat = Form.useWatch('soTienMoiSuat', form);
  const tongSoTien = (Number(soLuongSuat) || 0) * (Number(soTienMoiSuat) || 0);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Danh sách quỹ thành phần (cấp 2)
  const [quyThanhPhanList, setQuyThanhPhanList] = useState([]);
  
  // Thống kê
  const [stats, setStats] = useState({ choDuyet: 0, daDuyet: 0, tuChoi: 0 });
  
  // Trạng thái modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Bộ lọc
  const [filterStatus, setFilterStatus] = useState('');
  const [filterQuyThanhPhan, setFilterQuyThanhPhan] = useState('');

  // Quyền
  const isAdmin = user?.vaiTro === 1;
  const isCanBo = user?.vaiTro === 3;
  const canCreate = isAdmin || isCanBo;

  // Load danh sách đề xuất
  const fetchProposals = async () => {
    setLoading(true);
    try {
      const res = await proposalService.getProposals({
        quy_thanh_phan_id: filterQuyThanhPhan,
        trang_thai: filterStatus,
        page,
        page_size: pageSize
      });
      if (res?.success) {
        setData(res.data || []);
        setTotal(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
      toast.error('Lỗi khi tải danh sách đề xuất chương trình');
    } finally {
      setLoading(false);
    }
  };

  // Load thống kê
  const fetchStats = async () => {
    try {
      const res = await proposalService.getProposalStats();
      if (res?.success) {
        setStats(res.data || { choDuyet: 0, daDuyet: 0, tuChoi: 0 });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Load danh sách quỹ thành phần (cấp 2)
  const fetchFunds = async () => {
    try {
      const res = await api.get('/funds');
      if (res?.data?.funds) {
        const funds = res.data.funds;
        // Lọc quỹ cấp 2 (quỹ thành phần)
        setQuyThanhPhanList(funds.filter(f => f.capDo === 2));
      }
    } catch (err) {
      console.error('Error fetching funds:', err);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [page, pageSize, filterStatus, filterQuyThanhPhan]);

  useEffect(() => {
    fetchFunds();
    fetchStats();
  }, []);

  // Gửi đề xuất chương trình mới
  const handleCreateSubmit = async (values) => {
    try {
      const payload = {
        quy_thanh_phan_id: values.quyThanhPhanId,
        ten_chuong_trinh: values.tenChuongTrinh,
        mo_ta: values.moTa || null,
        so_luong_suat: values.soLuongSuat,
        so_tien_moi_suat: values.soTienMoiSuat,
        loai_ho_tro: values.loaiHoTro || 'Tai tro khong hoan lai',
        ngay_bat_dau: values.thoiGian ? values.thoiGian[0].format('YYYY-MM-DD') : null,
        ngay_ket_thuc: values.thoiGian ? values.thoiGian[1].format('YYYY-MM-DD') : null
      };

      const res = await proposalService.createProposal(payload);
      if (res?.success) {
        toast.success(res.message || "Tạo đề xuất chương trình thành công");
        setIsCreateModalOpen(false);
        form.resetFields();
        fetchProposals();
        fetchStats();
        fetchFunds(); // Cập nhật lại số dư
      }
    } catch (err) {
      console.error("Submit proposal error:", err);
      toast.error(err.response?.data?.message || "Lỗi khi tạo đề xuất chương trình");
    }
  };

  // Xem chi tiết đề xuất (điều hướng theo vai trò đến ProposalDetailPage)
  const handleViewDetail = (record) => {
    const role = user?.vaiTro;
    if (role === 1) navigate(`/admin/de-xuat/${record.de_xuat_id}`);
    else if (role === 2) navigate(`/ke-toan/de-xuat/${record.de_xuat_id}`);
    else if (role === 3) navigate(`/can-bo/de-xuat/${record.de_xuat_id}`);
    else if (role === 5) navigate(`/kiem-soat/de-xuat/${record.de_xuat_id}`);
  };

  // Định nghĩa các cột cho Table
  const columns = [
    {
      title: 'Mã số',
      dataIndex: 'de_xuat_id',
      key: 'de_xuat_id',
      width: 70,
      render: (id) => <strong>#{id}</strong>
    },
    {
      title: 'Thông tin chương trình',
      key: 'program_info',
      width: 260,
      render: (_, record) => (
        <div className={styles.programInfo}>
          <div className={styles.programName} title={record.ten_chuong_trinh}>
            <strong>{record.ten_chuong_trinh}</strong>
          </div>
          <div className={styles.fundInfo}>
            <span className={styles.fundTypeTag}>Quỹ thành phần</span>
            <span className={styles.fundName} title={record.ten_quy_thanh_phan}>
              {record.ten_quy_thanh_phan}
            </span>
          </div>
          {record.mo_ta && (
            <div className={styles.programDesc} title={record.mo_ta}>
              {record.mo_ta}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Ngân sách dự kiến',
      key: 'budget',
      width: 160,
      render: (_, record) => (
        <div className={styles.budgetInfo}>
          <div><strong>{record.so_luong_suat}</strong> suất</div>
          <div>{formatCurrency(record.so_tien_moi_suat)}/suất</div>
          <div className={styles.totalBudget}>
            Tổng: <strong>{formatCurrency(record.tong_so_tien)}</strong>
          </div>
        </div>
      )
    },
    {
      title: 'Loại hỗ trợ',
      dataIndex: 'loai_ho_tro',
      key: 'loai_ho_tro',
      width: 150,
      render: (loai) => {
        let color = 'blue';
        let label = loai;
        if (loai === 'Tai tro khong hoan lai') {
          color = 'green';
          label = 'Tài trợ không hoàn lại';
        } else if (loai === 'Tai tro co thu hoi') {
          color = 'orange';
          label = 'Tài trợ có thu hồi';
        } else if (loai === 'Cho vay') {
          color = 'purple';
          label = 'Cho vay';
        }
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: 'Nhà tài trợ / Người đề xuất',
      key: 'proposer',
      width: 160,
      render: (_, record) => (
        <div className={styles.proposerInfo}>
          {record.ten_nha_tai_tro ? (
            <>
              <div><strong>{record.ten_nha_tai_tro}</strong></div>
              <div style={{fontSize: '12px', color: '#94a3b8'}}>{record.loai_nha_tai_tro}</div>
              {record.so_tien_tai_tro && (
                <div style={{fontSize: '12px', color: '#059669'}}>
                  Tài trợ: {formatCurrency(record.so_tien_tai_tro)}
                </div>
              )}
            </>
          ) : (
            <span style={{color: '#94a3b8', fontStyle: 'italic'}}>Chưa có nhà tài trợ</span>
          )}
        </div>
      )
    },
    {
      title: 'Thời gian',
      key: 'time_info',
      width: 140,
      render: (_, record) => (
        <div className={styles.timeInfo}>
          <div><small style={{color: '#94a3b8'}}>Đề xuất:</small></div>
          <div>{new Date(record.ngay_tao).toLocaleDateString('vi-VN')}</div>
          {record.ngay_bat_dau && record.ngay_ket_thuc && (
            <>
              <div style={{marginTop: '8px'}}><small style={{color: '#94a3b8'}}>Thực hiện:</small></div>
              <div style={{fontSize: '12px'}}>
                {new Date(record.ngay_bat_dau).toLocaleDateString('vi-VN')} - {new Date(record.ngay_ket_thuc).toLocaleDateString('vi-VN')}
              </div>
            </>
          )}
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trang_thai',
      key: 'trang_thai',
      width: 130,
      render: (status) => {
        let color = 'default';
        let label = status;
        if (status === 'Cho duyet') { color = 'orange'; label = 'Chờ duyệt'; }
        else if (status === 'Can bo da duyet') { color = 'blue'; label = 'Cán bộ đã duyệt'; }
        else if (status === 'Da nhan tien') { color = 'purple'; label = 'Đã nhận tiền'; }
        else if (status === 'Da tao hoat dong') { color = 'green'; label = 'Đã tạo hoạt động'; }
        else if (status === 'Da duyet') { color = 'green'; label = 'Đã duyệt'; }
        else if (status === 'Tu choi') { color = 'red'; label = 'Từ chối'; }
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 190,
      fixed: 'right',
      render: (_, record) => {
        const isPending = record.trang_thai === 'Cho duyet';
        const isApproved = record.trang_thai === 'Da tao hoat dong';

        return (
          <Space size="middle">
            <button
              type="button"
              className={styles.detailBtn}
              onClick={() => handleViewDetail(record)}
              title="Xem chi tiết"
              aria-label="Xem chi tiết"
            >
              <HiOutlineEye />
            </button>

            {isApproved && record.ten_quy_ket_qua && (
              <div className={styles.approvedInfo}>
                <div style={{fontSize: '12px', color: '#059669'}}>
                  ✓ Đã tạo quỹ
                </div>
                <div style={{fontSize: '11px', color: '#94a3b8'}} title={record.ten_quy_ket_qua}>
                  {record.ten_quy_ket_qua}
                </div>
              </div>
            )}

            {isPending && <span className={styles.onlyView}>Đang chờ duyệt</span>}
            {['Da nhan tien', 'Can bo da duyet'].includes(record.trang_thai) && (
              <span className={styles.noAction}>Đang xử lý</span>
            )}
            {!isPending && !isApproved && !['Da nhan tien', 'Can bo da duyet'].includes(record.trang_thai) && (
              <span className={styles.noAction}>N/A</span>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div className={embedded ? styles.embedded : styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản lý Đề xuất Chương trình</h1>
          <p className={styles.subtitle}>Đề xuất và duyệt các chương trình mới cho quỹ thành phần</p>
        </div>
        {canCreate && (
          <Button 
            type="primary" 
            icon={<HiOutlineLightBulb />} 
            size="large"
            onClick={() => setIsCreateModalOpen(true)}
            className={styles.mainActionBtn}
          >
            Đề xuất chương trình mới
          </Button>
        )}
      </header>

      {/* Grid thống kê */}
      <Row gutter={[16, 16]} className={styles.statCards}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Chờ cán bộ duyệt"
              value={stats.choDuyet}
              valueStyle={{ color: '#f59e0b' }}
              prefix={<HiOutlineDocumentCheck />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Chờ kế toán xác nhận"
              value={stats.canBoPheDuyet}
              valueStyle={{ color: '#3b82f6' }}
              prefix={<HiOutlineBanknotes />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Chờ admin tạo hoạt động"
              value={stats.daNhanTien}
              valueStyle={{ color: '#8b5cf6' }}
              prefix={<HiOutlineRocketLaunch />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Đã tạo hoạt động"
              value={stats.daTaoHoatDong}
              valueStyle={{ color: '#10b981' }}
              prefix={<HiOutlineCheck />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className={styles.statCard}>
            <Statistic
              title="Từ chối"
              value={stats.tuChoi}
              valueStyle={{ color: '#ef4444' }}
              prefix={<HiOutlineXMark />}
            />
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc danh sách */}
      <div className={styles.filterBar}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Select
              className={styles.filterSelect}
              placeholder="Lọc theo trạng thái"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
              options={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'Cho duyet', label: 'Chờ duyệt' },
                { value: 'Can bo da duyet', label: 'Cán bộ đã duyệt' },
                { value: 'Da nhan tien', label: 'Đã nhận tiền' },
                { value: 'Da tao hoat dong', label: 'Đã tạo hoạt động' },
                { value: 'Tu choi', label: 'Từ chối' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Select
              className={styles.filterSelect}
              placeholder="Lọc theo quỹ thành phần"
              value={filterQuyThanhPhan}
              onChange={setFilterQuyThanhPhan}
              style={{ width: '100%' }}
              options={[
                { value: '', label: 'Tất cả quỹ thành phần' },
                ...quyThanhPhanList.map(f => ({ value: f.quyId, label: f.tenQuy }))
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
          rowKey="de_xuat_id"
          scroll={{ x: 1300 }}
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
            showTotal: (total) => `Tổng số: ${total} đề xuất`
          }}
        />
      </Card>

      {/* Modal tạo đề xuất chương trình */}
      <Modal
        title="Đề xuất chương trình mới"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSubmit}
          initialValues={{ 
            soLuongSuat: 10,
            soTienMoiSuat: 1000000,
            loaiHoTro: 'Tai tro khong hoan lai'
          }}
          style={{ marginTop: '16px' }}
        >
          <Form.Item
            name="quyThanhPhanId"
            label="Chọn quỹ thành phần"
            rules={[{ required: true, message: 'Vui lòng chọn quỹ thành phần!' }]}
          >
            <Select
              placeholder="Chọn quỹ thành phần (cấp 2)"
              options={quyThanhPhanList.map(f => ({
                value: f.quyId,
                label: `${f.tenQuy} (Số dư: ${formatCurrencyPlain(f.soDu)}đ)`
              }))}
            />
          </Form.Item>

          <Form.Item
            name="tenChuongTrinh"
            label="Tên chương trình"
            rules={[{ required: true, message: 'Vui lòng nhập tên chương trình!' }]}
          >
            <Input placeholder="Ví dụ: Học bổng Trung thu cho SV khó khăn năm 2026" />
          </Form.Item>

          <Form.Item
            name="moTa"
            label="Mô tả chương trình"
          >
            <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn về mục tiêu và đối tượng của chương trình" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="soLuongSuat"
                label="Số lượng suất"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng suất!' },
                  { type: 'number', min: 1, message: 'Số lượng suất phải ≥ 1' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Số suất"
                  min={1}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="soTienMoiSuat"
                label="Số tiền mỗi suất (đ)"
                rules={[
                  { required: true, message: 'Vui lòng nhập số tiền!' },
                  { type: 'number', min: 1000, message: 'Số tiền tối thiểu là 1.000đ' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="Số tiền"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Tổng số tiền tài trợ (đ)"
            style={{ marginBottom: 24 }}
          >
            <div className={styles.totalMoneyBox}>
              {tongSoTien > 0 ? formatCurrency(tongSoTien) : '0'} đ
            </div>
          </Form.Item>

          <Form.Item
            name="loaiHoTro"
            label="Loại hình hỗ trợ"
            rules={[{ required: true, message: 'Vui lòng chọn loại hình hỗ trợ!' }]}
          >
            <Select
              options={[
                { value: 'Tai tro khong hoan lai', label: 'Tài trợ không hoàn lại' },
                { value: 'Tai tro co thu hoi', label: 'Tài trợ có thu hồi' },
                { value: 'Cho vay', label: 'Cho vay' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="thoiGian"
            label="Thời gian thực hiện chương trình"
          >
            <RangePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
            <Button onClick={() => {
              setIsCreateModalOpen(false);
              form.resetFields();
            }}>Hủy</Button>
            <Button type="primary" htmlType="submit">Gửi đề xuất</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

DeXuatChuongTrinhPage.propTypes = {
  embedded: PropTypes.bool,
};

export default DeXuatChuongTrinhPage;
