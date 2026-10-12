# FOODIE: Deployment of Models for Food Image Understanding

An AI-powered food image analysis system focused on Malaysian cuisine, integrating food classification, ingredient-level segmentation, and calorie estimation through a RESTful API architecture.

## Overview

FOODIE explores how computer vision and machine learning can be deployed as practical software services for understanding food images. The project focuses on Malaysian cuisine, where local dishes and their ingredients may be underrepresented in general-purpose food recognition systems.

Rather than treating food classification, segmentation, and nutritional analysis as isolated machine-learning tasks, FOODIE integrates them into an API-based system that connects machine-learning inference with a web interface.

The system provides three main capabilities:

- **Food Classification:** Predicts the dish represented in an uploaded image using a custom-trained convolutional neural network (CNN).
- **Ingredient Segmentation:** Uses open-vocabulary object detection and segmentation models to identify and separate visible food components.
- **Calorie Estimation:** Combines ingredient recognition, nutritional databases, and LLM-assisted analysis to estimate calories and macronutrients.

## Key Features

- Malaysian Food Recognition: Classification across 120 Malaysian food categories.
- Ingredient-Level Segmentation: Combines Grounding DINO and Segment Anything Model (SAM) to detect and segment visible food components.
- Nutritional Analysis: Uses Malaysian and Singaporean food composition data to support ingredient matching and nutritional estimation.
- RESTful API Integration: Exposes food analysis capabilities through HTTP endpoints.
- Full-Stack Architecture: Connects a React and TypeScript frontend to a Node.js/Express backend and a Python/Flask machine-learning service.

## System Architecture
# API Endpoints Architecture
FOODIE separates the application layer from the machine-learning layer to make the system easier to maintain and extend.
<img width="1651" height="751" alt="endpoint_diagram" src="https://github.com/user-attachments/assets/9c8e9a64-1927-445f-b62a-dbfb5f1f812d" />

# System Design
<img width="497" height="196" alt="level0" src="https://github.com/user-attachments/assets/cfee8678-5f24-4694-a9e7-4c93691a37a3" />
<img width="1798" height="383" alt="level1" src="https://github.com/user-attachments/assets/3f51e631-28bd-46f9-a0b9-7ec0afb336bc" />

## Frontend

The React and TypeScript frontend provides the interface for uploading food images and displaying classification, segmentation, and nutritional analysis results.

## Backend API

The Node.js and Express backend acts as the application-facing API layer. It handles incoming requests, coordinates calls to the machine-learning service, and supports application functionality such as authentication, file uploads, and database operations.

## Data Layer

FOODIE uses PostgreSQL for application data persistence and a curated JSON dataset for nutritional reference information used by the machine-learning pipeline.

- **Application Database:** PostgreSQL stores persistent application data, including user accounts and other records managed by the backend.
- **Nutritional Dataset:** A structured JSON dataset (refer below) organises ingredient information, including food names, food groups, energy, protein, fat, carbohydrates, fibre, source references, and serving-size information. Nutritional values are standardised per 100 g.
- **Data Sources and Matching:** Nutritional records are curated from sources including the Malaysian Food Composition Database (MyFCD) and Singapore FoodID. Text embeddings and cosine similarity are used to match recognised ingredients to relevant records for nutritional estimation.

```
{
"food_name":"", //string:nameoftheingredient
"food_group":"", //string:categoryorfoodgroup
"energy_kcal_per_100g":0, //number:energyinkilocaloriesper100g
"protein_g_per_100g":0.0, //number:proteiningramsper100g
"fat_g_per_100g":0.0, //number:fatingramsper100g
"carbohydrate_g_per_100g": 0.0, //number:carbohydratesingramsper100g
"fibre_g_per_100g":0.0, //number:fibreingramsper100g
"data_source":[ //arrayofobjects:sourceinfo
{
"source":"", //string:sourcename
"url":"" //string:URLtoreference
}
],
"servings":[ //arrayofobjects:servinginfo
{
"serving_size_g":0, //number:servingsizeingrams
"serving_unit":"" //string:unitname(e.g.,"cup")
}
]
}
```

## Machine-Learning Pipeline

# 1. Food Image Classification

A custom CNN was trained to recognise Malaysian dishes from food images.
Dataset: MalaysianFood120

| Property                  | Details  |
| --------------------------| -------- |
| Food categories           |    120   |
| Total images              |  23,707  |
| Test accuracy             |  75.60%  |
| Best validation accuracy  |  76.03%  |

# 2. Ingredient Segmentation

FOODIE uses Grounding DINO and the Segment Anything Model (SAM) through a Grounded SAM pipeline to identify and segment visible food components.

<img width="1737" height="415" alt="level2a" src="https://github.com/user-attachments/assets/7b2a487d-4346-47fe-afd2-6186d04d8336" />

The pipeline combines:

- Grounding DINO: Detects image regions corresponding to text-described food components.

- SAM: Generates segmentation masks for detected regions.

- Post-processing: Refines detections and segmentation results for downstream ingredient analysis.

The resulting masks and ingredient labels provide information that can be used by the nutritional analysis pipeline.

**Key challenge:** Malaysian dishes often contain overlapping, layered, or visually similar ingredients. Segmentation quality also depends on the text prompts and the visibility of individual components.

# 3. Calorie and Macronutrient Estimation

FOODIE implements a hybrid nutritional estimation pipeline that combines vision-language model analysis, computer vision-based segmentation, and structured nutritional databases to estimate the calorie and macronutrient content of a meal.

<img width="1860" height="374" alt="level2b" src="https://github.com/user-attachments/assets/d9d21902-2d2d-45f2-bf35-2437e3831f02" />

# Design

<img width="1255" height="882" alt="calorie-estimation-framework" src="https://github.com/user-attachments/assets/b9d40914-a708-4d10-933c-b3fa6d398db5" />

The estimation process consists of the following steps:

a. **Food and Ingredient Analysis:** A vision-language model analyses the input image and generates structured JSON containing the food name, visible ingredients, estimated serving weight, and nutritional information.

b. **Food Component Segmentation:** Grounded SAM, combining Grounding DINO and the Segment Anything Model (SAM), uses the identified ingredient names to detect and generate pixel-level masks for visible food components.

c. **Ingredient Weight Estimation:** The system calculates the relative pixel-area proportion of each segmented ingredient and uses it as a visual proxy for ingredient quantity. These proportions are combined with the estimated total serving weight to derive ingredient-level weight estimates. For ingredients that cannot be segmented successfully, the system falls back to the vision-language model's weight estimates.

d. **Nutritional Data Matching:** Ingredient names are normalised and converted into vector embeddings using a sentence-transformer model. Cosine similarity is used to match each ingredient against available nutritional records from MyFCD and SG FoodID. If no suitable match is found, the system falls back to the nutritional estimates generated by the vision-language model.

e. **Calorie and Macronutrient Calculation:** The estimated ingredient weights are combined with their corresponding per-100g nutritional values to calculate calories and aggregate nutritional estimates, including protein, carbohydrates, fat, and fibre.

f. **Calorie Range Estimation:** To account for uncertainty, the system compares the segmentation-based calorie estimate with the vision-language model estimate and reports a calorie range based on the lower and upper estimates.

This hybrid approach combines visual evidence, model-generated nutritional estimates, and structured food composition data to provide more informative estimates of meal nutrition.

**Important limitation:** A two-dimensional image does not directly reveal food weight, depth, hidden ingredients, or preparation methods. Consequently, estimated quantities and calorie values are approximate and should not be treated as verified nutritional measurements.

## API Endpoints

FOODIE exposes its main image-analysis capabilities through RESTful endpoints.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/vision/classify` | Classifies an uploaded food image and returns predictions with confidence scores. Returns predicted dish name, confidence score, top-5 predictions |
| `POST` | `/api/v1/vision/segment` | Detects and segments visible food components and returns segmentation results. Returns segmentation masks, ingredient labels, overlay visualization |
| `POST` | `/api/v1/vision/segment/:seg_id/calorie` | Retrieves nutritional estimates associated with a segmentation result. Returns per-ingredient calories, macronutrients (protein, carbs, fats, fiber) |

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, CSS, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Authentication | JWT, bcrypt |
| Email Service | Nodemailer |
| Machine Learning API | Python, Flask |
| Deep Learning | PyTorch |
| Computer Vision | Grounding DINO, Segment Anything Model (SAM), OpenCV, Pillow |
| HTTP Communication | Axios |
| Nutritional Data | MyFCD, SG FoodID |
| Ingredient Matching | Text Embeddings, Semantic Similarity |

## Project Structure

foodie-api/
```
├── backend/                      # Express.js server
│   ├── config/                   # Database and email configuration
│   ├── controller/               # Route controllers
│   ├── models/                   # MongoDB schemas
│   ├── routes/                   # API endpoints
│   ├── services/                 # Business logic & ML client calls
│   ├── middlewares/              # Authentication & validation
│   ├── uploads/                  # Uploaded image storage
│   ├── server.js                 # Server entry point
│   └── package.json
│
├── frontend/                     # React + TypeScript frontend
│   ├── makanfit/                 # Main React app
│   └── package.json
│
├── ml-service/                   # Python Flask ML backend
│   ├── classification.py                  # Food classification model
│   ├── segmentation_calorie2.py           # Food segmentation & calorie estimation
│   ├── ingredient_matcher.py              # Nutrition data retrieval
│   ├── ingredient_embeddings.py           # Embedding generation
│   ├── groundingdino_with_segment_anything.py  # Detection & segmentation
│   ├── app2.py                            # Flask app entry point
│   └── requirements.txt
│
└── .gitignore
```

# Getting Started

## Installation & Setup

#### 1. Clone repository
```
git clone https://github.com/WaiYauYee/foodie-api.git
cd foodie-api
```
#### 2. Configure the Backend
```
cd backend
npm install
```
Create a .env file in the backend directory and configure the variables required by the application.
```
PORT=3001
NODE_ENV=development

JWT_SECRET=your_local_secret
JWT_EXPIRE=your_token_expiry

# PostgreSQL connection settings
# Use the variable names expected by config/db.js.

# Machine-learning service URL
FLASK_ML_SERVICE_URL=http://localhost:5000

# Configure email credentials only if email features are enabled.
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```
Create the PostgreSQL database and configure the connection using the settings expected by the backend. Do not commit actual credentials or secret values.

Start the backend:
```
npm run dev
```

#### 3. Configure the Machine-Learning Service
Open a separate terminal:
```
cd ml-service
python -m venv venv
```
Activate the virtual environment on Windows:
```
.\venv\Scripts\Activate.ps1
```
Install the Python dependencies:
```
pip install -r requirements.txt
```
Ensure that the required model weights, configuration files, and data assets are available at the paths expected by the implementation.

Start the Flask service:
```
python app2.py
```
The ML service is configured to run on port 5000 in the local development setup.

#### 4. Start the Frontend
Open another terminal:
```
cd frontend/makanfit
npm install
npm run dev
```

## Challenges and Limitations

1. Classification Accuracy
- Struggles with visually similar noodle and laksa variants 75.60% accuracy may limit real-world reliability for edge cases
- Improvement needed through larger dataset expansion and advanced architectures (ViT, hybrid CNN-ViT)

2. Segmentation Challenges
- Difficulty with overlapping or densely layered ingredients
- Performance sensitive to text prompt quality for Grounded SAM
- Redundant/overlapping detections in complex dishes


3. Calorie Estimation
- 2D pixel-area proportions don't account for food depth/layering
- Implicit assumption of uniform ingredient thickness
- Relies on LLM-generated weights which may be unrealistic
- Limited internal ingredient dictionary (261 entries)


4. Performance
- Segmentation inference on CPU (~80 seconds) too slow for real-time use
- No batch processing or caching mechanisms
- Single-image input constraint


5. Evaluation

- LLM variance used as proxy for consistency, not actual accuracy
- No expert nutritionist validation of calorie estimates
- Limited ground truth for performance benchmarking


## Future Improvements

- **Enhancement of Classification Models:** Expand dataset coverage with additional Malaysian dishes and datasets such as VireoFood-172. Explore advanced architectures, including Vision Transformers, to improve fine-grained food recognition.

- **Improvement of Segmentation Techniques:** Improve segmentation of overlapping food items and complex food structures through standardized prompts. Explore using Grounded SAM-generated masks to train a food-specific segmentation model.

- **Refinement of Calorie Estimation:** Incorporate depth estimation, RGB-D reconstruction, or dedicated portion estimation models to improve ingredient weight estimation and nutritional accuracy.

- **Strengthening Evaluation Methods:** Introduce expert validation from nutritionists or dietitians and establish more reliable ground-truth nutritional measurements for evaluating calorie estimation performance.

- **System Performance Optimization:** Reduce inference latency through model quantization, pruning, batching, and GPU acceleration where available, particularly for computationally intensive segmentation tasks.

- **Extension to Multimodal Inputs:** Support multiple images, and user-provided text descriptions to improve ingredient identification and estimation reliability when food components are partially obscured.


## License

ISC

## Support & Questions

For issues, questions, or suggestions, please create an issue on the GitHub repository.

## Project Status

🚀 **In Development** - Active FYP project

**Last Updated**: Oct 2026

---

**Built with ❤️ for better food awareness and nutrition tracking**
