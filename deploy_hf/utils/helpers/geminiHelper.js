import dotenv from 'dotenv';
dotenv.config();

/**
 * Gọi API Google Gemini để tạo nội dung
 * @param {string} prompt - Prompt gửi cho AI
 * @param {boolean} isJson - Có yêu cầu định dạng JSON hay không
 * @returns {Promise<string>} - Nội dung kết quả trả về từ AI
 */
export const generateGeminiContent = async (prompt, isJson = false) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Chưa cấu hình GEMINI_API_KEY trong file .env hoặc đang sử dụng giá trị mặc định.');
  }

  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ]
  };

  if (isJson) {
    requestBody.generationConfig = {
      responseMimeType: 'application/json'
    };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API Error (HTTP ${response.status}):`, errorText);
      throw new Error(`Gemini API phản hồi lỗi HTTP ${response.status}`);
    }

    const responseData = await response.json();
    
    // Trích xuất kết quả từ cấu trúc response của Gemini API
    if (
      responseData.candidates &&
      responseData.candidates[0] &&
      responseData.candidates[0].content &&
      responseData.candidates[0].content.parts &&
      responseData.candidates[0].content.parts[0]
    ) {
      return responseData.candidates[0].content.parts[0].text;
    } else {
      console.error('Gemini API Response format mismatch:', responseData);
      throw new Error('Phản hồi từ Gemini API không đúng định dạng mong đợi.');
    }
  } catch (error) {
    console.error('Error in generateGeminiContent:', error.message);
    throw error;
  }
};
