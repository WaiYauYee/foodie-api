/**
 * ML Service - Calls the Flask ML backend for food classification
 * Place this in: backend/services/classificationClient.js
 */

const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

// Configuration
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';
const TIMEOUT = 30000; // 30 seconds

/**
 * Check if ML classification service is healthy
 */
async function checkHealth() {
  try {
    const response = await axios.get(`${ML_API_URL}/health`, {
      timeout: TIMEOUT,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Classification service health check failed:', error.message);
    throw new Error('ML Classification Service is not available');
  }
}

/**
 * Classify a food image from local path
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} - {success: boolean, primary_prediction, all_predictions, model_info}
 */
async function classifyImage(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    console.log(`📷 Classifying image: ${imagePath}`);

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const response = await axios.post(`${ML_API_URL}/api/classify`, form, {
      headers: form.getHeaders(),
      timeout: TIMEOUT,
    });

    console.log('✓ Classification completed:', response.data.primary_prediction.food_name);
    return response.data;
  } catch (error) {
    console.error('❌ Classification error:', error.message);
    throw error;
  }
}

/**
 * Classify a food image from a buffer (e.g., multer upload)
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} - {success: boolean, primary_prediction, all_predictions, model_info}
 */
async function classifyImageBuffer(imageBuffer, filename) {
  try {
    console.log(`📷 Classifying buffer: ${filename}`);

    const form = new FormData();
    form.append('image', imageBuffer, filename);

    const response = await axios.post(`${ML_API_URL}/api/classify`, form, {
      headers: form.getHeaders(),
      timeout: TIMEOUT,
    });

    console.log('✓ Classification completed:', response.data.primary_prediction.food_name);
    return response.data;
  } catch (error) {
    console.error('❌ Classification error:', error.message);
    throw error;
  }
}

module.exports = {
  checkHealth,
  classifyImage,
  classifyImageBuffer,
  ML_API_URL,
};
