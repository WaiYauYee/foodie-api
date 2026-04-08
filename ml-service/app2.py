# ml-service/app.py

import base64
from datetime import datetime
from io import BytesIO
from flask import Flask, request, jsonify
from PIL import Image
import json
import os
import numpy as np
import uuid

from dotenv import load_dotenv
load_dotenv()

from classification import (
    classify_image_service, classification_model, classification_device, NUM_CLASSES, DEVICE
)
from segmentation_calorie2 import run_segmentation, predict_ingredients, estimate_calories
from ingredient_matcher import get_ingredient_nutrition

app = Flask(__name__)

# ============================================
# FAKE DATA FOR TESTING
# ============================================
 
# Create mock detection objects (simplified)
class MockDetection:
    def __init__(self, label, mask):
        self.label = label
        self.mask = mask

# Store segmentation results in memory (simple dict-based cache)
segmentation_store = {}

# Fake data entry 1: Chicken Rice Dish
fake_mask_1 = np.random.rand(400, 440).astype(bool)  # Random binary mask
fake_mask_2 = np.random.rand(420, 540).astype(bool)
fake_mask_3 = np.random.rand(380, 340).astype(bool)
 
segmentation_store["demo-chicken-rice"] = {
    "detections": [
        MockDetection("white rice", fake_mask_1),
        MockDetection("boiled chicken", fake_mask_2),
        MockDetection("siu mai", fake_mask_3),
    ],
    "detected_ingredients": ["white rice", "boiled chicken", "siu mai"],
    "ingredient_data": {
        "food_name": "Chicken Rice",
        "description": "A plate of steamed rice with grilled chicken and stir-fried vegetables",
        "estimated_calories_kcal": 550,
        "macronutrients": {
            "protein_g": 35,
            "carbohydrates_g": 60,
            "fat_g": 12,
            "fiber_g": 3
        },
        "ingredients": [
            {
                "name": "white rice",
                "estimated_proportion": 0.5,
                "estimated_weight_g": 150,
                "estimated_calories_kcal": 195,
                "protein_g": 4.3,
                "carbohydrates_g": 43,
                "fat_g": 0.3,
                "fiber_g": 0.4
            },
            {
                "name": "boiled chicken",
                "estimated_proportion": 0.35,
                "estimated_weight_g": 105,
                "estimated_calories_kcal": 165,
                "protein_g": 31,
                "carbohydrates_g": 0,
                "fat_g": 3.6,
                "fiber_g": 0
            },
            {
                "name": "siu mai",
                "estimated_proportion": 0.15,
                "estimated_weight_g": 45,
                "estimated_calories_kcal": 18,
                "protein_g": 1.2,
                "carbohydrates_g": 3.5,
                "fat_g": 0.2,
                "fiber_g": 0.9
            }
        ]
    },
    "overlay_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
 
# Fake data entry 2: Pizza
fake_mask_4 = np.random.rand(480, 640).astype(bool)
fake_mask_5 = np.random.rand(480, 640).astype(bool)
 
segmentation_store["demo-pizza"] = {
    "detections": [
        MockDetection("pizza crust", fake_mask_4),
        MockDetection("cheese", fake_mask_5),
    ],
    "detected_ingredients": ["pizza crust", "cheese"],
    "ingredient_data": {
        "food_name": "Cheese Pizza Slice",
        "description": "A single slice of cheese pizza with tomato sauce",
        "estimated_calories_kcal": 285,
        "macronutrients": {
            "protein_g": 12,
            "carbohydrates_g": 36,
            "fat_g": 10,
            "fiber_g": 1.5
        },
        "ingredients": [
            {
                "name": "pizza crust",
                "estimated_proportion": 0.6,
                "estimated_weight_g": 120,
                "estimated_calories_kcal": 300,
                "protein_g": 9,
                "carbohydrates_g": 54,
                "fat_g": 3,
                "fiber_g": 1
            },
            {
                "name": "cheese",
                "estimated_proportion": 0.4,
                "estimated_weight_g": 80,
                "estimated_calories_kcal": 320,
                "protein_g": 20,
                "carbohydrates_g": 2,
                "fat_g": 26,
                "fiber_g": 0
            }
        ]
    },
    "overlay_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}
 
# Fake data entry 3: Nasi Lemak (Malaysian dish)
fake_mask_6 = np.random.rand(480, 640).astype(bool)
fake_mask_7 = np.random.rand(480, 640).astype(bool)
fake_mask_8 = np.random.rand(480, 640).astype(bool)
fake_mask_9 = np.random.rand(480, 640).astype(bool)
 
segmentation_store["demo-nasi-lemak"] = {
    "detections": [
        MockDetection("coconut rice", fake_mask_6),
        MockDetection("sambal", fake_mask_7),
        MockDetection("fried chicken", fake_mask_8),
        MockDetection("cucumber", fake_mask_9),
    ],
    "detected_ingredients": ["coconut rice", "sambal", "fried chicken", "cucumber"],
    "ingredient_data": {
        "food_name": "Nasi Lemak",
        "description": "Traditional Malaysian coconut rice served with fried chicken, sambal, and cucumber",
        "estimated_calories_kcal": 680,
        "macronutrients": {
            "protein_g": 38,
            "carbohydrates_g": 72,
            "fat_g": 22,
            "fiber_g": 2
        },
        "ingredients": [
            {
                "name": "coconut rice",
                "estimated_proportion": 0.45,
                "estimated_weight_g": 180,
                "estimated_calories_kcal": 360,
                "protein_g": 6,
                "carbohydrates_g": 50,
                "fat_g": 16,
                "fiber_g": 0.5
            },
            {
                "name": "fried chicken",
                "estimated_proportion": 0.35,
                "estimated_weight_g": 140,
                "estimated_calories_kcal": 280,
                "protein_g": 28,
                "carbohydrates_g": 8,
                "fat_g": 14,
                "fiber_g": 0
            },
            {
                "name": "sambal",
                "estimated_proportion": 0.12,
                "estimated_weight_g": 48,
                "estimated_calories_kcal": 24,
                "protein_g": 1,
                "carbohydrates_g": 4,
                "fat_g": 0.5,
                "fiber_g": 0.8
            },
            {
                "name": "cucumber",
                "estimated_proportion": 0.08,
                "estimated_weight_g": 32,
                "estimated_calories_kcal": 16,
                "protein_g": 0.5,
                "carbohydrates_g": 3,
                "fat_g": 0.2,
                "fiber_g": 0.7
            }
        ]
    },
    "overlay_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
}

# ============================================
# HEALTH CHECK
# ============================================
 
@app.route('/api/v1/system/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'classification': 'loaded' if classification_model is not None else 'not_loaded',
            'segmentation': 'GroundingDINO + SAM pipeline'
        },
        'device': DEVICE,
        'num_classes': NUM_CLASSES
    }), 200
 
 
# ============================================
# CLASSIFICATION
# ============================================
@app.route('/api/v1/vision/classify', methods=['POST'])
def classify():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
 
    file = request.files['image']
    img = Image.open(file.stream).convert('RGB')
    top_k = request.args.get('top_k', default=5, type=int)
 
    try:
        result = classify_image_service(img, top_k=top_k)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
 
 
def convert_numpy(obj):
    """Recursively convert NumPy types to native Python types"""
    if isinstance(obj, dict):
        return {k: convert_numpy(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy(x) for x in obj]
    elif isinstance(obj, (np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, (np.int32, np.int64)):
        return int(obj)
    return obj
 
 
def segment_image_with_calories(img: Image.Image):
    """
    OPTIMIZED: Perform segmentation AND pre-compute all nutrition data.
    
    This function:
    1. Predicts ingredients WITH CALORIES (not just names)
    2. Runs segmentation
    3. Estimates calories immediately
    4. Stores everything pre-computed
    
    Returns: seg_id and stored data with all nutrition pre-computed
    """
    # Step 1: Predict ingredients WITH CALORIES (full LLM analysis)
    print("[SEGMENT] Step 1: Predicting ingredients with calorie data...")
    ingredient_data = predict_ingredients(img, estimate_calories=True)
    
    ingredient_names = [ing.get("name") for ing in ingredient_data.get("ingredients", [])]
    if not ingredient_names:
        raise ValueError("No ingredients detected")
    
    print(f"[SEGMENT] Found {len(ingredient_names)} ingredients")
 
    # Step 2: Run segmentation
    print("[SEGMENT] Step 2: Running segmentation...")
    seg_result = run_segmentation(img, ingredient_names)
    detections = seg_result["detections"]
    detected_ingredients = seg_result["detected_ingredients"]
    overlay_img = seg_result["overlay_img"]
 
    # Convert overlay to base64
    buffer = BytesIO()
    overlay_img.save(buffer, format="PNG")
    overlay_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
 
    # Store original image in base64
    img_buffer = BytesIO()
    img.save(img_buffer, format="PNG")
    original_image_base64 = base64.b64encode(img_buffer.getvalue()).decode("utf-8")
 
    # Step 3: PRE-COMPUTE CALORIES (happens during segmentation, not on /calorie call)
    print("[SEGMENT] Step 3: Pre-computing calories...")
    calorie_results, total_calories, calorie_range = estimate_calories(
        detections=detections,
        ingredient_names=detected_ingredients,
        ingredient_data=ingredient_data,
        total_serving_weight=0.0
    )
 
    # Convert NumPy types
    calorie_results = convert_numpy(calorie_results)
    total_calories = convert_numpy(total_calories)
    calorie_range = convert_numpy(calorie_range)
 
    print("[SEGMENT] ✓ Pre-computed nutrition data:")
    print(f"  Total Calories: {total_calories['estimated_calories_kcal']} kcal")
    print(f"  Protein: {total_calories['protein_g']}g | Carbs: {total_calories['carbohydrates_g']}g")
 
    # Store in memory with ALL data pre-computed
    seg_id = str(uuid.uuid4())
    segmentation_store[seg_id] = {
        "detections": detections,
        "detected_ingredients": detected_ingredients,
        "ingredient_data": ingredient_data,
        "overlay_base64": overlay_base64,
        "original_image_base64": original_image_base64,
        # ✓ PRE-COMPUTED NUTRITION DATA
        "calorie_data": {
            "per_ingredient": calorie_results,
            "total_nutrition": total_calories,
            "calorie_range_kcal": calorie_range
        }
    }
 
    return seg_id, segmentation_store[seg_id]
 
 
# ============================================
# /segment - segmentation with pre-computed calories
# ============================================
@app.route("/api/v1/vision/segment", methods=["POST"])
def segment_endpoint():
    """
    Segment food and PRE-COMPUTE all nutrition data.
    
    Response includes:
    - segmentation_id: ID to retrieve results
    - ingredients: List of detected ingredients
    - overlayImage: Segmentation visualization
    - originalImage: Original food image
    - per_ingredient: Pre-computed nutrition per ingredient
    - total_nutrition: Pre-computed total nutrition
    - calorie_range_kcal: Min/max calorie estimate
    """
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
 
    file = request.files['image']
    img = Image.open(file.stream).convert("RGB")
 
    try:
        seg_id, stored_data = segment_image_with_calories(img)
        
        return jsonify({
            "success": True,
            "segmentation_id": seg_id,
            "ingredients": stored_data["detected_ingredients"],
            "overlayImage": f"data:image/png;base64,{stored_data['overlay_base64']}",
            "originalImage": f"data:image/png;base64,{stored_data['original_image_base64']}",
            # ✓ Return pre-computed nutrition
            "per_ingredient": stored_data["calorie_data"]["per_ingredient"],
            "total_nutrition": stored_data["calorie_data"]["total_nutrition"],
            "calorie_range_kcal": stored_data["calorie_data"]["calorie_range_kcal"]
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
 
# ============================================
# /segment/<seg_id>/calorie - return pre-computed calories
# ============================================
@app.route("/api/v1/vision/segment/<seg_id>/calorie", methods=["POST"])
def calorie_endpoint(seg_id):
    """
    Get pre-computed calories for a segmentation.
    
    NO PROCESSING - just returns data pre-computed during segmentation!
    """
    if seg_id not in segmentation_store:
        return jsonify({"error": "Segmentation ID not found"}), 404
 
    stored = segmentation_store[seg_id]
 
    try:
        # ✓ Simply return pre-computed data (already calculated)
        calorie_data = stored.get("calorie_data")
        
        if not calorie_data:
            return jsonify({"error": "No calorie data available for this segmentation"}), 500
 
        print(f"\n[CALORIE] Returning pre-computed data for seg_id: {seg_id}")
        print(f"[CALORIE] Total Calories: {calorie_data['total_nutrition']['estimated_calories_kcal']} kcal")
 
        return jsonify({
            "success": True,
            "segmentation_id": seg_id,
            "per_ingredient": calorie_data["per_ingredient"],
            "total_nutrition": calorie_data["total_nutrition"],
            "calorie_range_kcal": calorie_data["calorie_range_kcal"]
        }), 200
 
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
 
# # ============================================
# # /analyze - analyze image end-to-end
# # ============================================
# @app.route("/api/v1/vision/analyze", methods=["POST"])
# def analyze_endpoint():
#     """
#     Complete end-to-end analysis: classify, segment, and estimate calories.
    
#     Returns everything in one go (same as /segment but also with overlay).
#     """
#     if 'image' not in request.files:
#         return jsonify({"error": "No image provided"}), 400
 
#     file = request.files['image']
#     img = Image.open(file.stream).convert("RGB")
 
#     try:
#         seg_id, stored_data = segment_image_with_calories(img)
 
#         return jsonify({
#             "success": True,
#             "segmentation_id": seg_id,
#             "ingredients": stored_data["detected_ingredients"],
#             "overlayImage": f"data:image/png;base64,{stored_data['overlay_base64']}",
#             "per_ingredient": stored_data["calorie_data"]["per_ingredient"],
#             "total_nutrition": stored_data["calorie_data"]["total_nutrition"],
#             "calorie_range_kcal": stored_data["calorie_data"]["calorie_range_kcal"]
#         }), 200
 
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
 
 
# ============================================
# MODEL INFO ENDPOINTS
# ============================================
 
@app.route('/api/v1/system/model-info', methods=['GET'])
def model_info():
    """Get information about loaded models"""
    return jsonify({
        'success': True,
        'models': {
            'classification': {
                'name': 'ImprovedFoodCNN',
                'classes': NUM_CLASSES,
                'device': classification_device,
                'loaded': classification_model is not None,
                'input_size': 224,
                'parameters': 15257720 if classification_model is not None else None
            },
            'segmentation': {
                'pipeline': 'Gemini Vision + GroundingDINO + SAM',
                'loaded': True
            }
        }
    }), 200
 
 
@app.route('/api/v1/system/endpoints', methods=['GET'])
def endpoints():
    """List available API endpoints"""
    return jsonify({
        'success': True,
        'endpoints': {
            'health': {
                'method': 'GET',
                'path': '/api/v1/system/health',
                'description': 'Health check and service status'
            },
            'classify': {
                'method': 'POST',
                'path': '/api/v1/vision/classify',
                'description': 'Classify food using ImprovedFoodCNN',
                'params': ['image (file)', 'top_k (optional, default: 5)'],
                'status': 'available' if classification_model is not None else 'unavailable'
            },
            'segment': {
                'method': 'POST',
                'path': '/api/v1/vision/segment',
                'description': 'Segment food and PRE-COMPUTE all nutrition data',
                'params': ['image (file)'],
                'status': 'available'
            },
            'calorie_by_segmentation': {
                'method': 'POST',
                'path': '/api/v1/vision/segment/<seg_id>/calorie',
                'description': 'Get pre-computed calorie estimates (instant, no recalculation)',
                'params': ['seg_id (path parameter)'],
                'status': 'available'
            },
            'analyze': {
                'method': 'POST',
                'path': '/api/v1/vision/analyze',
                'description': 'End-to-end analysis (classify, segment, estimate calories)',
                'params': ['image (file)'],
                'status': 'available'
            },
            'model_info': {
                'method': 'GET',
                'path': '/api/v1/system/model-info',
                'description': 'Get information about loaded models'
            },
            'endpoints': {
                'method': 'GET',
                'path': '/api/v1/system/endpoints',
                'description': 'List all available endpoints'
            }
        }
    }), 200
 
 
# ============================================
# ERROR HANDLERS
# ============================================
 
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found. Use /api/v1/system/endpoints to see available endpoints.'}), 404
 
 
@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500
 
 
# ============================================
# MAIN
# ============================================
 
if __name__ == '__main__':
    # Configuration
    port = int(os.getenv('PORT', 5000))
    
    print(f"\n🚀 Starting Flask app on 0.0.0.0:{port}")
    print(f"   Available endpoints:")
    print(f"   ✓ GET  /api/v1/system/health")
    print(f"   ✓ POST /api/v1/vision/classify")
    print(f"   ✓ POST /api/v1/vision/segment/<seg_id>/calorie (instant retrieval)")
    print(f"   ✓ POST /api/v1/vision/analyze")
    print(f"   ✓ GET  /api/v1/system/model-info")
    print(f"   ✓ GET  /api/v1/system/endpoints")
    print()
    
    app.run(host='0.0.0.0', port=port)