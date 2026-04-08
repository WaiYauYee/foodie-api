# segmentation_calorie.py

import os
from PIL import Image
import numpy as np
import base64
import io
import json
import tempfile
from collections import defaultdict
from flask import request
from dotenv import load_dotenv
from google import genai
from groundingdino_with_segment_anything import grounded_segmentation, plot_food_segmentation
from ingredient_matcher import get_ingredient_nutrition

# -----------------------------
# LLM client
# -----------------------------
load_dotenv()  # automatically loads .env in the current working directory

# GEMINI LLM
# api_key = os.getenv("api_key")
# if not api_key:
#     raise ValueError("Please set api_key in your .env file")
# client = genai.Client(api_key=api_key)

# GPT LLM
# from openai import OpenAI
# # Load API key from environment
# api_key = os.getenv("OPENAI_API_KEY")
# client = OpenAI(api_key=api_key)
# models = client.models.list()

# claude LLM
from anthropic import Anthropic
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
# models = client.models.list()
# for m in models.data:
#     print(m.id)

# for m in models.data:
#     print(m.id)

# -----------------------------
# LLM prompt use cases
# -----------------------------
SEGMENTATION_PROMPT = """
You are a professional nutritionist and food recognition expert.

Analyze the food image carefully.

List only the VISIBLE food components (i.e., food parts) you can see in the image.

Rules:
- If the food appears as a single whole dish, return it as one ingredient.
- If the dish has multiple visible components, list each component separately.
- Do NOT include hidden ingredients such as oil, spices, or seasoning unless clearly visible.
- Use short, canonical ingredient names in English. You may use the Malay name, or both English and Malay if appropriate.
- Estimate the weight of each ingredient in grams relative to its portion in the dish.
- Return only what is visually observable i.e., no assumptions about hidden ingredients.

Return ONLY valid JSON with this structure:

{
"food_name": "string",
"ingredients": [
    {
    "name": "ingredient name"
    }
]
}
"""

CALORIE_ESTIMATE_PROMPT = """
You are a professional nutritionist and food recognition expert.

Analyze the food image carefully.

List only the VISIBLE food components (i.e., food parts) you can see in the image.

Important:
- If the food appears as a single whole item (for example: durian, apple, banana, mango, whole egg, plain rice, fried rice, steak, bread, cake slice) and no internal or hidden ingredients are visually distinguishable, treat the entire food/dish as one ingredient using a dish-level label.
- Else if the food contains multiple visually separable components (for example: rice + chicken + vegetables, burger with bun, patty, and lettuce, salad with tomato, cucumber, and lettuce), list each component as a separate ingredient using component-level labels.
- Do NOT list hidden recipe ingredients, spices, cooking oils, or seasonings that are not visually apparent.
- Clearly visible sauces or toppings that are separate from the main food can be included as individual components.
- Use short, canonical ingredient names in English. You may use the Malay name, or both English and Malay if appropriate.

Return ONLY valid JSON. No explanation. No markdown. No extra text.

Use this exact structure:

{
  "food_name": "string",
  "description": "short description of the dish",
  "estimated_calories_kcal": number,
  "macronutrients": {
    "protein_g": number,
    "carbohydrates_g": number,
    "fat_g": number,
    "fiber_g": number
  },
  "ingredients": [
    {
      "name": "ingredient name",
      "estimated_proportion": number,
      "estimated_weight_g": number,
      "estimated_calories_kcal": number,
      "protein_g": number,
      "carbohydrates_g": number,
      "fat_g": number,
      "fiber_g": number
    }
  ]
}

Rules:
1. Food Name & Description:
   - 'food_name': Use the visible name of the dish or main food item.
   - 'description': Provide a concise 1–2 sentence description of the dish as it appears.

2. Calories & Macronutrients:
   - Estimate total calories ('estimated_calories_kcal') for the visible portion.
   - Estimate macronutrients ('protein_g', 'carbohydrates_g', 'fat_g', 'fiber_g') for the whole dish.
   - The total estimated calories should be derived from the ingredient composition (proportions and weights) and remain internally consistent.

3. Ingredient Identification:
   - Single whole item: If the food appears as one item with no separable parts, treat it as one ingredient.
   - Multiple components: If visually separable components exist (e.g., rice + chicken + vegetables, burger with bun + patty + lettuce), list each separately.
   - Visible sauces/toppings: Include only if they are distinct and visually separable.
   - Do not include hidden ingredients such as spices, oils, or seasonings not visible in the image.

4. Ingredient Properties:
   - 'name': Name of the ingredient or component.
   - 'estimated_proportion': Approximate percentage of the ingredient relative to the dish.
   - 'estimated_weight_g': Approximate weight in grams.
   - 'estimated_calories_kcal': Calories **per 100g** of this ingredient.
   - 'protein_g': Protein in grams **per 100g** of this ingredient.
   - 'carbohydrates_g': Carbs in grams **per 100g** of this ingredient.
   - 'fat_g': Fat in grams **per 100g** of this ingredient.
   - 'fiber_g': Fiber in grams **per 100g** of this ingredient.

   5. Estimation Consistency:
   - The total estimated calories for the dish should be **derived from the sum of ingredient-level calories**, based on their estimated proportions and weights, to ensure internal consistency.
"""

# ========== MODULAR FUNCTION 1: LLM Ingredient Detection ==========
# for testing
# def predict_ingredients(image: Image.Image, estimate_calories=False) -> dict:
#     """
#     Detect ingredients using Gemini LLM.
    
#     Args:
#         image: PIL Image object
#         estimate_calories: If True, returns full JSON with calories/macros. If False, returns ingredient names only.
    
#     Returns:
#         - If estimate_calories=False: {"ingredients": [names]}
#         - If estimate_calories=True: Full LLM JSON with calories/macros
#     """
#     # prompt = CALORIE_ESTIMATE_PROMPT if estimate_calories else SEGMENTATION_PROMPT
    
#     # response = client.models.generate_content(
#     #     model="gemini-2.5-flash",
#     #     contents=[image, prompt],
#     #     config={"response_mime_type": "application/json"}
#     # )
    
#     try:
#         # data = json.loads(response.text)
#         if estimate_calories:
#             return {
#         "food_name": "Roti Canai",
#         "description": "A Malaysian flatbread made from layered dough, pan-fried until golden and crispy. Served with two visible curry accompaniments—a darker red curry and a lighter yellow gravy.",
#         "estimated_calories_kcal": 450,
#         "macronutrients": {
#             "protein_g": 8,
#             "carbohydrates_g": 52,
#             "fat_g": 22,
#             "fiber_g": 2
#         },
#         "ingredients": [
#             {
#             "name": "Roti Canai (flatbread)",
#             "estimated_proportion": 60,
#             "estimated_weight_g": 150,
#             "estimated_calories_kcal": 350,
#             "protein_g": 7,
#             "carbohydrates_g": 45,
#             "fat_g": 15,
#             "fiber_g": 2
#             },
#             {
#             "name": "Red curry sauce",
#             "estimated_proportion": 25,
#             "estimated_weight_g": 60,
#             "estimated_calories_kcal": 60,
#             "protein_g": 0.5,
#             "carbohydrates_g": 4,
#             "fat_g": 4,
#             "fiber_g": 0.5
#             },
#             {
#             "name": "Yellow gravy (Dhal curry)",
#             "estimated_proportion": 15,
#             "estimated_weight_g": 40,
#             "estimated_calories_kcal": 40,
#             "protein_g": 0.5,
#             "carbohydrates_g": 3,
#             "fat_g": 3,
#             "fiber_g": 0
#             }
#         ]
#         }
#         else:
#             return {"ingredients": ["Roti Canai (flatbread)", "Yellow gravy (Dhal curry)", "Red curry sauce"]}
#     except Exception as e:
#         print(f"Failed to parse JSON response from LLM: {e}")
#         return {"ingredients": []}

# GEMINI LLM
# def predict_ingredients(image: Image.Image, estimate_calories=False) -> dict:
#     """
#     Detect ingredients using LLM.
    
#     Args:
#         image: PIL Image object
#         estimate_calories: If True, returns full JSON with calories/macros. If False, returns ingredient names only.
    
#     Returns:
#         - If estimate_calories=False: {"ingredients": [names]}
#         - If estimate_calories=True: Full LLM JSON with calories/macros
#     """
#     prompt = CALORIE_ESTIMATE_PROMPT if estimate_calories else SEGMENTATION_PROMPT
    
#     response = client.models.generate_content(
#         model="gemini-2.5-flash",
#         contents=[image, prompt],
#         config={"response_mime_type": "application/json"}
#     )
    
#     try:
#         data = json.loads(response.text)
#         if estimate_calories:
#             return data
#         else:
#             return {"ingredients": [i["name"] for i in data.get("ingredients", [])]}
#     except Exception as e:
#         print(f"Failed to parse JSON response from LLM: {e}")
#         return {"ingredients": []}

# GPT
# def predict_ingredients(image: Image.Image, estimate_calories=False, model="gpt-4o"):
#     """
#     Detect ingredients from a food image using GPT multimodal.
    
#     Args:
#         image: PIL Image object
#         estimate_calories: If True, returns full JSON with calories/macros; else ingredient names only.
#         model: GPT model to use (gpt-4o, gpt-4o-mini)
        
#     Returns:
#         dict: If estimate_calories=True, full LLM JSON; else {"ingredients": [names]}
#     """
#     import base64, io, json, re

#     # Convert image to RGB and encode as base64
#     image = image.convert("RGB")
#     buffered = io.BytesIO()
#     image.save(buffered, format="PNG")
#     img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

#     # Select prompt internally
#     prompt = CALORIE_ESTIMATE_PROMPT if estimate_calories else SEGMENTATION_PROMPT

#     # Build messages with proper multimodal image input
#     messages = [
#         {"role": "system", "content": "You are a professional nutritionist and food recognition expert."},
#         {"role": "user", "content": [
#             {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{img_base64}"}},
#             {"type": "text", "text": prompt}
#         ]}
#     ]

#     try:
#         response = client.chat.completions.create(
#             model=model,
#             messages=messages
#         )
#         content = response.choices[0].message.content

#         # Robust JSON extraction
#         match = re.search(r"\{.*\}", content, re.DOTALL)
#         if not match:
#             print("No JSON found in GPT output.")
#             return {} if estimate_calories else {"ingredients": []}

#         data = json.loads(match.group())

#         if estimate_calories:
#             return data
#         else:
#             return {"ingredients": [i["name"] for i in data.get("ingredients", [])]}

#     except Exception as e:
#         print(f"Failed to parse JSON response from GPT: {e}")
#         return {} if estimate_calories else {"ingredients": []}

# claude
def predict_ingredients(image: Image.Image, estimate_calories=False) -> dict:
    """
    Detect ingredients using Claude (Anthropic API).

    Args:
        image: PIL Image object
        estimate_calories: If True → full calorie JSON
                           If False → ingredient names only

    Returns:
        dict
    """

    # Select prompt
    prompt = CALORIE_ESTIMATE_PROMPT if estimate_calories else SEGMENTATION_PROMPT

    # Convert image to base64
    buffer = io.BytesIO()
    image.convert("RGB").save(buffer, format="JPEG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode()

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",  # or latest Claude model
            max_tokens=2500,
            temperature=0,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/jpeg",
                                "data": img_base64
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        )

        # Claude returns content as a list of blocks
        text_output = ""
        for block in response.content:
            if block.type == "text":
                text_output += block.text

        import re

        # Claude returns content as blocks
        text_output = ""

        print("\n=== CLAUDE RAW RESPONSE ===")
        print(response)
        print("===========================\n")

        for block in response.content:
            if hasattr(block, "text") and block.text:
                text_output += block.text.strip()

        print("\n=== EXTRACTED TEXT ===")
        print(text_output)
        print("======================\n")

        # ❗ HARD FAIL if empty
        if not text_output:
            raise ValueError("Claude returned EMPTY response")

        # ✅ Extract JSON safely
        match = re.search(r"\{.*\}", text_output, re.DOTALL)

        if not match:
            raise ValueError(f"No JSON found in Claude output:\n{text_output}")

        json_str = match.group()

        # Optional: clean trailing commas (Claude sometimes adds them)
        json_str = re.sub(r",\s*}", "}", json_str)
        json_str = re.sub(r",\s*]", "]", json_str)

        data = json.loads(json_str)

        if estimate_calories:
            return data
        else:
            return {"ingredients": [i["name"] for i in data.get("ingredients", [])]}

    except Exception as e:
        print(f"Claude parsing error: {e}")
        return {"ingredients": []}
    

# ========== MODULAR FUNCTION 2: Segmentation ==========
def run_segmentation(image: Image.Image, ingredient_names: list = None) -> dict:
    """
    Run GroundingDINO + SAM segmentation.
    
    FIXED: Handles overlay_img being None and creates fallback overlay.
    """
    # Save image temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        temp_path = tmp.name
        image.save(temp_path)
    
    try:
        if ingredient_names is None:
            ingredient_names = []
        
        # CORRECT unpacking (image_array, detections)
        image_array, detections = grounded_segmentation(
            image=temp_path,
            labels=ingredient_names,
            threshold=0.3,
            polygon_refinement=True
        )
        
        # Try to generate overlay
        overlay_img = None
        try:
            overlay_img = plot_food_segmentation(
                image_array,
                detections,
                alpha=0.45,
                save_name=None
            )
        except Exception as e:
            print(f"Warning: Could not generate overlay: {e}")
            overlay_img = None
        
        # FALLBACK: If overlay generation failed, use original image
        if overlay_img is None:
            print("Creating fallback overlay from original image...")
            overlay_img = Image.fromarray(image_array.astype('uint8')) if isinstance(image_array, np.ndarray) else image
        
        # Extract unique ingredient labels
        detected_ingredients = list({
            d.label.replace(".", "").strip()
            for d in detections
        })
        
        return {
            "detections": detections,
            "detected_ingredients": detected_ingredients,
            "overlay_img": overlay_img
        }
    
    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)
 
 
# ========== MODULAR FUNCTION 3: Pixel Proportions ==========
def compute_pixel_proportions(detections: list) -> list:
    """
    Compute pixel-area proportions for each ingredient from segmentation detections.
    
    Args:
        detections: List of detection objects with .label and .mask attributes
    
    Returns:
        List of dicts: [{"name": label, "pixel_area": int, "proportion": float}]
    """
    # Step 1: combine masks of same label
    label_masks = defaultdict(list)
    for det in detections:
        if det.mask is not None:
            label = det.label.replace('.', '').strip()
            label_masks[label].append(det.mask.astype(bool))
    
    # Step 2: compute total pixels for each label
    result = []
    total_pixels_all = 0
    label_pixel_areas = {}
    
    for label, masks in label_masks.items():
        combined_mask = np.logical_or.reduce(masks)  # merge multiple masks
        area = combined_mask.sum()
        label_pixel_areas[label] = area
        total_pixels_all += area
    
    # Step 3: compute proportions
    for label, area in label_pixel_areas.items():
        proportion = area / total_pixels_all if total_pixels_all > 0 else 0
        result.append({
            "name": label,
            "pixel_area": int(area),
            "proportion": round(proportion, 4)
        })
    
    print("\n=== PIXEL PROPORTIONS ===")
    for r in result:
        print(f"{r['name']}: area={r['pixel_area']} | proportion={r['proportion']}")

    return result
 
 
# ========== MODULAR FUNCTION 4: Overlay to Base64 ==========
def get_overlay_base64(overlay_img: Image.Image) -> str:
    """Convert overlay PIL image to base64 string."""
    if overlay_img is None:
        return None
    
    buffer = io.BytesIO()
    overlay_img.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
 
 
# ========== MODULAR FUNCTION 5: Compute Calories ==========
def compute_calories(ingredients_proportion: list, ingredient_nutrition_map: dict, llm_ingredient_data: dict = None, total_serving_weight: float = 250.0):
    """
    Estimate calories and macros for each ingredient.
    Fallback to LLM estimated weight if segmentation weight is zero.

    Args:
        ingredients_proportion: List of {"name": str, "proportion": float}
        ingredient_nutrition_map: Dict mapping ingredient names to nutrition per 100g
        llm_ingredient_data: Optional dict from LLM with 'estimated_weight_g' per ingredient
        total_serving_weight: Total dish weight in grams

    Returns:
        Tuple of (results_list, total_nutrition_dict)
    """
    print("\n=== CALORIE COMPUTATION DEBUG ===")
    print(f"Total Serving Weight: {total_serving_weight}g")

    results = []
    total_nutrition = {
        "estimated_calories_kcal": 0,
        "protein_g": 0,
        "carbohydrates_g": 0,
        "fat_g": 0,
        "fiber_g": 0
    }

     # Build lookup from LLM data
    llm_weight_map = {}
    if llm_ingredient_data and "ingredients" in llm_ingredient_data:
        for ing in llm_ingredient_data["ingredients"]:
            llm_weight_map[ing["name"].lower()] = ing.get("estimated_weight_g", 0)
 
    for ing in ingredients_proportion:
        name = ing["name"]
        prop = ing.get("proportion", 0)
        nutrition = ingredient_nutrition_map.get(name, {})

        print(f"\n--- Ingredient: {name} ---")
        print(f"Proportion (from segmentation): {prop}")

        # Get LLM weight
        llm_weight = llm_weight_map.get(name.lower(), 0)

        # If segmentation detected → scale LLM weight by proportion
        if prop > 0:
            weight_g = prop * total_serving_weight
            print(f"[INFO] Using segmentation proportion for '{name}'")
        else:
            weight_g = llm_weight
            print(f"[INFO] Using LLM weight for '{name}': {weight_g}g")

        print(f"Estimated Weight: {weight_g:.2f}g")

        print("Nutrition per 100g:", nutrition)
        estimated_kcal = round(weight_g * ((nutrition.get("energy_kcal", 0) or 0)) / 100, 2)
        protein_g = round(weight_g * ((nutrition.get("protein_g", 0) or 0)) / 100, 2)
        carbs_g = round(weight_g * ((nutrition.get("carbs_g", 0) or 0)) / 100, 2)
        fat_g = round(weight_g * ((nutrition.get("fat_g", 0) or 0)) / 100, 2)
        fiber_g = round(weight_g * ((nutrition.get("fiber_g", 0) or 0)) / 100, 2)

        print(f"Calories: {weight_g:.2f} * {nutrition.get('energy_kcal', 0)} / 100 = {estimated_kcal}")
        print(f"Protein: {protein_g}g | Carbs: {carbs_g}g | Fat: {fat_g}g | Fiber: {fiber_g}g")
 
        results.append({
            "name": name,
            "proportion": round(prop, 4),
            "weight_g": round(weight_g, 2),
            "estimated_calories_kcal": estimated_kcal,
            "protein_g": protein_g,
            "carbohydrates_g": carbs_g,
            "fat_g": fat_g,
            "fiber_g": fiber_g
        })
 
        total_nutrition["estimated_calories_kcal"] += estimated_kcal
        total_nutrition["protein_g"] += protein_g
        total_nutrition["carbohydrates_g"] += carbs_g
        total_nutrition["fat_g"] += fat_g
        total_nutrition["fiber_g"] += fiber_g
 
    print("\n=== TOTAL NUTRITION ===")
    for k, v in total_nutrition.items():
        print(f"{k}: {round(v, 2)}")

    for k in total_nutrition:
        total_nutrition[k] = round(total_nutrition[k], 2)
 
    return results, total_nutrition
 
 
# ========== MODULAR FUNCTION 6: Calorie Estimation ==========
def estimate_calories(detections: list, ingredient_names: list, ingredient_data: dict, total_serving_weight: float = 0.0):
    """
    Compute calories/macros for each ingredient.
    
    Args:
        detections: List of detection objects with masks
        ingredient_names: List of ingredient name strings
        ingredient_data: LLM-provided ingredient data with estimated weights
        total_serving_weight: Override total weight (uses LLM estimate if 0)
    
    Returns:
        Tuple: (per_ingredient_list, total_nutrition_dict)
    """
    if not ingredient_data:
        return [], {}, {"min_kcal": 0, "max_kcal": 0}
 
    if total_serving_weight == 0:
        total_serving_weight = sum(i.get("estimated_weight_g", 0) for i in ingredient_data.get("ingredients", [])) or 0
 
    pixel_props = compute_pixel_proportions(detections)
    matched_ingredients = get_ingredient_nutrition(ingredient_names)

    print("\n=== INGREDIENT MATCHING ===")
    for match in matched_ingredients:
        print(match)
 
    # Build per-ingredient nutrition map with fallback
    ingredients_for_calc = []
    ingredient_calorie_map = {}

    # Build full ingredient list (segmentation + LLM)
    seg_names = [n.strip() for n in ingredient_names]

    # Merge with LLM ingredients (ensure all unique names)
    llm_names = [i["name"].strip() for i in ingredient_data.get("ingredients", [])]
    merged_names = list({*seg_names, *llm_names})

    print("\n=== FINAL INGREDIENT LIST (MERGED) ===")
    print(seg_names)

    for name in merged_names:
        # Try to find matched nutrition from database
        match = next((m for m in matched_ingredients if m["query"].lower() == name.lower()), 0.0)

        if match and "nutrition" in match:
            nutrition = match["nutrition"]
            print(f"[INFO] Using matched nutrition for '{name}' from database")
        else:
            # Fallback: use LLM-provided nutrition if available
            llm_info = next((i for i in ingredient_data.get("ingredients", []) if i["name"].lower() == name.lower()), {})
            nutrition = {
                "energy_kcal": llm_info.get("estimated_calories_kcal", 0),
                "protein_g": llm_info.get("protein_g", 0),
                "carbs_g": llm_info.get("carbohydrates_g", 0),
                "fat_g": llm_info.get("fat_g", 0),
                "fiber_g": llm_info.get("fiber_g", 0)
            }
            print(f"[WARN] No database match for '{name}', using LLM fallback:", nutrition)

        ingredient_calorie_map[name] = {
            "energy_kcal": nutrition.get("energy_kcal") or nutrition.get("energy_kcal_per_100g", 0),
            "protein_g": nutrition.get("protein_g") or nutrition.get("protein_g_per_100g", 0),
            "carbs_g": nutrition.get("carbs_g") or nutrition.get("carbohydrate_g_per_100g", 0),
            "fat_g": nutrition.get("fat_g") or nutrition.get("fat_g_per_100g", 0),
            "fiber_g": nutrition.get("fiber_g") or nutrition.get("fiber_g_per_100g", 0)
        }

        # Get pixel proportion
        proportion = next((p["proportion"] for p in pixel_props if p["name"].lower() == name.lower()), 0.0)
        ingredients_for_calc.append({"name": name, "proportion": proportion})
 
    print("\n=== INGREDIENTS FOR CALCULATION ===")
    for item in ingredients_for_calc:
        print(item)

    print("\n=== LLM ingredient ===")
    print(ingredient_data)

    # Compute calories
    results, total_nutrition = compute_calories(
        ingredients_proportion=ingredients_for_calc,
        ingredient_nutrition_map=ingredient_calorie_map,
        llm_ingredient_data=ingredient_data,
        total_serving_weight=total_serving_weight
    )

    # --- CALORIE RANGE LOGIC ---
    seg_kcal = total_nutrition.get("estimated_calories_kcal", 0)
    llm_kcal = ingredient_data.get("estimated_calories_kcal", 0)

    min_kcal, max_kcal = (min(seg_kcal, llm_kcal), max(seg_kcal, llm_kcal)) if seg_kcal and llm_kcal else (0, 0)
    calorie_range = {"min_kcal": round(min_kcal, 2), "max_kcal": round(max_kcal, 2)}

    return results, total_nutrition, calorie_range

# for testing
# def estimate_calories(detections: list, ingredient_names: list, ingredient_data: dict, total_serving_weight: float = 0.0):
#     """
#     Return raw LLM ingredient data only, while preserving the original return structure 
#     to prevent breaking downstream code.

#     Returns:
#         results: empty list (placeholder for per-ingredient calculation)
#         total_nutrition: raw ingredient_data from LLM
#         calorie_range: default dictionary with min/max kcal set to 0
#     """
#     print("\n=== LLM ingredient ===")
#     print(ingredient_data)

#     # Ensure ingredient_data is a dict even if None
#     total_nutrition = ingredient_data or {}

#     results = []  # placeholder for per-ingredient nutrition
#     calorie_range = {"min_kcal": 0, "max_kcal": 0}

#     return results, total_nutrition, calorie_range