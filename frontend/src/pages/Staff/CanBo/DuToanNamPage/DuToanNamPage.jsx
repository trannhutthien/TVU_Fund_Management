import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Tag, Button, Modal, Form, InputNumber,
  Input, Space, Popconfirm, Card, Tooltip, Descriptions,
  Divider, Statistic, Row, Col, Upload, List
} from 'antd';
import {
  HiOutlinePlus, HiOutlineCheckCircle, HiOutlineXCircle,
  HiOutlineEye, HiOutlinePaperClip, HiOutlineTrash
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import useAuthStore from '@stores/authStore';
import duToanService from '@services/duToanService';
import { uploadService } from '@services/uploadService';
import { formatCurrency } from '@utils/formatters';
import styles from './DuToanNamPage.module.scss';

const { TextArea } = Input;

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
).replace(/\/api\/?$/, '');

const getFileUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}/${path.replace(/^\//, '')}`;
};

const STATUS_CONFIG = {
  'Cho duyet': { color: 'orange', label: 'Cho duyet' },
  'Da duyet': { color: 'green', label: 'Da duyet' },
  'Tu choi': { color: 'red', label: 'Tu choi' },
};

const DuToanNamPage = () => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [rejectForm] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedChiTiet, setSelectedChiTiet] = useState([]);
  const [rejectInfo, setRejectInfo] = useState(null);

  // Thong ke nam truoc
  const [prevStats, setPrevStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Chi tiet khoan chi
  const [chiTietList, setChiTietList] = useState([]);

  // File upload
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const isAdmin = user?.vaiTro === 1;
  const isKeToan = user?.vaiTro === 2;
  const isCanBo = user?.vaiTro === 3;
  const isBKS = user?.vaiTro === 5;

  const canCreate = isKeToan;
  const canApproveHoiDong = isAdmin || isBKS;
  const canApproveHieuTruong = isAdmin;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await duToanService.getAll();
      if (res?.success) {
        setData(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching du toan:', err);
      toast.error('Loi khi tai danh sach du toan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load thong ke nam truoc khi chon nam
  const handleYearChange = async (value) => {
    if (!value || value < 2001) {
      setPrevStats(null);
      return;
    }
    setLoadingStats(true);
    try {
      const res = await duToanService.getPreviousYearStats(value);
      if (res?.success) {
        setPrevStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching prev stats:', err);
      setPrevStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  // Them khoan chi
  const addChiTiet = () => {
    setChiTietList([...chiTietList, { khoanchi: '', sotiendutoan: 0, ghichu: '' }]);
  };

  const removeChiTiet = (index) => {
    setChiTietList(chiTietList.filter((_, i) => i !== index));
  };

  const updateChiTiet = (index, field, value) => {
    const newList = [...chiTietList];
    newList[index] = { ...newList[index], [field]: value };
    setChiTietList(newList);
  };

  const tongChiTiet = chiTietList.reduce((sum, item) => sum + parseFloat(item.sotiendutoan || 0), 0);

  // Upload file
  const handleUploadFile = async (file) => {
    setUploading(true);
    try {
      const res = await uploadService.uploadFile(file);
      if (res?.success) {
        form.setFieldsValue({ fileMinhChung: res.data.path });
        toast.success('Upload file thanh cong');
        return res.data.path;
      }
    } catch (err) {
      toast.error('Loi upload file');
    } finally {
      setUploading(false);
    }
    return null;
  };

  const handleCreate = async (values) => {
    try {
      const payload = {
        namtaichinh: values.namtaichinh,
        sotiendutoan: chiTietList.length > 0 ? tongChiTiet : values.sotiendutoan,
        ghichu: values.ghichu,
        lyDoDeXuat: values.lyDoDeXuat,
        fileMinhChung: values.fileMinhChung,
        chiTiet: chiTietList.length > 0 ? chiTietList : undefined
      };

      const res = await duToanService.propose(payload);
      if (res?.success) {
        toast.success(res.message || 'Tao du toan thanh cong');
        setIsCreateModalOpen(false);
        form.resetFields();
        setChiTietList([]);
        setFileList([]);
        setPrevStats(null);
        fetchData();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Loi khi tao du toan';
      toast.error(msg);
    }
  };

  const handleApprove = async (id, capduyet) => {
    try {
      const res = await duToanService.approveLevel(id, capduyet, 'Da duyet');
      if (res?.success) {
        toast.success(res.message || 'Phe duyet thanh cong');
        fetchData();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Loi khi phe duyet';
      toast.error(msg);
    }
  };

  const openRejectModal = (item, capduyet) => {
    setRejectInfo({ id: item.dutoanhangnam_id, capduyet });
    rejectForm.resetFields();
    setIsRejectModalOpen(true);
  };

  const handleReject = async (values) => {
    if (!rejectInfo) return;
    try {
      const res = await duToanService.approveLevel(
        rejectInfo.id,
        rejectInfo.capduyet,
        'Tu choi',
        values.lydotuchoi
      );
      if (res?.success) {
        toast.success(res.message || 'Tu choi thanh cong');
        setIsRejectModalOpen(false);
        setRejectInfo(null);
        fetchData();
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Loi khi tu choi';
      toast.error(msg);
    }
  };

  const showDetail = async (item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
    // Load chi tiet
    try {
      const res = await duToanService.getChiTiet(item.dutoanhangnam_id);
      if (res?.success) {
        setSelectedChiTiet(res.data || []);
      }
    } catch (err) {
      setSelectedChiTiet([]);
    }
  };

  const canApproveLevel = (item, capduyet) => {
    if (capduyet === 1) {
      return canApproveHoiDong && item.hoidong_trangthai === 'Cho duyet';
    }
    return canApproveHieuTruong && item.hieutruong_trangthai === 'Cho duyet';
  };

  const columns = [
    {
      title: 'Nam tai chinh',
      dataIndex: 'namtaichinh',
      key: 'namtaichinh',
      width: 100,
      align: 'center',
    },
    {
      title: 'So tien du toan',
      dataIndex: 'sotiendutoan',
      key: 'sotiendutoan',
      width: 160,
      align: 'right',
      render: (val) => (
        <span style={{ fontWeight: 600 }}>{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Nguoi de xuat',
      dataIndex: 'nguoi_de_xuat_ten',
      key: 'nguoi_de_xuat_ten',
      width: 130,
    },
    {
      title: 'Hoi dong Quy',
      key: 'hoidong',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const st = record.hoidong_trangthai;
        const cfg = STATUS_CONFIG[st] || STATUS_CONFIG['Cho duyet'];
        return (
          <Space direction="vertical" size={2}>
            <Tag color={cfg.color}>{cfg.label}</Tag>
            {record.hoidong_nguoiduyet_ten && (
              <span style={{ fontSize: 11, color: '#888' }}>
                {record.hoidong_nguoiduyet_ten}
              </span>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Hieu truong',
      key: 'hieutruong',
      width: 130,
      align: 'center',
      render: (_, record) => {
        const st = record.hieutruong_trangthai;
        const cfg = STATUS_CONFIG[st] || STATUS_CONFIG['Cho duyet'];
        return (
          <Space direction="vertical" size={2}>
            <Tag color={cfg.color}>{cfg.label}</Tag>
            {record.hieutruong_nguoiduyet_ten && (
              <span style={{ fontSize: 11, color: '#888' }}>
                {record.hieutruong_nguoiduyet_ten}
              </span>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Trang thai',
      dataIndex: 'trangthai_tong',
      key: 'trangthai_tong',
      width: 100,
      align: 'center',
      render: (val) => {
        const cfg = STATUS_CONFIG[val] || STATUS_CONFIG['Cho duyet'];
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Thao tac',
      key: 'actions',
      width: 200,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiet">
            <Button
              type="text"
              icon={<HiOutlineEye />}
              onClick={() => showDetail(record)}
            />
          </Tooltip>

          {canApproveLevel(record, 1) && (
            <>
              <Popconfirm
                title="Duyet Hoi dong Quy?"
                onConfirm={() => handleApprove(record.dutoanhangnam_id, 1)}
                okText="Duyet"
                cancelText="Huy"
              >
                <Button type="primary" size="small" icon={<HiOutlineCheckCircle />}>
                  HD Quy
                </Button>
              </Popconfirm>
              <Button
                danger
                size="small"
                icon={<HiOutlineXCircle />}
                onClick={() => openRejectModal(record, 1)}
              />
            </>
          )}

          {canApproveLevel(record, 2) && (
            <>
              <Popconfirm
                title="Duyet Hieu truong?"
                onConfirm={() => handleApprove(record.dutoanhangnam_id, 2)}
                okText="Duyet"
                cancelText="Huy"
              >
                <Button type="primary" size="small" icon={<HiOutlineCheckCircle />}>
                  Hieu truong
                </Button>
              </Popconfirm>
              <Button
                danger
                size="small"
                icon={<HiOutlineXCircle />}
                onClick={() => openRejectModal(record, 2)}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <Card
        title="Du toan chi bo may hoat dong hang nam"
        extra={
          canCreate && (
            <Button
              type="primary"
              icon={<HiOutlinePlus />}
              onClick={() => {
                form.resetFields();
                setChiTietList([]);
                setFileList([]);
                setPrevStats(null);
                setIsCreateModalOpen(true);
              }}
            >
              Tao du toan moi
            </Button>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="dutoanhangnam_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>

      {/* Modal tao moi */}
      <Modal
        title="Tao du toan moi"
        open={isCreateModalOpen}
        onCancel={() => {
          setIsCreateModalOpen(false);
          setPrevStats(null);
          setChiTietList([]);
        }}
        onOk={() => form.submit()}
        okText="Tao"
        cancelText="Huy"
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          {/* Thong ke nam truoc */}
          <Divider orientation="left">Thong ke nam truoc</Divider>
          <Form.Item name="namtaichinh" label="Nam tai chinh">
            <InputNumber
              min={2001}
              max={2100}
              placeholder="VD: 2025"
              style={{ width: 200 }}
              onChange={handleYearChange}
            />
          </Form.Item>

          {loadingStats && <div>Dang tai thong ke...</div>}

          {prevStats && (
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Du toan nam truoc"
                    value={prevStats.duToan?.sotiendutoan || 0}
                    formatter={(val) => formatCurrency(val)}
                  />
                  {prevStats.duToan && (
                    <Tag color={prevStats.duToan.trangthai === 'Da duyet' ? 'green' : 'orange'} style={{ marginTop: 4 }}>
                      {prevStats.duToan.trangthai}
                    </Tag>
                  )}
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Tong thu"
                    value={prevStats.tongThu}
                    formatter={(val) => formatCurrency(val)}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Tong chi"
                    value={prevStats.tongChi}
                    formatter={(val) => formatCurrency(val)}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Chi bo may (thuc chi)"
                    value={prevStats.chiBoMay}
                    formatter={(val) => formatCurrency(val)}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Thu hoi no"
                    value={prevStats.thuHoiNo}
                    formatter={(val) => formatCurrency(val)}
                    valueStyle={{ color: '#3f8600' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Ho so da duyet"
                    value={prevStats.soHoSoDuyet}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small">
                  <Statistic
                    title="Ho so tu choi"
                    value={prevStats.soHoSoTuChoi}
                    valueStyle={{ color: '#cf1322' }}
                  />
                </Card>
              </Col>
              {prevStats.duToan && (
                <Col span={6}>
                  <Card size="small">
                    <Statistic
                      title="Chenh lech du toan vs thuc chi"
                      value={prevStats.duToan.sotiendutoan - prevStats.chiBoMay}
                      formatter={(val) => formatCurrency(val)}
                      valueStyle={{ color: val => val >= 0 ? '#3f8600' : '#cf1322' }}
                    />
                  </Card>
                </Col>
              )}
            </Row>
          )}

          <Divider orientation="left">Thong tin de xuat</Divider>

          <Form.Item
            name="sotiendutoan"
            label="So tien du toan (VNĐ)"
            rules={[{ required: chiTietList.length === 0, message: 'Vui long nhap so tien' }]}
          >
            <InputNumber
              min={0}
              step={1000000}
              placeholder="VD: 500000000"
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/,/g, '')}
              disabled={chiTietList.length > 0}
            />
          </Form.Item>

          <Form.Item
            name="lyDoDeXuat"
            label="Ly do de xuat"
            rules={[{ required: true, message: 'Vui long nhap ly do de xuat' }]}
          >
            <TextArea
              rows={3}
              placeholder="Giai thich tai sao de xuat so tien nay..."
            />
          </Form.Item>

          <Form.Item name="ghichu" label="Ghi chu">
            <TextArea rows={2} placeholder="Ghi chu (tuy chon)" />
          </Form.Item>

          {/* File minh chung */}
          <Form.Item name="fileMinhChung" label="File minh chung">
            <Upload
              fileList={fileList}
              beforeUpload={async (file) => {
                await handleUploadFile(file);
                return false;
              }}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              onRemove={() => {
                form.setFieldsValue({ fileMinhChung: null });
                setFileList([]);
              }}
            >
              <Button icon={<HiOutlinePaperClip />} loading={uploading}>
                Chon file
              </Button>
            </Upload>
            <div style={{ fontSize: 12, color: '#888' }}>
              Quyet dinh, bang ke, tai lieu lien quan (PDF, DOC, JPG)
            </div>
          </Form.Item>

          {/* Chi tiet khoan chi */}
          <Divider orientation="left">
            Chi tiet khoan chi
            <Button
              type="link"
              size="small"
              icon={<HiOutlinePlus />}
              onClick={addChiTiet}
            >
              Them khoan
            </Button>
          </Divider>

          {chiTietList.length > 0 && (
            <>
              {chiTietList.map((item, index) => (
                <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={10}>
                    <Input
                      placeholder="Ten khoan chi"
                      value={item.khoanchi}
                      onChange={(e) => updateChiTiet(index, 'khoanchi', e.target.value)}
                    />
                  </Col>
                  <Col span={10}>
                    <InputNumber
                      placeholder="So tien"
                      value={item.sotiendutoan}
                      onChange={(val) => updateChiTiet(index, 'sotiendutoan', val || 0)}
                      style={{ width: '100%' }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/,/g, '')}
                    />
                  </Col>
                  <Col span={4}>
                    <Button
                      danger
                      icon={<HiOutlineTrash />}
                      onClick={() => removeChiTiet(index)}
                    />
                  </Col>
                </Row>
              ))}
              <div style={{ fontWeight: 600, marginTop: 8 }}>
                Tong cong: {formatCurrency(tongChiTiet)}
              </div>
            </>
          )}
        </Form>
      </Modal>

      {/* Modal chi tiet */}
      <Modal
        title={`Chi tiet du toan nam ${selectedItem?.namtaichinh || ''}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedItem && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Nam tai chinh">
                {selectedItem.namtaichinh}
              </Descriptions.Item>
              <Descriptions.Item label="So tien du toan">
                {formatCurrency(selectedItem.sotiendutoan)}
              </Descriptions.Item>
              <Descriptions.Item label="Nguoi de xuat">
                {selectedItem.nguoi_de_xuat_ten}
              </Descriptions.Item>
              <Descriptions.Item label="Ngay de xuat">
                {selectedItem.ngaydexuat ? new Date(selectedItem.ngaydexuat).toLocaleString('vi-VN') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Ly do de xuat">
                {selectedItem.lydodeXuat || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chu">
                {selectedItem.ghichu || '—'}
              </Descriptions.Item>
              {selectedItem.fileMinhChung && (
                <Descriptions.Item label="File minh chung">
                  <a href={getFileUrl(selectedItem.fileMinhChung)} target="_blank" rel="noopener noreferrer">
                    Xem file
                  </a>
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Trang thai Hoi dong Quy">
                <Tag color={STATUS_CONFIG[selectedItem.hoidong_trangthai]?.color}>
                  {STATUS_CONFIG[selectedItem.hoidong_trangthai]?.label}
                </Tag>
                {selectedItem.hoidong_nguoiduyet_ten && (
                  <span style={{ marginLeft: 8 }}>
                    — {selectedItem.hoidong_nguoiduyet_ten}
                    {selectedItem.hoidong_ngayduyet && (
                      <> ({new Date(selectedItem.hoidong_ngayduyet).toLocaleString('vi-VN')})</>
                    )}
                  </span>
                )}
                {selectedItem.hoidong_lydotuchoi && (
                  <div style={{ color: '#f5222d', marginTop: 4 }}>
                    Ly do tu choi: {selectedItem.hoidong_lydotuchoi}
                  </div>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Trang thai Hieu truong">
                <Tag color={STATUS_CONFIG[selectedItem.hieutruong_trangthai]?.color}>
                  {STATUS_CONFIG[selectedItem.hieutruong_trangthai]?.label}
                </Tag>
                {selectedItem.hieutruong_nguoiduyet_ten && (
                  <span style={{ marginLeft: 8 }}>
                    — {selectedItem.hieutruong_nguoiduyet_ten}
                    {selectedItem.hieutruong_ngayduyet && (
                      <> ({new Date(selectedItem.hieutruong_ngayduyet).toLocaleString('vi-VN')})</>
                    )}
                  </span>
                )}
                {selectedItem.hieutruong_lydotuchoi && (
                  <div style={{ color: '#f5222d', marginTop: 4 }}>
                    Ly do tu choi: {selectedItem.hieutruong_lydotuchoi}
                  </div>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Trang thai tong">
                <Tag color={STATUS_CONFIG[selectedItem.trangthai_tong]?.color} style={{ fontSize: 14 }}>
                  {STATUS_CONFIG[selectedItem.trangthai_tong]?.label}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedChiTiet.length > 0 && (
              <>
                <Divider orientation="left">Chi tiet khoan chi</Divider>
                <Table
                  dataSource={selectedChiTiet}
                  rowKey="chitiet_dutoan_id"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: 'Khoan chi', dataIndex: 'khoanchi', key: 'khoanchi' },
                    {
                      title: 'So tien',
                      dataIndex: 'sotiendutoan',
                      key: 'sotiendutoan',
                      align: 'right',
                      render: (val) => formatCurrency(val)
                    },
                    { title: 'Ghi chu', dataIndex: 'ghichu', key: 'ghichu' },
                  ]}
                  footer={() => (
                    <div style={{ fontWeight: 600, textAlign: 'right' }}>
                      Tong cong: {formatCurrency(selectedChiTiet.reduce((s, i) => s + parseFloat(i.sotiendutoan), 0))}
                    </div>
                  )}
                />
              </>
            )}
          </>
        )}
      </Modal>

      {/* Modal tu choi */}
      <Modal
        title="Tu choi du toan"
        open={isRejectModalOpen}
        onCancel={() => {
          setIsRejectModalOpen(false);
          setRejectInfo(null);
        }}
        onOk={() => rejectForm.submit()}
        okText="Xac nhan tu choi"
        okButtonProps={{ danger: true }}
        cancelText="Huy"
      >
        <Form form={rejectForm} layout="vertical" onFinish={handleReject}>
          <Form.Item
            name="lydotuchoi"
            label="Ly do tu choi"
            rules={[{ required: true, message: 'Vui long nhap ly do tu choi' }]}
          >
            <TextArea rows={4} placeholder="Nhap ly do tu choi..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DuToanNamPage;
