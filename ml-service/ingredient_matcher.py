# ingredient_matcher.py

import json
import re
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# -----------------------------
# CONFIG
# -----------------------------
JSON_FILE = "data/malaysian_ingredient_list.json"
EMBEDDING_FILE = "data/food_embeddings.npy"
SIMILARITY_THRESHOLD = 0.65

# -----------------------------
# TEXT NORMALIZATION
# -----------------------------
def normalize_text(text):
    """
    Lowercase, remove non-alphabet characters, and strip spaces.
    """
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    return text.strip()


# -----------------------------
# LOAD FOOD DATABASE
# -----------------------------
def load_food_database(json_file):
    """
    Load food JSON and return:
        foods: full food dicts
        normalized_food_names: normalized names for embeddings
    """
    with open(json_file, "r", encoding="utf-8") as f:
        foods = json.load(f)

    normalized_food_names = [normalize_text(food["food_name"]) for food in foods]

    return foods, normalized_food_names


# -----------------------------
# LOAD PRECOMPUTED EMBEDDINGS
# -----------------------------
def load_embeddings(embedding_file):
    """
    Load precomputed embeddings and initialize the model.
    """
    model = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = np.load(embedding_file)
    return model, embeddings


# -----------------------------
# MATCH MULTIPLE INGREDIENTS
# -----------------------------
def match_ingredients(ingredients, model, food_embeddings, foods):
    """
    Match a list of ingredients to the food database using cosine similarity.
    Returns a list of dicts with match info and nutrition.
    """

    normalized_queries = [normalize_text(q) for q in ingredients]
    query_embeddings = model.encode(normalized_queries)

    # Compute similarities in a single vectorized step
    similarities = cosine_similarity(query_embeddings, food_embeddings)

    results = []

    for i, query in enumerate(ingredients):
        sims = similarities[i]
        best_index = sims.argmax()
        best_score = sims[best_index]

        if best_score < SIMILARITY_THRESHOLD:
            results.append({
                "query": query,
                "matched_food": None,
                "similarity": float(best_score),
                "closest_match": foods[best_index]["food_name"]
            })
        else:
            matched_food = foods[best_index]
            results.append({
                "query": query,
                "matched_food": matched_food["food_name"],
                "similarity": float(best_score),
                "nutrition": {
                    "energy_kcal_per_100g": matched_food.get("energy_kcal_per_100g"),
                    "protein_g_per_100g": matched_food.get("protein_g_per_100g"),
                    "carbohydrate_g_per_100g": matched_food.get("carbohydrate_g_per_100g"),
                    "fat_g_per_100g": matched_food.get("fat_g_per_100g"),
                    "fiber_g_per_100g": matched_food.get("fibre_g_per_100g")
                }
            })

    return results

# -----------------------------
# HELPER: GET NUTRITION FOR INGREDIENT LIST
# -----------------------------
def get_ingredient_nutrition(ingredients):
    """
    Given a list of ingredient names, return matched food info and nutrition.
    """
    foods, _ = load_food_database(JSON_FILE)
    model, food_embeddings = load_embeddings(EMBEDDING_FILE)
    return match_ingredients(ingredients, model, food_embeddings, foods)

# -----------------------------
# MAIN
# -----------------------------
# def main():
#     print("Loading food database...")
#     foods, normalized_food_names = load_food_database(JSON_FILE)

#     print("Loading precomputed embeddings...")
#     model, food_embeddings = load_embeddings(EMBEDDING_FILE)

#     # Example LLM output
#     llm_ingredients = [
#         "shaved ice",
#         "Red Beans",
#         "Sweet Corn Kernels",
#         "Grass Jelly (Cincau)"
#     ]

#     print("\nMatching ingredients...\n")
#     results = match_ingredients(llm_ingredients, model, food_embeddings, foods)

#     for r in results:
#         print("Query:", r["query"])
#         print("Matched:", r.get("matched_food"))
#         print("Similarity:", r["similarity"])

#         if r.get("matched_food"):
#             nutrition = r["nutrition"]
#             print(f"Energy: {nutrition['energy_kcal']} kcal")
#             print(f"Protein: {nutrition['protein_g']} g")
#             print(f"Carbs: {nutrition['carbs_g']} g")
#             print(f"Fat: {nutrition['fat_g']} g")
#         else:
#             print("No good match. Closest:", r.get("closest_match"))

#         print("-" * 40)


# if __name__ == "__main__":
#     main()