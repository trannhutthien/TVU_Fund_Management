import FundModel from '../../models/funds/FundModel.js';
import { generateGeminiContent } from '../../utils/helpers/geminiHelper.js';

const compactText = (value = '') => String(value).replace(/\s+/g, ' ').trim();

const buildFallbackAnalysis = ({ moTa, fundName, fundCriteria }) => {
  const text = compactText(moTa);
  const lowerText = text.toLowerCase();
  const hasAmount = /\d|đồng|vnd|triệu|nghìn|ngàn/.test(lowerText);
  const hasCommitment = /cam kết|cố gắng|nỗ lực|sử dụng đúng|hoàn thành/.test(lowerText);
  const hasSpecificReason = text.length >= 80;

  return {
    danhGia: hasSpecificReason
      ? `Nội dung đã nêu được hoàn cảnh liên quan đến ${fundName}, tuy nhiên cần trình bày mạch lạc hơn để tăng tính thuyết phục.`
      : `Nội dung còn khá ngắn so với yêu cầu của ${fundName}; nên bổ sung thêm bối cảnh, khó khăn và nhu cầu hỗ trợ cụ thể.`,
    diemManh: hasSpecificReason
      ? 'Có nêu hoàn cảnh cá nhân.'
      : 'Đã xác định nhu cầu hỗ trợ.',
    diemYeu: hasAmount
      ? (hasCommitment ? 'Cần sắp xếp ý rõ hơn.' : 'Chưa nêu cam kết sau hỗ trợ.')
      : 'Chưa nêu số tiền mong muốn.',
    goiY: fundCriteria
      ? 'Bổ sung minh chứng phù hợp điều kiện quỹ, số tiền đề nghị và cam kết sử dụng kinh phí đúng mục đích.'
      : 'Bổ sung hoàn cảnh, số tiền đề nghị, minh chứng kèm theo và cam kết học tập sau khi nhận hỗ trợ.'
  };
};

const buildFallbackOptimizedText = ({ moTa, fundName, fundCriteria }) => {
  const text = compactText(moTa);
  const criteriaSentence = fundCriteria
    ? ` Tôi nhận thấy bản thân phù hợp với định hướng hỗ trợ của quỹ, đặc biệt là tiêu chí: ${compactText(fundCriteria)}.`
    : '';

  return `Kính gửi Ban quản lý ${fundName}, em xin trình bày hoàn cảnh và nguyện vọng được xem xét hỗ trợ như sau: ${text}.${criteriaSentence} Hiện tại, những khó khăn nêu trên ảnh hưởng trực tiếp đến khả năng trang trải chi phí học tập và sinh hoạt của em. Vì vậy, em kính mong Ban quản lý Quỹ xem xét tạo điều kiện hỗ trợ để em có thêm nguồn lực tiếp tục học tập. Em cam kết sử dụng khoản hỗ trợ đúng mục đích, chấp hành đầy đủ các quy định của nhà trường và nỗ lực duy trì kết quả học tập, rèn luyện tốt. Em xin chân thành cảm ơn.`;
};

const buildFallbackDraftText = ({ moTa, fundName, fundCriteria }) => {
  const text = compactText(moTa);
  const criteriaBlock = fundCriteria
    ? `\n\nQua tìm hiểu, em nhận thấy ${fundName} có tiêu chí hỗ trợ phù hợp với hoàn cảnh hiện tại của em, cụ thể: ${compactText(fundCriteria)}.`
    : '';

  return `Kính gửi Ban Giám hiệu Trường Đại học Trà Vinh và Ban quản lý ${fundName},

Em tên là: ........................................
Mã số sinh viên: ..................................
Lớp/Khoa: .........................................

Em viết đơn này kính mong Nhà trường và Ban quản lý Quỹ xem xét hỗ trợ cho em trong giai đoạn hiện nay. Hoàn cảnh của em như sau: ${text}.${criteriaBlock}

Những khó khăn trên đang ảnh hưởng trực tiếp đến việc học tập, sinh hoạt và khả năng duy trì quá trình học của em. Vì vậy, em kính mong được xem xét hỗ trợ từ Quỹ để có thêm điều kiện trang trải các chi phí cần thiết, tiếp tục theo học và ổn định việc học tập tại Trường.

Nếu được hỗ trợ, em cam kết sử dụng khoản kinh phí đúng mục đích, cung cấp đầy đủ minh chứng theo yêu cầu, chấp hành các quy định của Nhà trường và tiếp tục nỗ lực học tập, rèn luyện để xứng đáng với sự quan tâm của Quỹ.

Em xin chân thành cảm ơn.`;
};

/**
 * Xử lý yêu cầu AI gợi ý viết đơn
 * POST /api/applications/ai-suggest
 */
export const getAiSuggestion = async (req, res) => {
  try {
    const { quyId, action, tieuDe, moTa } = req.body;

    if (!quyId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp quyId và action ("analyze" | "optimize" | "draft").'
      });
    }

    // Truy vấn thông tin quỹ để lấy ngữ cảnh chính xác
    const fund = await FundModel.getFundById(quyId);
    if (!fund) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin quỹ hỗ trợ.'
      });
    }

    // Lấy thông tin cột chính xác từ bảng `quy`
    const fundName = fund.ten_quy;
    const fundDescription = fund.mo_ta || '';
    const fundCriteria = fund.dieu_kien_tom_tat || '';

    let prompt = '';

    if (action === 'analyze') {
      if (!moTa || moTa.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Nội dung mô tả quá ngắn để phân tích (tối thiểu 10 ký tự).'
        });
      }

      prompt = `
Bạn là một trợ lý AI chuyên nghiệp cho hệ thống Quản lý Quỹ Hỗ trợ Sinh viên của Trường Đại học Trà Vinh (TVU).
Hãy phân tích đoạn văn xin hỗ trợ dưới đây của sinh viên gửi cho quỹ "${fundName}".
Thông tin về quỹ hỗ trợ:
- Mô tả quỹ: ${fundDescription}
- Điều kiện hỗ trợ: ${fundCriteria}

Đoạn văn của sinh viên:
"${moTa}"

Hãy đánh giá và trả về kết quả bằng định dạng JSON (chỉ trả về JSON hợp lệ, không kèm thêm bất kỳ ký tự nào khác ngoài JSON, không sử dụng markdown code block \`\`\`json):
{
  "danhGia": "Nhận xét ngắn gọn về đoạn văn của sinh viên (khoảng 1-2 câu).",
  "diemManh": "Điểm mạnh của đoạn văn (ví dụ: trình bày hoàn cảnh rõ ràng, lễ phép...). Cực kỳ ngắn gọn, dưới 15 từ.",
  "diemYeu": "Điểm yếu/điểm cần cải thiện (ví dụ: chưa nói rõ số tiền mong muốn, chưa nêu rõ lý do khó khăn...). Cực kỳ ngắn gọn, dưới 15 từ.",
  "goiY": "Gợi ý cụ thể để sinh viên chỉnh sửa tốt hơn. Ngắn gọn, dưới 30 từ."
}
`;

      try {
        const aiResponse = await generateGeminiContent(prompt, true);
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(aiResponse.trim());
        } catch (parseError) {
          console.error('Failed to parse JSON from Gemini response:', aiResponse);
          // Trích xuất JSON bằng regex đề phòng Gemini trả về markdown code blocks
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[0]);
          } else {
            throw parseError;
          }
        }

        return res.status(200).json({
          success: true,
          data: parsedResponse
        });
      } catch (aiError) {
        console.error('AI analyze fallback:', aiError.message);
        return res.status(200).json({
          success: true,
          data: buildFallbackAnalysis({ moTa, fundName, fundCriteria }),
          fallback: true
        });
      }

    } else if (action === 'optimize') {
      if (!moTa || moTa.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Nội dung mô tả quá ngắn để tối ưu (tối thiểu 10 ký tự).'
        });
      }

      prompt = `
Bạn là một trợ lý AI chuyên nghiệp cho hệ thống Quản lý Quỹ Hỗ trợ Sinh viên của Trường Đại học Trà Vinh (TVU).
Nhiệm vụ của bạn là viết lại (tối ưu hóa) đoạn văn xin hỗ trợ dưới đây của sinh viên để gửi đến Quỹ "${fundName}".
Vui lòng giữ nguyên các thông tin thực tế cốt lõi (hoàn cảnh gia đình, lý do xin hỗ trợ), nhưng cải thiện văn phong cho lịch sự, chân thành, trang trọng và thuyết phục hơn. Sửa toàn bộ lỗi chính tả và lỗi diễn đạt.

Đoạn văn gốc của sinh viên:
"${moTa}"

Yêu cầu đầu ra:
- Chỉ trả về duy nhất đoạn văn đã được viết lại, không thêm bất kỳ lời dẫn, nhận xét hay ký tự thừa nào khác.
`;

      let aiResponse;
      try {
        aiResponse = await generateGeminiContent(prompt, false);
      } catch (aiError) {
        console.error('AI optimize fallback:', aiError.message);
        aiResponse = buildFallbackOptimizedText({ moTa, fundName, fundCriteria });
      }

      return res.status(200).json({
        success: true,
        data: aiResponse.trim()
      });

    } else if (action === 'draft') {
      if (!moTa || moTa.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp một vài ý chính hoặc thông tin hoàn cảnh để AI soạn đơn.'
        });
      }

      prompt = `
Bạn là một trợ lý AI chuyên nghiệp cho hệ thống Quản lý Quỹ Hỗ trợ Sinh viên của Trường Đại học Trà Vinh (TVU).
Nhiệm vụ của bạn là viết một lá đơn xin hỗ trợ chi tiết từ Quỹ "${fundName}" dựa trên các ý chính/thông tin hoàn cảnh do sinh viên cung cấp sau đây:
"${moTa}"

Thông tin về quỹ hỗ trợ:
- Mô tả quỹ: ${fundDescription}
- Điều kiện hỗ trợ: ${fundCriteria}

Hãy viết một lá đơn hoàn chỉnh có bố cục rõ ràng:
- Lời kính gửi (Ban quản lý Quỹ, Ban giám hiệu nhà trường).
- Giới thiệu bản thân sinh viên (để trống các trường như Họ tên, MSSV, Lớp để sinh viên tự điền).
- Trình bày chi tiết hoàn cảnh khó khăn và lý do xin hỗ trợ một cách chân thành, trang trọng.
- Lời cảm ơn và cam kết sử dụng khoản hỗ trợ đúng mục đích.

Yêu cầu đầu ra:
- Chỉ trả về duy nhất nội dung lá đơn đã soạn thảo, không thêm bất kỳ lời dẫn hay nhận xét nào khác của AI.
`;

      let aiResponse;
      try {
        aiResponse = await generateGeminiContent(prompt, false);
      } catch (aiError) {
        console.error('AI draft fallback:', aiError.message);
        aiResponse = buildFallbackDraftText({ moTa, fundName, fundCriteria });
      }

      return res.status(200).json({
        success: true,
        data: aiResponse.trim()
      });

    } else {
      return res.status(400).json({
        success: false,
        message: 'Action không hợp lệ. Chỉ chấp nhận "analyze", "optimize", hoặc "draft".'
      });
    }
  } catch (error) {
    console.error('Error in getAiSuggestion:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Lỗi server khi xử lý yêu cầu AI.'
    });
  }
};
