// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const path = require("path");
// const connectDB = require("./config/db");

// const app = express();

// // Middleware to handle CORS
// app.use(
//     cors({
//         origin: "*",
//         methods: ["GET", "POST", "PUT", "DELETE"],
//         allowedHeaders: ["Content-Type", "Authorization"],
//     })
// );

// // Connect Database
// connectDB();

// // Middleware
// app.use(express.json());

// // Static folder for uploads
// app.use("/backend/uploads", express.static(path.join(__dirname, "uploads")));

// // Start Server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// backend/server.js
require("dotenv").config();
const express = require('express');
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");

// Routes
const authRoute = require("./routes/authRoute");

const app = express();
const PORT = process.env.PORT || 3001;

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ dest: uploadsDir });

// ============================================
// MIDDLEWARE
// ============================================

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// ============================================
// REQUEST LOGGING MIDDLEWARE
// ============================================

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

app.use(express.json()); // Parse JSON request bodies

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Main endpoint
app.get('/', (req, res) => {
  res.json({ message: 'MakanFit API' });
});

// Auth routes
app.use("/api/auth", authRoute);

// ============================================
// FOOD SEGMENTATION
// ============================================

// Python API URL (from environment or localhost)
const PYTHON_API_URL = process.env.ML_API_URL || "http://localhost:5000";

// Segmentation endpoint
// app.post("/api/food/analyze", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "No image provided" });
//     }

//     console.log("Received image for analysis:", req.file.filename);

//     // Initialize FormData
//     const FormData = require('form-data');
//     const formData = new FormData();
//     formData.append("image", fs.createReadStream(req.file.path));

//     // Send to Python API
//     console.log(`Calling Python API: ${PYTHON_API_URL}/api/v1/vision/segment`);
//     const response = await axios.post(
//       `${PYTHON_API_URL}/api/v1/vision/segment`,
//       formData,
//       { headers: formData.getHeaders(), timeout: 120000 }
//     );

//     console.log("Python API response data:", response.data);

//     console.log("Segmentation successful");

//     fs.unlinkSync(req.file.path);

//     return res.json({
//       success: true,
//       ingredients: response.data.ingredients,
//       overlayImage: response.data.overlayImage, // optional if Python API returns overlay
//       timestamp: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error("Segmentation error:", error.message);
//     if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

//     return res.status(500).json({
//       success: false,
//       message: error.message || "Food segmentation failed",
//       details: error.response?.data || error.message,
//     });
//   }
// });

// Classification endpoint
app.post("/api/food/classify", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }

    console.log("Received image for classification:", req.file.filename);

    const FormData = require("form-data");
    const formData = new FormData();
    formData.append("image", fs.createReadStream(req.file.path));

    const response = await axios.post(
      `${PYTHON_API_URL}/api/v1/vision/classify`,
      formData,
      { headers: formData.getHeaders(), timeout: 120000 }
    );

    console.log("Python API classify response:", response.data);

    fs.unlinkSync(req.file.path); // cleanup

    return res.json({
      success: true,
      ...response.data, // forwards Python ML API response
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Classification error:", error.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    return res.status(500).json({
      success: false,
      message: error.message || "Food classification failed",
      details: error.response?.data || error.message,
    });
  }
});


// Segmentation endpoint
app.post("/api/food/segment", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }
 
    console.log("Received image for segmentation:", req.file.filename);
 
    const FormData = require("form-data");
    const formData = new FormData();
    formData.append("image", fs.createReadStream(req.file.path));
 
    // Call Python ML service segmentation endpoint
    const response = await axios.post(
      `${PYTHON_API_URL}/api/v1/vision/segment`,
      formData,
      { headers: formData.getHeaders(), timeout: 300000 }
    );
 
    console.log("Python API segment response:", response.data);
 
    fs.unlinkSync(req.file.path); // cleanup
 
    // ✅ FIXED: Map Python API response correctly
    return res.json({
      success: true,
      segmentation_id: response.data.segmentation_id,
      ingredients: response.data.ingredients,  // ✅ Changed from 'segmentation' to 'ingredients'
      overlayImage: response.data.overlayImage,  // ✅ Added overlayImage
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Segmentation error:", error.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
 
    return res.status(500).json({
      success: false,
      message: error.message || "Food segmentation failed",
      details: error.response?.data || error.message,
    });
  }
});


// Calorie estimation endpoint
app.post("/api/food/calorie/:segmentationId", async (req, res) => {
  try {
    const { segmentationId } = req.params;
 
    if (!segmentationId) {
      return res.status(400).json({ 
        success: false, 
        message: "Segmentation ID is required" 
      });
    }
 
    console.log("Computing calories for segmentation:", segmentationId);
 
    // Call Python ML service calorie endpoint
    const response = await axios.post(
      `${PYTHON_API_URL}/api/v1/vision/segment/${segmentationId}/calorie`,
      {},
      { timeout: 120000 }
    );
 
    console.log("Python API calorie response:", response.data);

    console.log({
      success: true,
      segmentation_id: segmentationId,
      per_ingredient: response.data.per_ingredient,
      total_nutrition: response.data.total_nutrition,
      calorie_range_kcal: response.data.calorie_range_kcal
    });
 
    return res.json({
      success: true,
      segmentation_id: segmentationId,
      per_ingredient: response.data.per_ingredient,
      total_nutrition: response.data.total_nutrition,
      calorie_range_kcal: response.data.calorie_range_kcal,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Calorie computation error:", error.message);
 
    return res.status(500).json({
      success: false,
      message: error.message || "Calorie estimation failed",
      details: error.response?.data || error.message,
    });
  }
});


// Health check for Python API
app.get("/api/food/health", async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_API_URL}/api/v1/system/health`, {
      timeout: 5000,
    });
    return res.json({
      success: true,
      pythonAPI: "connected",
      pythonAPIURL: PYTHON_API_URL,
    });
  } catch (error) {
    return res.json({
      success: false,
      pythonAPI: "disconnected",
      pythonAPIURL: PYTHON_API_URL,
      error: error.message,
    });
  }
});

// Static files for uploads
app.use("/backend/uploads", express.static(path.join(__dirname, "uploads")));

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ============================================
// START SERVER
// ============================================

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = server;