import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import statisticsService from '@services/statisticsService';
import api from '@services/api';

const useAdminBaoCaoData = (periodType = 'year') => {
  const [loading, setLoading] = useState(true);
  const [advancedStats, setAdvancedStats] = useState(null);
  const [financialStats, setFinancialStats] = useState(null);
  const [funds, setFunds] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Gọi song song các API thống kê báo cáo
      const [advRes, finRes, fundsRes] = await Promise.all([
        statisticsService.getAdminAdvancedStats().catch(err => {
          console.error("Lỗi getAdminAdvancedStats:", err);
          return null;
        }),
        statisticsService.getKeToanReportStats({
          type: periodType,
          year: year,
          month: new Date().getMonth() + 1,
          quarter: Math.ceil((new Date().getMonth() + 1) / 3),
        }).catch(err => {
          console.error("Lỗi getKeToanReportStats:", err);
          return null;
        }),
        api.get('/funds').catch(err => {
          console.error("Lỗi get funds:", err);
          return { data: { success: false } };
        })
      ]);

      if (advRes) {
        setAdvancedStats(advRes);
      }
      if (finRes) {
        setFinancialStats(finRes);
      }
      if (fundsRes?.data?.success) {
        setFunds(fundsRes.data.funds || []);
      }
    } catch (error) {
      console.error('Lỗi tải dữ liệu báo cáo Admin:', error);
      toast.toast?.error('Không tải được một số dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [year, periodType]);

  return {
    loading,
    advancedStats,
    financialStats,
    funds,
    year,
    setYear,
    refresh: fetchAllData
  };
};

export default useAdminBaoCaoData;
