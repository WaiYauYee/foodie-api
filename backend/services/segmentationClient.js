/**
 * ML Service - Calls the Flask ML backend for food segmentation
 * Place this in: backend/services/mlService.js
 */

const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5000';
const TIMEOUT = 30000; // 30 seconds

/**
 * Check if ML service is healthy
 */
async function checkHealth() {
  try {
    const response = await axios.get(`${ML_API_URL}/health`, {
      timeout: TIMEOUT
    });
    return response.data;
  } catch (error) {
    console.error('❌ ML Service health check failed:', error.message);
    throw new Error('ML Service is not available');
  }
}

/**
 * Segment a food image and return detected ingredients
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} - {success, segmentation_id, segmentation, timestamp}
 */
async function segmentImage(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    console.log("📷 Segmenting image:", imagePath);

    const formData = new FormData();
    formData.append("image", fs.createReadStream(imagePath));

    const response = await axios.post(
      `${ML_API_URL}/api/v1/vision/segment`,
      formData,
      { headers: formData.getHeaders(), timeout: TIMEOUT }
    );

    console.log("Python API segment response:", response.data);

    // Cleanup uploaded file
    fs.unlinkSync(imagePath);

    return {
      success: true,
      segmentation_id: response.data.segmentation_id,
      segmentation: response.data.segmentation,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Segmentation error:", error.message);

    // Ensure cleanup if file exists
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    throw error;
  }
}

/**
 * Segment a food image and get overlay image with labels
 * @param {string} imagePath - Path to the image file
 * @param {string} outputPath - Where to save the overlay image
 * @returns {Promise<void>}
 */
async function segmentImageWithOverlay(imagePath, outputPath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    console.log(`🖼️  Creating overlay for: ${imagePath}`);

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const response = await axios.post(
      `${ML_API_URL}/api/segment/image`,
      form,
      {
        headers: form.getHeaders(),
        responseType: 'arraybuffer',
        timeout: TIMEOUT
      }
    );

    // Save the image
    fs.writeFileSync(outputPath, response.data);
    console.log(`✓ Overlay saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Overlay creation error:', error.message);
    throw error;
  }
}

/**
 * Segment a food image and return both ingredients and overlay image (as base64)
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<Object>} - {ingredients: [...], overlay_image: 'data:image/png;base64,...'}
 */
async function segmentImageFull(imagePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    console.log(`🔄 Full segmentation for: ${imagePath}`);

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const response = await axios.post(`${ML_API_URL}/api/segment/full`, form, {
      headers: form.getHeaders(),
      timeout: TIMEOUT
    });

    console.log(`✓ Full segmentation completed`);
    return response.data;
  } catch (error) {
    console.error('❌ Full segmentation error:', error.message);
    throw error;
  }
}

/**
 * Segment an image from a buffer (e.g., from multer upload)
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} - {ingredients: [...], total_ingredients: number}
 */
async function segmentImageBuffer(imageBuffer, filename) {
  try {
    console.log(`📷 Segmenting buffer: ${filename}`);

    const form = new FormData();
    form.append('image', imageBuffer, filename);

    const response = await axios.post(`${ML_API_URL}/api/segment`, form, {
      headers: form.getHeaders(),
      timeout: TIMEOUT
    });

    console.log(`✓ Segmentation completed. Detected ${response.data.total_ingredients} ingredients`);
    return response.data;
  } catch (error) {
    console.error('❌ Segmentation error:', error.message);
    throw error;
  }
}

module.exports = {
  checkHealth,
  segmentImage,
  segmentImageWithOverlay,
  segmentImageFull,
  segmentImageBuffer,
  ML_API_URL
};