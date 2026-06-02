import pool from './config/db.js';

async function testPheDuyetQuery() {
  try {
    console.log('🧪 Testing PheDuyet Query...\n');

    // Test query with aliases
    const [rows] = await pool.query(`
      SELECT 
        pd.pheduyet_id AS phe_duyet_id,
        pd.yeucauhotro_id AS request_id,
        pd.capduyet AS cap_do_duyet,
        pd.nguoiduyet_id,
        pd.ketqua AS ket_qua,
        pd.lydo,
        pd.ghichu,
        pd.ngayduyet AS ngay_duyet,
        -- Người duyệt
        nd.hoten AS ho_ten,
        nd.email,
        nd.avatar,
        nd.vaitro_id,
        vt.tenvaitro AS ten_vai_tro,
        -- Nếu là đơn hỗ trợ
        yc.sotiendenghi AS so_tien_de_nghi,
        yc.trangthai AS trang_thai_don,
        sv.hoten AS ten_sinh_vien,
        sv.masodinhdanh AS ma_so_dinh_danh,
        -- Quỹ
        q.tenquy AS ten_quy
      FROM pheduyet pd
      LEFT JOIN nguoidung nd ON nd.nguoidung_id = pd.nguoiduyet_id
      LEFT JOIN vaitro vt ON vt.vaitro_id = nd.vaitro_id
      LEFT JOIN yeucauhotro yc ON yc.yeucauhotro_id = pd.yeucauhotro_id
      LEFT JOIN nguoidung sv ON sv.nguoidung_id = yc.nguoidung_id
      LEFT JOIN quy q ON q.quy_id = yc.quy_id
      ORDER BY pd.ngayduyet DESC
      LIMIT 2
    `);

    console.log('✅ Query executed successfully');
    console.log('✅ Total rows:', rows.length);
    
    if (rows.length > 0) {
      console.log('\n📋 First row fields:');
      const firstRow = rows[0];
      console.log('  phe_duyet_id:', firstRow.phe_duyet_id);
      console.log('  request_id:', firstRow.request_id);
      console.log('  cap_do_duyet:', firstRow.cap_do_duyet);
      console.log('  ket_qua:', firstRow.ket_qua);
      console.log('  ho_ten:', firstRow.ho_ten);
      console.log('  ten_vai_tro:', firstRow.ten_vai_tro);
      console.log('  ten_sinh_vien:', firstRow.ten_sinh_vien);
      console.log('  ten_quy:', firstRow.ten_quy);
      console.log('  ngay_duyet:', firstRow.ngay_duyet);
      
      console.log('\n✅ All aliases are working correctly!');
      console.log('\n📦 Full first row:');
      console.log(JSON.stringify(firstRow, null, 2));
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

testPheDuyetQuery();
