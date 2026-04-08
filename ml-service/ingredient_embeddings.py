# ingredient_embeddings.py

import json
import numpy as np
from sentence_transformers import SentenceTransformer
import re

JSON_FILE = "data/malaysian_ingredient_list.json"
EMBEDDING_FILE = "data/food_embeddings.npy"

def normalize_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    return text.strip()

# Load foods
with open(JSON_FILE, "r", encoding="utf-8") as f:
    foods = json.load(f)

# Normalize food names
normalized_food_names = [normalize_text(food["food_name"]) for food in foods]

# Load model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Compute embeddings
food_embeddings = model.encode(normalized_food_names, show_progress_bar=True)

# Save embeddings
np.save(EMBEDDING_FILE, food_embeddings)

print(f"Saved embeddings for {len(foods)} foods to {EMBEDDING_FILE}")