import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import congNoService from '@services/congNoService';
import TongQuanCongNoCard from './TongQuanCongNoCard/index.jsx';
import BangCongNo from './BangCongNo/index.jsx';
import styles from '../index.module.scss';

const CongNoTab = ({ userRole }) => {
  const [tongQuan, setTongQuan] = useState(null);
  const [loadingTongQuan, setLoadingTongQuan] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoadingTongQuan(true);
    congNoService.getTongQuan()
      .then((res) => {
        if (mounted) setTongQuan(res.data?.data || null);
      })
      .catch(() => {
        if (mounted) toast.error('Khong tai duoc tong quan cong no');
      })
      .finally(() => {
        if (mounted) setLoadingTongQuan(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className={styles.tabContent}>
      {/* Tong quan cards */}
      {loadingTongQuan ? (
        <div className={styles.loadingBox}>Dang tai tong quan...</div>
      ) : (
        <TongQuanCongNoCard data={tongQuan} />
      )}

      {/* Bang cong no */}
      <BangCongNo userRole={userRole} />
    </div>
  );
};

CongNoTab.propTypes = {
  userRole: PropTypes.number,
};

export default CongNoTab;
