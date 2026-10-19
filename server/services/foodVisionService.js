const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

let GoogleGenerativeAI = null;
try {
  const genaiModule = require('@google/generative-ai');
  GoogleGenerativeAI = genaiModule.GoogleGenerativeAI;
} catch (e) {
  // Gracefully handle if package is missing
}

const CANDIDATE_VISION_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash-lite',
  'gemini-flash-latest',
];

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
const MAX_BASE64_LENGTH = 11 * 1024 * 1024; // ~8MB binary

/**
 * Sanitize error message to prevent leaking secrets
 */
const sanitizeError = (errMsg) => {
  if (!errMsg) return 'Food vision analysis service temporarily unavailable';
  return errMsg.replace(/key=[^&\s]+/gi, 'key=***').replace(/AIza[0-9A-Za-z_-]{35}/g, '***');
};

/**
 * Validates and extracts mimeType and raw base64 data from a data URL or raw base64 string
 */
const parseImageData = (imageInput, mimeTypeInput) => {
  if (!imageInput || typeof imageInput !== 'string') {
    throw new Error('Image data is required as a base64 string or data URI.');
  }

  let mimeType = mimeTypeInput || 'image/jpeg';
  let base64Data = imageInput;

  // Handle data URI scheme (e.g. "data:image/jpeg;base64,...")
  const dataUriMatch = imageInput.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUriMatch) {
    mimeType = dataUriMatch[1].toLowerCase();
    base64Data = dataUriMatch[2];
  }

  // Normalize jpg to jpeg
  if (mimeType === 'image/jpg') mimeType = 'image/jpeg';

  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(
      `Unsupported image format (${mimeType}). Please upload a JPEG, PNG, or WebP image.`
    );
  }

  if (base64Data.length > MAX_BASE64_LENGTH) {
    throw new Error('Image exceeds maximum allowable file size (8MB). Please choose a smaller image.');
  }

  if (base64Data.length < 50) {
    throw new Error('Image data is too small or corrupted.');
  }

  return { base64Data, mimeType };
};

/**
 * Analyzes a food image using server-side Gemini Vision API
 */
const analyzeFoodImage = async (imageInput, mimeTypeInput = null) => {
  const { base64Data, mimeType } = parseImageData(imageInput, mimeTypeInput);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !GoogleGenerativeAI) {
    throw new Error('GEMINI_API_KEY is not configured on the backend server.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `You are WellSync's Senior Clinical Food Vision Analyst.
Examine this food photo carefully and provide a comprehensive nutritional estimation.

Requirements:
1. Identify the dish/food name accurately.
2. Classify the best fitting mealType: 'breakfast', 'lunch', 'dinner', or 'snack'.
3. Estimate serving size (e.g., '1 plate (~350g)', '1 bowl', '2 slices').
4. Estimate calories (integer, realistic for this portion).
5. Estimate macronutrients in grams: protein, carbohydrates (carbs), fats, and dietary fiber.
6. List primary identified ingredients.
7. Provide a realistic confidence score between 0.50 and 0.98 reflecting visual uncertainty.
8. State clearly whether this image actually depicts food. If not food, set isFood: false.

Return strictly valid JSON without Markdown blocks:
{
  "isFood": true,
  "foodName": "Specific Name of Dish",
  "mealType": "breakfast",
  "servingSize": "1 bowl (~300g)",
  "calories": 420,
  "macros": {
    "protein": 18,
    "carbs": 52,
    "fats": 14,
    "fiber": 8
  },
  "ingredients": ["Ingredient 1", "Ingredient 2"],
  "confidenceScore": 0.92,
  "healthHighlights": "Clinical nutritional summary of benefits.",
  "disclaimer": "Nutritional metrics are AI approximations based on visual analysis. Actual values vary based on ingredients, cooking oils, and precise portion sizes. Do not treat as exact laboratory measurements."
}`;

  let lastError = null;

  for (const modelName of CANDIDATE_VISION_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
      ]);

      const responseText = result.response.text();
      const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.isFood === false) {
        return {
          success: false,
          isFood: false,
          message: 'The uploaded image does not appear to contain recognizable food items. Please upload a clear photo of your meal or log manually.',
        };
      }

      return {
        success: true,
        isFood: true,
        foodName: parsed.foodName || 'Identified Meal',
        mealType: ['breakfast', 'lunch', 'dinner', 'snack'].includes(parsed.mealType?.toLowerCase())
          ? parsed.mealType.toLowerCase()
          : 'lunch',
        servingSize: parsed.servingSize || '1 standard portion',
        calories: Math.max(10, Math.min(3500, Number(parsed.calories) || 350)),
        macros: {
          protein: Math.max(0, Number(parsed.macros?.protein) || 0),
          carbs: Math.max(0, Number(parsed.macros?.carbs) || 0),
          fats: Math.max(0, Number(parsed.macros?.fats) || 0),
          fiber: Math.max(0, Number(parsed.macros?.fiber) || 0),
        },
        ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
        confidenceScore: Math.min(0.98, Math.max(0.5, Number(parsed.confidenceScore) || 0.88)),
        confidencePercentage: `${Math.round(Math.min(0.98, Math.max(0.5, Number(parsed.confidenceScore) || 0.88)) * 100)}%`,
        healthHighlights: parsed.healthHighlights || 'Balanced macro-profile supporting sustained daily energy.',
        disclaimer:
          parsed.disclaimer ||
          'Nutritional estimates are clinical approximations derived from visual food recognition. Actual nutrients vary by preparation and portion size.',
        modelUsed: modelName,
      };
    } catch (err) {
      lastError = err;
      const safeMsg = sanitizeError(err.message);
      console.warn(`[Gemini Vision] Model ${modelName} returned status ${err.status || 'ERR'}: ${safeMsg.slice(0, 90)}. Trying fallback...`);
    }
  }

  throw new Error(`AI Food Image Analysis failed across all candidate models. ${sanitizeError(lastError?.message)}`);
};

module.exports = {
  analyzeFoodImage,
  parseImageData,
  ALLOWED_MIME_TYPES,
};
