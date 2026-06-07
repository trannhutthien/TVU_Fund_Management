import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import { applicationService } from '@services/applicationService';
import styles from './AIAssistantPanel.module.scss';

const AIAssistantPanel = ({ moTa, tieuDe, onApplySuggestion, selectedFund }) => {
  const [activeTab, setActiveTab] = useState('suggest'); // 'suggest' | 'draft'
  const [status, setStatus] = useState('idle');
  const [analysis, setAnalysis] = useState(null);
  
  // Trạng thái cho Tối ưu văn phong
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [optimizedText, setOptimizedText] = useState('');
  
  // Trạng thái cho Soạn đơn từ ý chính
  const [draftInput, setDraftInput] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  const quyId = selectedFund?.quyId;

  // Tự động phân tích khi nội dung Mô tả (moTa) thay đổi
  useEffect(() => {
    if (activeTab !== 'suggest') return;
    if (!quyId) {
      setStatus('idle');
      setAnalysis(null);
      return;
    }

    if (!moTa || moTa.trim().length < 10) {
      setStatus('idle');
      setAnalysis(null);
      return;
    }

    setStatus('analyzing');

    // Debounce 1.5s để tránh gọi API liên tục khi người dùng đang gõ
    const timer = setTimeout(() => {
      analyzeText(moTa);
    }, 1500);

    return () => clearTimeout(timer);
  }, [moTa, quyId, activeTab]);

  // Hàm gọi API phân tích văn phong đơn
  const analyzeText = async (text) => {
    try {
      const response = await applicationService.getAiSuggestion({
        quyId,
        action: 'analyze',
        moTa: text,
        tieuDe
      });

      if (response.success && response.data) {
        setAnalysis(response.data);
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Lỗi phân tích đơn:', err);
      setStatus('error');
    }
  };

  // Hàm gọi API viết lại tối ưu văn phong
  const optimizeText = async () => {
    if (!moTa || moTa.trim().length < 10) return;
    setIsOptimizing(true);
    try {
      const response = await applicationService.getAiSuggestion({
        quyId,
        action: 'optimize',
        moTa,
        tieuDe
      });

      if (response.success && response.data) {
        setOptimizedText(response.data);
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Lỗi tối ưu đơn:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Hàm gọi API soạn thảo đơn từ ý chính/hoàn cảnh
  const draftFromBulletPoints = async () => {
    if (!draftInput || draftInput.trim().length < 5) return;
    setIsDrafting(true);
    try {
      const response = await applicationService.getAiSuggestion({
        quyId,
        action: 'draft',
        moTa: draftInput,
        tieuDe
      });

      if (response.success && response.data) {
        setOptimizedText(response.data);
        setShowPreview(true);
      }
    } catch (err) {
      console.error('Lỗi soạn thảo đơn từ ý chính:', err);
    } finally {
      setIsDrafting(false);
    }
  };

  // Áp dụng văn bản đã tạo/tối ưu vào form chính
  const handleApply = () => {
    onApplySuggestion?.(optimizedText);
    setShowPreview(false);
    
    // Nếu vừa soạn thảo đơn, reset ô nhập ý chính và quay về tab Suggest
    if (activeTab === 'draft') {
      setDraftInput('');
      setActiveTab('suggest');
    }
  };

  return (
    <>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <HiOutlineSparkles className={styles.headerIcon} />
          <span className={styles.headerText}>Cộng sự AI hỗ trợ</span>
        </div>

        {/* Nội dung khi chưa chọn Quỹ */}
        {!selectedFund ? (
          <div className={styles.idleMsg}>
            Vui lòng chọn Quỹ hỗ trợ ở <strong>Bước 1</strong> để bắt đầu nhận gợi ý từ cộng sự AI.
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'suggest' ? styles.active : ''}`}
                onClick={() => setActiveTab('suggest')}
              >
                Gợi ý & Tối ưu
              </button>
              <button
                type="button"
                className={`${styles.tab} ${activeTab === 'draft' ? styles.active : ''}`}
                onClick={() => setActiveTab('draft')}
              >
                Soạn mới bằng AI
              </button>
            </div>

            {/* TAB 1: GỢI Ý & TỐI ƯU */}
            {activeTab === 'suggest' && (
              <>
                {status === 'idle' && (
                  <div className={styles.idleMsg}>
                    Nhập nội dung lý do ở ô <strong>Mô tả lý do đề nghị hỗ trợ</strong> bên trái để AI tự động phân tích và đưa ra phản hồi.
                  </div>
                )}

                {status === 'analyzing' && (
                  <div className={styles.analyzingBox}>
                    <div className={styles.spinner} />
                    <span className={styles.analyzingText}>
                      AI đang phân tích văn phong đơn...
                    </span>
                  </div>
                )}

                {status === 'error' && (
                  <div className={styles.idleMsg}>
                    Không thể phân tích đơn lúc này hoặc chưa cấu hình API Key ở máy chủ. Vui lòng thử lại sau.
                  </div>
                )}

                {status === 'done' && analysis && (
                  <>
                    <div className={styles.analysisBox}>
                      <div className={styles.analysisLabel}>ĐÁNH GIÁ CHUNG</div>
                      <p className={styles.analysisText}>{analysis.danhGia}</p>
                    </div>

                    {analysis.diemManh && (
                      <div className={styles.itemRow}>
                        <HiOutlineCheckCircle className={styles.iconStrong} />
                        <span className={styles.itemText}>
                          <strong>Ưu điểm:</strong> {analysis.diemManh}
                        </span>
                      </div>
                    )}

                    {analysis.diemYeu && (
                      <div className={styles.itemRow}>
                        <HiOutlineXCircle className={styles.iconWeak} />
                        <span className={styles.itemText}>
                          <strong>Cần cải thiện:</strong> {analysis.diemYeu}
                        </span>
                      </div>
                    )}

                    {analysis.goiY && (
                      <div className={styles.suggestionBox}>
                        <span className={styles.suggestionLabel}>💡 Gợi ý:</span>{' '}
                        <span className={styles.suggestionText}>{analysis.goiY}</span>
                      </div>
                    )}

                    <button
                      type="button"
                      className={styles.optimizeBtn}
                      onClick={optimizeText}
                      disabled={isOptimizing || !moTa || moTa.trim().length < 10}
                    >
                      {isOptimizing ? (
                        <>
                          <div className={styles.btnSpinner} />
                          Đang tối ưu văn phong...
                        </>
                      ) : (
                        <>
                          <HiOutlineSparkles />
                          Tối ưu đơn với AI
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            )}

            {/* TAB 2: SOẠN MỚI BẰNG AI */}
            {activeTab === 'draft' && (
              <>
                <div className={styles.draftInputBox}>
                  <label className={styles.draftLabel}>
                    Nhập hoàn cảnh / các ý chính của bạn:
                  </label>
                  <textarea
                    className={styles.draftTextarea}
                    placeholder="Ví dụ: Gia đình làm nông ở vùng sâu, hạn mặn mất mùa, gặp khó khăn đóng học phí học kỳ 2. Cam kết cố gắng học tốt..."
                    value={draftInput}
                    onChange={(e) => setDraftInput(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className={styles.optimizeBtn}
                  onClick={draftFromBulletPoints}
                  disabled={isDrafting || !draftInput || draftInput.trim().length < 5}
                >
                  {isDrafting ? (
                    <>
                      <div className={styles.btnSpinner} />
                      Đang soạn đơn...
                    </>
                  ) : (
                    <>
                      <HiOutlineSparkles />
                      Tự soạn đơn bằng AI
                    </>
                  )}
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Modal hiển thị nội dung AI viết */}
      {showPreview && (
        <div className={styles.overlay} onClick={() => setShowPreview(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalTitle}>
              ✦ Nội dung do AI soạn thảo & tối ưu
            </div>
            <textarea
              className={styles.modalTextarea}
              readOnly
              value={optimizedText}
            />
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalBtnOutline}
                onClick={() => setShowPreview(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className={styles.modalBtnPrimary}
                onClick={handleApply}
              >
                Sử dụng nội dung này
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

AIAssistantPanel.propTypes = {
  moTa: PropTypes.string,
  tieuDe: PropTypes.string,
  onApplySuggestion: PropTypes.func,
  selectedFund: PropTypes.object,
};

export default AIAssistantPanel;
