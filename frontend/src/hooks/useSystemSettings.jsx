import { useState, useEffect, createContext, useContext } from 'react';
import { API_ENDPOINTS } from '@constants';
import api from '@services/api';

const SystemSettingsContext = createContext(null);

/**
 * SystemSettingsProvider
 * Cung cấp settings hệ thống cho toàn bộ app
 */
export const SystemSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.SYSTEM_SETTINGS_PUBLIC);
        if (response.data?.success) {
          setSettings(response.data.settings);
        }
      } catch (error) {
        console.error('Error fetching system settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const refetchSettings = async () => {
    try {
      const response = await api.get(API_ENDPOINTS.SYSTEM_SETTINGS_PUBLIC);
      if (response.data?.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Error refetching system settings:', error);
    }
  };

  return (
    <SystemSettingsContext.Provider value={{ settings, loading, refetchSettings }}>
      {children}
    </SystemSettingsContext.Provider>
  );
};

/**
 * useSystemSettings hook
 * Trả về { settings, loading, refetchSettings }
 * Dùng trong các component Landing Page để lấy text từ settings
 */
export const useSystemSettings = () => {
  const context = useContext(SystemSettingsContext);
  if (!context) {
    // Fallback nếu không có Provider (ví dụ test, SSR)
    return { settings: null, loading: false, refetchSettings: () => {} };
  }
  return context;
};

export default useSystemSettings;
