import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  HiOutlineSparkles,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import styles from './AIAssistantPanel.module.scss';

const AI_MODEL = 'claude-sonnet-4-20250514';
const AI_URL = 'https://api.anthropic.com/v1/messages';

const callAI = async (messages, maxTokens = 1000) => {
  const response = await fetch(AI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: maxTokens,
      messages,
    }),
  });
  const data = await response.json();
  return data.content[0].text;
};

const AIAssistantPanel = ({ moTa, tieuDe, onApplySuggestion }) => {
  const [status, setStatus] = useState('idle');
  const [analysis, setAnalysis] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [optimizedText, setOptimizedText] = useState('');

  useEffect(() => {
    if (!moTa || moTa.trim().length < 50) {
      setStatus('idle');
      setAnalysis(null);
      return;
    }

    setStatus('analyzing');

    const timer = setTimeout(() => {
      analyzeText(moTa);
    }, 1500);

    return () => clearTimeout(timer);
  }, [moTa]);

  const analyzeText = async (text) => {
    try {
      const raw = await callAI([
        {
          role: 'user',
          content: `Phân tích đoạn văn xin học bổng/hỗ trợ sau và trả về JSON với cấu trúc:
{"danhGia":"nhận xét tổng thể 1 câu","diemManh":"điểm mạnh ngắn","diemYeu":"điểm cần cải thiện ngắn","goiY":"gợi ý cụ thể 1-2 câu"}
Chỉ trả về JSON, không thêm gì khác.
Đoạn văn: "${text}"`,
        },
      ]);
      const result = JSON.parse(raw);
      setAnalysis(result);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const optimizeText = async () => {
    setIsOptimizing(true);
    try {
      const rewritten = await callAI([
        {
          role: 'user',
          content: `Viết lại đoạn văn xin học bổng sau theo phong cách chân thành, rõ ràng, thuyết phục. Giữ nguyên thông tin, chỉ cải thiện văn phong. Trả về chỉ đoạn văn đã viết lại, không thêm gì khác:
"${moTa}"`,
        },
      ]);
      setOptimizedText(rewritten);
      setShowPreview(true);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleApply = () => {
    onApplySuggestion?.(optimizedText);
    setShowPreview(false);
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <HiOutlineSparkles className={styles.headerIcon} />
          <span className={styles.headerText}>Cộng sự AI hỗ trợ</span>
        </div>

        {status === 'idle' && (
          <div className={styles.idleMsg}>
            Nhập nội dung lý do để AI bắt đầu phân tích và hỗ trợ bạn.
          </div>
        )}

        {status === 'analyzing' && (
          <div className={styles.analyzingBox}>
            <div className={styles.spinner} />
            <span className={styles.analyzingText}>
              AI đang phân tích văn phong...
            </span>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.idleMsg}>
            Không thể phân tích lúc này. Vui lòng thử lại sau.
          </div>
        )}

        {status === 'done' && analysis && (
          <>
            <div className={styles.analysisBox}>
              <div className={styles.analysisLabel}>PHÂN TÍCH VĂN PHONG</div>
              <p className={styles.analysisText}>{analysis.danhGia}</p>
            </div>

            {analysis.diemManh && (
              <div className={styles.itemRow}>
                <HiOutlineCheckCircle className={styles.iconStrong} />
                <span className={styles.itemText}>{analysis.diemManh}</span>
              </div>
            )}

            {analysis.diemYeu && (
              <div className={styles.itemRow}>
                <HiOutlineXCircle className={styles.iconWeak} />
                <span className={styles.itemText}>{analysis.diemYeu}</span>
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
              disabled={isOptimizing}
            >
              {isOptimizing ? (
                <>
                  <div className={styles.btnSpinner} />
                  Đang tối ưu...
                </>
              ) : (
                <>
                  <HiOutlineSparkles />
                  ✦ Tối ưu văn phong với AI
                </>
              )}
            </button>
          </>
        )}
      </div>

      {showPreview && (
        <div className={styles.overlay} onClick={() => setShowPreview(false)}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalTitle}>
              ✦ Nội dung đã được AI tối ưu
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
                Giữ nguyên
              </button>
              <button
                type="button"
                className={styles.modalBtnPrimary}
                onClick={handleApply}
              >
                Dùng nội dung này
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
};

export default AIAssistantPanel;
