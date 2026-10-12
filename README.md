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
FOODIE separates the application layer from the machine-learning layer to make the system easier to maintain and extend.

flowchart TD
    A[React + TypeScript Frontend]
    B[Node.js + Express Backend]
    C[Python + Flask ML Service]
    D[Food Classification CNN]
    E[Grounding DINO + SAM]
    F[Ingredient Matching + Nutrition Analysis]
    G[(PostgreSQL Database)]
    H[MyFCD + SG FoodID]

    A -->|HTTP requests| B
    B -->|ML service requests| C
    B <--> G
    C --> D
    C --> E
    E --> F
    F --> H
    C -->|Analysis results| B
    B -->|API responses| A

<img width="497" height="196" alt="level0" src="https://github.com/user-attachments/assets/cfee8678-5f24-4694-a9e7-4c93691a37a3" />
<img width="1798" height="383" alt="level1" src="https://github.com/user-attachments/assets/3f51e631-28bd-46f9-a0b9-7ec0afb336bc" />
<img width="1737" height="415" alt="level2a" src="https://github.com/user-attachments/assets/7b2a487d-4346-47fe-afd2-6186d04d8336" />
<img width="1860" height="374" alt="level2b" src="https://github.com/user-attachments/assets/d9d21902-2d2d-45f2-bf35-2437e3831f02" />

## Frontend

The React and TypeScript frontend provides the interface for uploading food images and displaying classification, segmentation, and nutritional analysis results.

## Backend API

The Node.js and Express backend acts as the application-facing API layer. It handles incoming requests, coordinates calls to the machine-learning service, and supports application functionality such as authentication, file uploads, and database operations.

## Machine-Learning Service

The Python and Flask service hosts the computer vision and nutritional analysis pipeline. Separating this service allows the machine-learning components to use Python-based libraries such as PyTorch and OpenCV without coupling them directly to the main application backend.

## Data Layer

PostgreSQL supports application data persistence. Nutritional information is retrieved from food composition data sources, including the Malaysian Food Composition Database (MyFCD) and Singapore FoodID.

## Machine-Learning Pipeline

1. Food Image Classification
A custom CNN was trained to recognise Malaysian dishes from food images.
Dataset: MalaysianFood120


## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens), Bcrypt for password hashing
- **File Upload**: Multer
- **Email**: Nodemailer
- **HTTP Client**: Axios

### Frontend
- **Framework**: React (with Vite based on package structure)
- **Type Safety**: TypeScript
- **Styling**: CSS/Tailwind CSS

### Machine Learning Service
- **Framework**: Flask
- **Deep Learning**: PyTorch
- **Vision Models**: 
  - Trained classification model
  - Segment Anything (SAM) for image segmentation
  - Grounding DINO for object detection
- **Image Processing**: OpenCV, Pillow

### Database & Data
- Nutritional Data: Malaysian Food Composition Database (MyFCD), Singapore Food Composition Database (SG FoodID)
- Model Storage: In-memory caching for segmentation results (demonstration setup)

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

## Dataset Details

### MalaysianFood120 Dataset
The project curated a comprehensive Malaysian food dataset:
- Total Images: 23,707
- Food Classes: 120 distinct Malaysian dishes
- Image Specifications: 640×640 pixels, JPG format
- Data Split: Training (68%), Validation (12%), Test (20%)

## Installation & Setup

### Backend Setup

#### Clone repository
```
git clone https://github.com/WaiYauYee/foodie-api.git
cd ml-service
```

#### Create Python virtual environment
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### Install dependencies
```
pip install -r requirements.txt
```

#### Start ML service (runs on port 5000)
```
python app2.py
```

### Frontend Setup

```
cd frontend
```

#### Install dependencies
```
npm install
```

#### Start development server (runs on http://localhost:5173)
```
npm run dev
```

### Server Setup

```
cd backend
```

#### Install dependencies
```
npm install
```

#### Start backend server
```
npm run dev  # Development with auto-reload
npm start   # Production mode
```

## API Endpoints

### Food Analysis
1. `POST /api/v1/vision/classify`
- Upload image for food classification
- Returns: predicted dish name, confidence score, top-5 predictions
2. `POST /api/v1/vision/segment`
- Performs ingredient segmentation on food image
- Returns: segmentation masks, ingredient labels, overlay visualization
- Stores results with unique segmentation ID for subsequent queries
3. `POST /api/v1/vision/segment/<seg_id>/calorie`
- Retrieves pre-computed nutritional data for a segmentation result
- Returns: per-ingredient calories, macronutrients (protein, carbs, fats, fiber)
- Provides calorie range estimates reflecting uncertainty

## Key ML Models & Algorithms

### Classification
- Pre-trained food classification model using PyTorch
- Identifies the type of food/dish from images
- Supports 1000+ food categories

### Segmentation
- **Grounding DINO**: Object detection for precise food item localization
- **Segment Anything (SAM)**: Instance segmentation to separate food components
- **Calorie Estimation**: Calculates portion size and calories based on segmented regions

### Ingredient Matching
- Embeddings-based ingredient matching for accurate nutrition lookup
- Retrieves nutritional data for identified ingredients

## Environment Variables

### Backend (.env)
```env
PORT                    # Server port (default: 3001)
JWT_SECRET             # Secret key for JWT signing
JWT_EXPIRE             # JWT token expiration time
EMAIL_USER             # Email for sending notifications
EMAIL_PASS             # Email app password
FLASK_ML_SERVICE_URL   # URL of the ML service
NODE_ENV               # Environment (development/production)
```

### ML Service (.env)
```env
FLASK_ENV      # Flask environment
FLASK_DEBUG    # Debug mode
PORT           # Flask port (default: 5000)
```

## Performance Considerations

- **Image Processing**: Large images are automatically resized to optimize inference speed
- **Caching**: Consider implementing caching for frequently analyzed meals
- **Database Indexing**: Ensure MongoDB indexes are properly configured for query performance
- **ML Model Optimization**: Models can be quantized for faster inference if needed

## Known Limitations & Future Improvements

### Current Limitations

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

## Contributing

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -m "Add feature description"`
3. Push to branch: `git push origin feature/feature-name`
4. Submit a pull request

## License

ISC

## Support & Questions

For issues, questions, or suggestions, please create an issue on the GitHub repository.

## Project Status

🚀 **In Development** - Active FYP project

**Last Updated**: April 2026

---

**Built with ❤️ for better food awareness and nutrition tracking**
