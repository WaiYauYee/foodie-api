# ml-service/classification.py
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import numpy as np
import cv2
from typing import Tuple, List, Dict
import os
import tempfile

from dotenv import load_dotenv
load_dotenv()  # load variables from ml-service/.env

# Classification model configuration
MODEL_PATH = os.getenv('MODEL_PATH', './models/best_model.pth')
NUM_CLASSES = int(os.getenv('NUM_CLASSES', '120'))
MODEL_TYPE = os.getenv('MODEL_TYPE', 'custom_cnn')
DEVICE = os.getenv('DEVICE', 'cuda' if torch.cuda.is_available() else 'cpu')

FOOD_CLASS_NAMES = [
    "AisKacang",
    "AngKuKueh",
    "ApamBalik",
    "Asamlaksa",
    "Bahulu",
    "Bakkukteh",
    "BananaLeafRice",
    "BananaSpongeCake",
    "Bazhang",
    "BeefRendang",
    "BingkaUbi",
    "BuburPedas",
    "Buburchacha",
    "Capati",
    "Cendol",
    "ChaiTowKuay",
    "CharKuehTiao",
    "CharSiu",
    "CheeCheongFun",
    "ChiliCrab",
    "Chweekueh",
    "ClayPotRice",
    "ClaypotLouShuFun",
    "CrispyFriedBeeHoon",
    "CucurUdang",
    "CurryLaksa",
    "CurryPuff",
    "Dodol",
    "Durian",
    "DurianCrepe",
    "FishHeadCurry",
    "Guava",
    "HainaneseChickenRice",
    "HalfBoiledEgg",
    "HokkienMee",
    "Huatkuih",
    "IkanBakar",
    "Kangkung",
    "KayaBall",
    "KayaPuff",
    "KayaToast",
    "Keklapis",
    "Ketupat",
    "KuehPaiTee",
    "KuihDadar",
    "KuihKapit",
    "KuihKeria",
    "KuihKosui",
    "KuihLapis",
    "KuihPuteriAyu",
    "KuihSeriMuka",
    "Langsat",
    "Lekor",
    "Lemang",
    "LepatPisang",
    "LorMee",
    "MaggiGoreng",
    "Mangosteen",
    "MeeGoreng",
    "MeeHoonKueh",
    "MeeHoonSoup",
    "MeeJawa",
    "MeeKolok",
    "MeeRebus",
    "MeeRojak",
    "MeeSiam",
    "MoonCake",
    "MuahChee",
    "Murtabak",
    "Murukku",
    "NasiGorengKampung",
    "NasiImpit",
    "NasiKerabu",
    "Nasikandar",
    "Nasilemak",
    "Nasipattaya",
    "OndehOndeh",
    "Otakotak",
    "OysterOmelette",
    "PanMee",
    "PineappleTart",
    "PisangGoreng",
    "Popiah",
    "PrawnMee",
    "Prawnsambal",
    "PulutInti",
    "Puri",
    "PutuMayam",
    "PutuPiring",
    "Rambutan",
    "Rojak",
    "RotiCanai",
    "RotiJala",
    "RotiJohn",
    "RotiNaan",
    "RotiTissue",
    "SaltedEggSquid",
    "SambalPetai",
    "SambalUdang",
    "Satay",
    "Sataycelup",
    "SeriMuka",
    "SiewYoke",
    "SotoAyam",
    "StinkyTofu",
    "TandooriChicken",
    "TangYuan",
    "TauFooFah",
    "TauhuSumbat",
    "Thosai",
    "TomYumSoup",
    "WaTanHo",
    "Wajik",
    "WanTanMee",
    "Wonton",
    "YamCake",
    "YeeMeeSoup",
    "YongTauFu",
    "Youtiao",
    "Yusheng"
]

# ============================================
# YOUR EXACT MODEL ARCHITECTURE FROM COLAB
# ============================================

class ImprovedFoodCNN(nn.Module):
    """
    Exact replica of your trained model from Google Colab.
    Trained on 120 food classes with ImageNet normalization.
    """
    def __init__(self, num_classes=120):
        super(ImprovedFoodCNN, self).__init__()

        # Initial conv block
        self.conv1 = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 32, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )

        # Block 2
        self.conv2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )

        # Block 3
        self.conv3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )

        # Block 4
        self.conv4 = nn.Sequential(
            nn.Conv2d(128, 256, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )

        # Block 5 - Final conv block
        self.conv5 = nn.Sequential(
            nn.Conv2d(256, 512, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, kernel_size=3, padding=1, bias=False),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1)),
        )

        # Classifier head
        self.classifier = nn.Sequential(
            nn.Linear(512, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        x = self.conv4(x)
        x = self.conv5(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x


# ============================================
# MODEL LOADING & INITIALIZATION
# ============================================

def load_pytorch_model(
    model_path: str,
    num_classes: int = 120,
    model_type: str = "custom_cnn",
    device: str = None
) -> Tuple[nn.Module, str]:
    """
    Load your trained PyTorch model.
    
    Args:
        model_path: Path to best_model.pth
        num_classes: Number of food categories (120 for your training)
        model_type: "custom_cnn" (your architecture)
        device: "cpu" or "cuda" (auto-detect if None)
    
    Returns:
        model: Loaded PyTorch model in evaluation mode
        device: Device being used
    """
    
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
    
    print(f"Loading ImprovedFoodCNN from {model_path} on device: {device}")
    
    # Check if file exists
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}")
    
    # Instantiate your exact model architecture
    if model_type == "custom_cnn":
        model = ImprovedFoodCNN(num_classes=num_classes)
    else:
        raise ValueError(f"Unknown model_type: {model_type}. Expected 'custom_cnn'")
    
    # Load the saved weights
    try:
        checkpoint = torch.load(model_path, map_location=device)
        
        # Handle different checkpoint formats:
        # Option 1: Direct state dict (how you saved it: torch.save(model.state_dict(), path))
        if isinstance(checkpoint, dict) and 'state_dict' not in checkpoint:
            model.load_state_dict(checkpoint)
            print("✓ Loaded as direct state_dict")
        
        # Option 2: Dict with 'state_dict' key
        elif isinstance(checkpoint, dict) and 'state_dict' in checkpoint:
            model.load_state_dict(checkpoint['state_dict'])
            print("✓ Loaded from state_dict key")
        
        # Option 3: Full model saved with torch.save(model, path)
        elif isinstance(checkpoint, nn.Module):
            model = checkpoint
            print("✓ Loaded as full model")
        
        else:
            raise ValueError(f"Unknown checkpoint format: {type(checkpoint)}")
    
    except Exception as e:
        print(f"❌ Error loading checkpoint: {e}")
        raise
    
    # Move to device and set to evaluation mode
    model.to(device)
    model.eval()
    
    print(f"✓ Model loaded successfully!")
    print(f"  Architecture: ImprovedFoodCNN")
    print(f"  Classes: {num_classes}")
    print(f"  Device: {device}")
    print(f"  Parameters: {sum(p.numel() for p in model.parameters()):,}")
    
    return model, device


# ============================================
# LOAD MODELS AT STARTUP
# ============================================
print("=" * 60)
print("MakanFit Classification Service")
print("=" * 60)

classification_model = None
classification_device = DEVICE

try:
    classification_model, classification_device = load_pytorch_model(
        model_path=MODEL_PATH,
        num_classes=NUM_CLASSES,
        model_type=MODEL_TYPE,
        device=DEVICE
    )
    print("✓ Classification model loaded successfully!")
except Exception as e:
    print(f"❌ Failed to load classification model: {e}")
    classification_model = None


# ============================================
# IMAGE PREPROCESSING (Matches your training)
# ============================================

def get_transforms(image_size: int = 224) -> transforms.Compose:
    """
    Get image preprocessing transforms.
    MUST MATCH your training preprocessing exactly!
    
    Your training used:
    - Resize to 224x224
    - ImageNet normalization (mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    """
    return transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        # IMPORTANT: Must match training normalization
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        ),
    ])


# ============================================
# FOOD CLASSIFICATION
# ============================================

def classify_food_image(
    image_path: str,
    model: nn.Module,
    device: str,
    class_names: List[str],
    top_k: int = 5
) -> Dict:
    """
    Classify food in an image using your trained model.
    
    Args:
        image_path: Path to food image
        model: Loaded ImprovedFoodCNN model
        device: Device (cpu/cuda)
        class_names: List of 120 food class names (must be in training order!)
        top_k: Return top K predictions
    
    Returns:
        dict with predictions and confidence scores
    """
    
    if len(class_names) != 120:
        print(f"⚠️  Warning: Expected 120 classes, got {len(class_names)}")
    
    # Load and preprocess image
    try:
        image = Image.open(image_path).convert('RGB')
    except Exception as e:
        raise ValueError(f"Failed to load image: {e}")
    
    transform = get_transforms()
    image_tensor = transform(image).unsqueeze(0).to(device)
    
    # Inference
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        confidences, class_indices = torch.topk(probabilities, min(top_k, len(class_names)))
    
    # Prepare results
    predictions = []
    for i, (confidence, class_idx) in enumerate(zip(
        confidences[0].cpu().numpy(),
        class_indices[0].cpu().numpy()
    )):
        class_idx = int(class_idx)
        predictions.append({
            'rank': i + 1,
            'class_id': class_idx,
            'food_name': class_names[class_idx] if class_idx < len(class_names) else f"Unknown_Class_{class_idx}",
            'confidence': float(confidence),
            'percentage': float(confidence) * 100
        })
    
    return {
        'primary_prediction': predictions[0],
        'all_predictions': predictions,
        'image_path': image_path
    }


def classify_image_service(img: Image.Image, top_k: int = 5) -> Dict:
    """
    Service layer for classification. Wraps the model logic and returns structured results.
    
    Args:
        img: PIL.Image object (RGB)
        top_k: Number of top predictions
    
    Returns:
        dict: predictions in structured format
    """
    # Save temporarily (because classify_food_image expects a path)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        temp_path = tmp.name
        img.save(temp_path)

    try:
        predictions = classify_food_image(
            image_path=temp_path,
            model=classification_model,
            device=classification_device,
            class_names=FOOD_CLASS_NAMES,
            top_k=top_k
        )

        # Format response similar to segmentation service
        response = {
            'success': True,
            'primary_prediction': {
                'food_name': predictions['primary_prediction']['food_name'],
                'confidence': round(predictions['primary_prediction']['confidence'], 4),
                'percentage': round(predictions['primary_prediction']['percentage'], 2),
                'class_id': predictions['primary_prediction']['class_id']
            },
            'all_predictions': [
                {
                    'rank': p['rank'],
                    'food_name': p['food_name'],
                    'confidence': round(p['confidence'], 4),
                    'percentage': round(p['percentage'], 2),
                    'class_id': p['class_id']
                } for p in predictions['all_predictions']
            ],
        }

        return response

    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)