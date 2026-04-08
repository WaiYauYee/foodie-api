# ============================================================
# Grounded SAM - Local Python Script (converted from Colab)
# ============================================================

import subprocess
subprocess.run(["pip", "install", "--upgrade", "-q",
                "git+https://github.com/huggingface/transformers"], check=True)

# ============================================================
# Imports
# ============================================================
import os
import time
import random
import threading
import tracemalloc
from dataclasses import dataclass
from typing import Any, List, Dict, Optional, Union, Tuple

import cv2
import torch
import requests
import numpy as np
from PIL import Image
import plotly.express as px
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import plotly.graph_objects as go
from transformers import AutoModelForMaskGeneration, AutoProcessor, pipeline

# ============================================================
# Data Classes
# ============================================================

@dataclass
class BoundingBox:
    xmin: int
    ymin: int
    xmax: int
    ymax: int

    @property
    def xyxy(self) -> List[float]:
        return [self.xmin, self.ymin, self.xmax, self.ymax]

@dataclass
class DetectionResult:
    score: float
    label: str
    box: BoundingBox
    mask: Optional[np.array] = None

    @classmethod
    def from_dict(cls, detection_dict: Dict) -> 'DetectionResult':
        return cls(score=detection_dict['score'],
                   label=detection_dict['label'],
                   box=BoundingBox(xmin=detection_dict['box']['xmin'],
                                   ymin=detection_dict['box']['ymin'],
                                   xmax=detection_dict['box']['xmax'],
                                   ymax=detection_dict['box']['ymax']))


# ============================================================
# Load models ONCE before measurement loop
# ============================================================
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
device_id = 0 if torch.cuda.is_available() else -1

# Load Grounding DINO once
detector_id = "IDEA-Research/grounding-dino-tiny"
object_detector = pipeline(
    model=detector_id,
    task="zero-shot-object-detection",
    device=device_id
)

# Load SAM once
segmenter_id = "facebook/sam-vit-base"
segmentator = AutoModelForMaskGeneration.from_pretrained(segmenter_id).to(device)
sam_processor = AutoProcessor.from_pretrained(segmenter_id)
print("Models loaded.")

"""## Plot Utils

Below, some utility functions are defined as we'll draw the detection results of Grounding DINO on top of the image.
"""

def annotate(image: Union[Image.Image, np.ndarray], detection_results: List[DetectionResult]) -> np.ndarray:
    # Convert PIL Image to OpenCV format
    image_cv2 = np.array(image) if isinstance(image, Image.Image) else image
    image_cv2 = cv2.cvtColor(image_cv2, cv2.COLOR_RGB2BGR)

    # Iterate over detections and add bounding boxes and masks
    for detection in detection_results:
        label = detection.label
        score = detection.score
        box = detection.box
        mask = detection.mask

        # Sample a random color for each detection
        color = np.random.randint(0, 256, size=3)

        # Draw bounding box
        cv2.rectangle(image_cv2, (box.xmin, box.ymin), (box.xmax, box.ymax), color.tolist(), 2)
        cv2.putText(image_cv2, f'{label}: {score:.2f}', (box.xmin, box.ymin - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color.tolist(), 2)

        # If mask is available, apply it
        if mask is not None:
            # Convert mask to uint8
            mask_uint8 = (mask * 255).astype(np.uint8)
            contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            cv2.drawContours(image_cv2, contours, -1, color.tolist(), 2)

    return cv2.cvtColor(image_cv2, cv2.COLOR_BGR2RGB)

def plot_detections(
    image: Union[Image.Image, np.ndarray],
    detections: List[DetectionResult],
    save_name: Optional[str] = None
) -> None:
    annotated_image = annotate(image, detections)
    plt.imshow(annotated_image)
    plt.axis('off')
    if save_name:
        plt.savefig(save_name, bbox_inches='tight')
    # plt.show()

def random_named_css_colors(num_colors: int) -> List[str]:
    """
    Returns a list of randomly selected named CSS colors.

    Args:
    - num_colors (int): Number of random colors to generate.

    Returns:
    - list: List of randomly selected named CSS colors.
    """
    # List of named CSS colors
    named_css_colors = [
        'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige', 'bisque', 'black', 'blanchedalmond',
        'blue', 'blueviolet', 'brown', 'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue',
        'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan', 'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey',
        'darkkhaki', 'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred', 'darksalmon', 'darkseagreen',
        'darkslateblue', 'darkslategray', 'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue',
        'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite',
        'gold', 'goldenrod', 'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred', 'indigo', 'ivory',
        'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow',
        'lightgray', 'lightgreen', 'lightgrey', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
        'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen', 'linen', 'magenta', 'maroon', 'mediumaquamarine',
        'mediumblue', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise',
        'mediumvioletred', 'midnightblue', 'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive',
        'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod', 'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip',
        'peachpuff', 'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red', 'rosybrown', 'royalblue', 'saddlebrown',
        'salmon', 'sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray', 'slategrey',
        'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white',
        'whitesmoke', 'yellow', 'yellowgreen'
    ]

    # Sample random named CSS colors
    return random.sample(named_css_colors, min(num_colors, len(named_css_colors)))

def plot_detections_plotly(
    image: np.ndarray,
    detections: List[DetectionResult],
    class_colors: Optional[Dict[str, str]] = None
) -> None:
    # If class_colors is not provided, generate random colors for each class
    if class_colors is None:
        num_detections = len(detections)
        colors = random_named_css_colors(num_detections)
        class_colors = {}
        for i in range(num_detections):
            class_colors[i] = colors[i]


    fig = px.imshow(image)

    # Add bounding boxes
    shapes = []
    annotations = []
    for idx, detection in enumerate(detections):
        label = detection.label
        box = detection.box
        score = detection.score
        mask = detection.mask

        polygon = mask_to_polygon(mask)

        fig.add_trace(go.Scatter(
            x=[point[0] for point in polygon] + [polygon[0][0]],
            y=[point[1] for point in polygon] + [polygon[0][1]],
            mode='lines',
            line=dict(color=class_colors[idx], width=2),
            fill='toself',
            name=f"{label}: {score:.2f}"
        ))

        xmin, ymin, xmax, ymax = box.xyxy
        shape = [
            dict(
                type="rect",
                xref="x", yref="y",
                x0=xmin, y0=ymin,
                x1=xmax, y1=ymax,
                line=dict(color=class_colors[idx])
            )
        ]
        annotation = [
            dict(
                x=(xmin+xmax) // 2, y=(ymin+ymax) // 2,
                xref="x", yref="y",
                text=f"{label}: {score:.2f}",
            )
        ]

        shapes.append(shape)
        annotations.append(annotation)

    # Update layout
    button_shapes = [dict(label="None",method="relayout",args=["shapes", []])]
    button_shapes = button_shapes + [
        dict(label=f"Detection {idx+1}",method="relayout",args=["shapes", shape]) for idx, shape in enumerate(shapes)
    ]
    button_shapes = button_shapes + [dict(label="All", method="relayout", args=["shapes", sum(shapes, [])])]

    fig.update_layout(
        xaxis=dict(visible=False),
        yaxis=dict(visible=False),
        # margin=dict(l=0, r=0, t=0, b=0),
        showlegend=True,
        updatemenus=[
            dict(
                type="buttons",
                direction="up",
                buttons=button_shapes
            )
        ],
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1
        )
    )

    # Show plot
    # fig.show()

"""## Utils"""

def mask_to_polygon(mask: np.ndarray) -> List[List[int]]:
    # Find contours in the binary mask
    contours, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Find the contour with the largest area
    largest_contour = max(contours, key=cv2.contourArea)

    # Extract the vertices of the contour
    polygon = largest_contour.reshape(-1, 2).tolist()

    return polygon

def polygon_to_mask(polygon: List[Tuple[int, int]], image_shape: Tuple[int, int]) -> np.ndarray:
    """
    Convert a polygon to a segmentation mask.

    Args:
    - polygon (list): List of (x, y) coordinates representing the vertices of the polygon.
    - image_shape (tuple): Shape of the image (height, width) for the mask.

    Returns:
    - np.ndarray: Segmentation mask with the polygon filled.
    """
    # Create an empty mask
    mask = np.zeros(image_shape, dtype=np.uint8)

    # Convert polygon to an array of points
    pts = np.array(polygon, dtype=np.int32)

    # Fill the polygon with white color (255)
    cv2.fillPoly(mask, [pts], color=(255,))

    return mask

def load_image(image_str: str) -> Image.Image:
    if image_str.startswith("http"):
        image = Image.open(requests.get(image_str, stream=True).raw).convert("RGB")
    else:
        image = Image.open(image_str).convert("RGB")

    return image

def get_boxes(results: DetectionResult) -> List[List[List[float]]]:
    boxes = []
    for result in results:
        xyxy = result.box.xyxy
        boxes.append(xyxy)

    return [boxes]

def refine_masks(masks: torch.BoolTensor, polygon_refinement: bool = False) -> List[np.ndarray]:
    masks = masks.cpu().float()
    masks = masks.permute(0, 2, 3, 1)
    masks = masks.mean(axis=-1)
    masks = (masks > 0).int()
    masks = masks.numpy().astype(np.uint8)
    masks = list(masks)

    if polygon_refinement:
        for idx, mask in enumerate(masks):
            shape = mask.shape
            polygon = mask_to_polygon(mask)
            mask = polygon_to_mask(polygon, shape)
            masks[idx] = mask

    return masks

"""## Grounded Segment Anything (SAM)

Now it's time to define the Grounded SAM approach!

The approach is very simple:
1. use Grounding DINO to detect a given set of texts in the image. The output is a set of bounding boxes.
2. prompt Segment Anything (SAM) with the bounding boxes, for which the model will output segmentation masks.
"""

# Add NMS function after detect()
def apply_nms(detections: List[DetectionResult],
              iou_threshold: float = 0.5) -> List[DetectionResult]:
    """Remove overlapping detections using Non-Maximum Suppression."""
    if not detections:
        return detections

    boxes = np.array([d.box.xyxy for d in detections])
    scores = np.array([d.score for d in detections])

    x1, y1, x2, y2 = boxes[:,0], boxes[:,1], boxes[:,2], boxes[:,3]
    areas = (x2 - x1) * (y2 - y1)
    order = scores.argsort()[::-1]

    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(i)

        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])

        w = np.maximum(0, xx2 - xx1)
        h = np.maximum(0, yy2 - yy1)
        inter = w * h
        iou = inter / (areas[i] + areas[order[1:]] - inter)

        order = order[1:][iou < iou_threshold]

    return [detections[i] for i in keep]

def detect(image, labels, threshold, object_detector):
    labels = [label if label.endswith(".") else label+"." for label in labels]

    results = object_detector(
        image,
        candidate_labels=labels,
        threshold=threshold
    )

    return [DetectionResult.from_dict(result) for result in results]

def segment(image, detection_results, polygon_refinement,
            segmentator, processor):

    if not detection_results:
        return detection_results

    boxes = get_boxes(detection_results)

    inputs = processor(
        images=image,
        input_boxes=boxes,
        return_tensors="pt"
    ).to(device)

    with torch.no_grad():
        outputs = segmentator(**inputs)

    masks = processor.post_process_masks(
        masks=outputs.pred_masks,
        original_sizes=inputs.original_sizes,
        reshaped_input_sizes=inputs.reshaped_input_sizes
    )[0]

    masks = refine_masks(masks, polygon_refinement)

    for detection_result, mask in zip(detection_results, masks):
        detection_result.mask = mask

    return detection_results

def grounded_segmentation(
    image,
    labels,
    threshold=0.3,
    polygon_refinement=False
):
    if isinstance(image, str):
        image = load_image(image)

    detections = detect(image, labels, threshold, object_detector)
    detections = apply_nms(detections, iou_threshold=0.3)

    detections = segment(
        image,
        detections,
        polygon_refinement,
        segmentator,
        sam_processor
    )

    return np.array(image), detections

"""ensure label got to be seen"""

def plot_food_segmentation(image, detections, alpha=0.55, save_name=None):
    """
    Visualize food segmentation with vivid colored mask overlays and food labels.
    """
    image_np = np.array(image) if isinstance(image, Image.Image) else image.copy()

    PALETTE = [
        ( 80, 200,  80),  # green
        ( 80, 120, 255),  # blue
        (255, 200,  50),  # yellow
        (255, 100, 220),  # pink
        (255,  80,  80),  # red
        ( 80, 220, 220),  # cyan
        (200, 100, 255),  # purple
        (100, 255, 200),  # mint
        (255,  60, 160),  # hot pink/magenta  
        ( 60, 255,  60),  # bright lime      
    ]
    # Map unique label -> color
    unique_labels = list({d.label.replace(".", "").strip() for d in detections})
    label_to_color = {label: PALETTE[i % len(PALETTE)] for i, label in enumerate(unique_labels)}

    # Start with overlay canvas
    blended = image_np.copy().astype(np.float32)

    for detection in detections:
        mask = detection.mask
        if mask is None:
            continue

        label = detection.label.replace(".", "").strip()
        color = label_to_color[label]

        mask_bool = mask.astype(bool)
        for c in range(3):
            blended[:, :, c] = np.where(
                mask_bool,
                blended[:, :, c] * (1 - alpha) + color[c] * alpha,
                blended[:, :, c]
            )

    blended = np.clip(blended, 0, 255).astype(np.uint8)

    # Track occupied label regions to avoid overlap
    occupied_boxes = []

    def is_overlapping(box, occupied):
        """Check if box overlaps with any occupied box."""
        x1, y1, x2, y2 = box
        for ox1, oy1, ox2, oy2 in occupied:
            if not (x2 < ox1 or x1 > ox2 or y2 < oy1 or y1 > oy2):
                return True
        return False

    def find_free_position(cx, cy, tw, th, occupied, img_h, img_w,
                           pad_x=5, pad_y=8):
        """Try multiple positions around centroid until non-overlapping."""
        offsets = [
            (0, 0),           # center
            (0, -30),         # above
            (0, 30),          # below
            (-40, 0),         # left
            (40, 0),          # right
            (0, -60),         # further above
            (0, 60),          # further below
            (-40, -30),       # upper left
            (40, -30),        # upper right
            (-40, 30),        # lower left
            (40, 30),         # lower right
        ]
        for dx, dy in offsets:
            nx, ny = cx + dx, cy + dy
            x1 = max(nx - tw // 2 - pad_x, 0)
            y1 = max(ny - th // 2 - pad_y, 0)
            x2 = min(x1 + tw + pad_x * 2, img_w)
            y2 = min(y1 + th + pad_y * 2, img_h)
            box = (x1, y1, x2, y2)
            if not is_overlapping(box, occupied):
                return box
        # Fallback: return original position even if overlapping
        x1 = max(cx - tw // 2 - pad_x, 0)
        y1 = max(cy - th // 2 - pad_y, 0)
        x2 = min(x1 + tw + pad_x * 2, img_w)
        y2 = min(y1 + th + pad_y * 2, img_h)
        return (x1, y1, x2, y2)

    img_h, img_w = blended.shape[:2]

    drawn_labels = set()

    # Draw contours + labels (only once per label)
    for detection in detections:
        mask = detection.mask
        if mask is None:
            continue

        label = detection.label.replace(".", "").strip()
        color = label_to_color[label]
        score = detection.score

        # Contour border
        mask_uint8 = (mask.astype(bool) * 255).astype(np.uint8)
        contours, _ = cv2.findContours(
            mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        cv2.drawContours(blended, contours, -1, color, 3)

        # Draw label only once
        if label not in drawn_labels:
            M = cv2.moments(mask_uint8)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"])
                cy = int(M["m01"] / M["m00"])
            else:
                cx = (detection.box.xmin + detection.box.xmax) // 2
                cy = (detection.box.ymin + detection.box.ymax) // 2

            text = f"{label} ({score:.2f})"
            font = cv2.FONT_HERSHEY_DUPLEX
            (tw, th), _ = cv2.getTextSize(text, font, 0.65, 1)
            x1, y1, x2, y2 = find_free_position(cx, cy, tw, th, occupied_boxes, img_h, img_w)
            occupied_boxes.append((x1, y1, x2, y2))

            bg_color = tuple(max(c - 80, 0) for c in color)
            cv2.rectangle(blended, (x1, y1), (x2, y2), bg_color, -1)
            cv2.rectangle(blended, (x1, y1), (x2, y2), color, 1)
            cv2.putText(blended, text, (x1 + 5, y2 - 5), font, 0.65, (255, 255, 255), 1, cv2.LINE_AA)

            drawn_labels.add(label)

    plt.figure(figsize=(12, 8))
    plt.imshow(blended)
    plt.axis("off")
    # plt.title(
    #     "Food Segmentation with Labels",
    #     fontsize=14, fontweight="bold", pad=10
    # )
    plt.tight_layout()
    if save_name:
        plt.savefig(save_name, bbox_inches="tight", dpi=150)
    plt.close()
    # plt.show()
    print(
        f"Detected {len(detections)} food item(s): "
        f"{[d.label.replace('.','').strip() for d in detections]}"
    )
    return Image.fromarray(blended)

# ============================================================
# MEASUREMENT — Inference Time & Memory Footprint
# ============================================================

# UPDATE this path to where your 5 images are stored locally
base_path = r"D:\HERIOT WATT UNIVERSITY MALAYSIA\Y3 F20PA\MAKANFIT-V2\ml-service\assets\images"

sample_images = [
    (os.path.join(base_path, "AisKacang (69).jpg"),  ['Shaved Ice', 'Red Beans', 'Sweet Corn Kernels', 'Grass Jelly (Cincau)', 'Attap Chee (Palm Seeds in syrup)', 'Green Jelly Spheres', 'Red/Pink Syrup (e.g., Rose Syrup)', 'Sweetened Condensed Milk', 'Gula Melaka Syrup']),
    # (os.path.join(base_path, "RotiCanai (2).jpg"),     ['Roti Canai', 'Red Curry', 'Sambal', 'Dhal Curry', 'Teh Tarik']),
    # (os.path.join(base_path, "Nasilemak (13).jpg"),    ['Coconut Rice', 'Chicken Rendang', 'Sambal', 'Fried Peanuts', 'Fried Anchovies', 'Hard-boiled Egg', 'Cucumber Slices']),
    # (os.path.join(base_path, "WanTanMee (24).jpg"),    ['Egg Noodles', 'Wontons', 'Char Siu (BBQ Pork)', 'Green Leafy Vegetable']),
    # (os.path.join(base_path, "Yusheng (216).jpg"),     ['Shredded Carrots', 'Shredded Cucumber', 'Pomelo Sacs', 'Pickled Ginger', 'Vermicelli Noodles', 'Seasoned Seaweed Salad', 'Fried Crisps', 'Red Pepper Strips', 'Egg Omelet Strips', 'Jellyfish Salad']),
]

import psutil
import gc

process = psutil.Process(os.getpid())

# measure inference time
# times = []
# peaks = []

# for image_path, labels in sample_images:
#     print(f"\nProcessing: {os.path.basename(image_path)}...")
#     image = load_image(image_path)
#     image_name = os.path.splitext(os.path.basename(image_path))[0]

#     gc.collect()
#     mem_before = process.memory_info().rss / 1024 / 1024  # ← measure before
#     start = time.time()

#     try:
#         detections = detect(image, labels, threshold=0.3, object_detector=object_detector)
#         detections = apply_nms(detections, iou_threshold=0.3)

#         if not detections:
#             print(f"{os.path.basename(image_path)}: No detections, skipping.")
#             continue

#         print("Running segmentation...")
#         detections = segment(image, detections, polygon_refinement=True,
#                              segmentator=segmentator, processor=sam_processor)

#         end = time.time()
#         mem_after = process.memory_info().rss / 1024 / 1024   # ← measure after
#         mem_used = mem_after - mem_before                      # ← difference = inference memory

#         times.append(end - start)
#         peaks.append(mem_used)
#         print(f"{os.path.basename(image_path)}: {times[-1]:.2f}s | {peaks[-1]:.2f} MB")

#         save_path = os.path.join(base_path, f"{image_name}_segmented.png")
#         plot_food_segmentation(np.array(image), detections, alpha=0.45, save_name=save_path)
#         print(f"Saved: {save_path}")

#     except Exception as e:
#         print(f"{os.path.basename(image_path)}: ERROR — {e}")
#         import traceback
#         traceback.print_exc()
#         continue

# print(f"\nAvg inference time : {np.mean(times):.2f} ± {np.std(times):.2f} s")
# print(f"Avg peak memory    : {np.mean(peaks):.2f} ± {np.std(peaks):.2f} MB")


# measure both
# import threading
# import time
# import psutil
# import gc

# process = psutil.Process(os.getpid())

# times = []
# peaks = []

# for image_path, labels in sample_images:
#     print(f"\nProcessing: {os.path.basename(image_path)}...")
#     image = load_image(image_path)
#     image_name = os.path.splitext(os.path.basename(image_path))[0]

#     gc.collect()
#     mem_before = process.memory_info().rss / 1024 / 1024  # memory before

#     # -----------------------------
#     # Peak memory monitor
#     # -----------------------------
#     peak_memory = [mem_before]
#     running = [True]

#     def monitor_memory():
#         while running[0]:
#             mem = process.memory_info().rss / 1024 / 1024
#             peak_memory[0] = max(peak_memory[0], mem)
#             time.sleep(0.01)  # tiny sleep to reduce CPU usage

#     t = threading.Thread(target=monitor_memory)
#     t.start()
#     # -----------------------------

#     # -----------------------------
#     # Measure inference time only
#     # -----------------------------
#     start = time.time()
#     try:
#         detections = detect(image, labels, threshold=0.3, object_detector=object_detector)
#         detections = apply_nms(detections, iou_threshold=0.3)

#         if detections:
#             detections = segment(image, detections, polygon_refinement=True,
#                                  segmentator=segmentator, processor=sam_processor)

#     finally:
#         end = time.time()
#         running[0] = False
#         t.join()
#     # -----------------------------

#     # Record inference time
#     times.append(end - start)

#     # Peak memory during inference
#     mem_used_peak = peak_memory[0] - mem_before
#     peaks.append(mem_used_peak)

#     print(f"{os.path.basename(image_path)}: {times[-1]:.2f}s | peak memory: {mem_used_peak:.2f} MB")

#     # Save visualization
#     try:
#         save_path = os.path.join(base_path, f"{image_name}_segmented.png")
#         plot_food_segmentation(np.array(image), detections, alpha=0.45, save_name=save_path)
#         print(f"Saved: {save_path}")
#     except Exception as e:
#         print(f"{os.path.basename(image_path)}: ERROR while plotting — {e}")

# print(f"\nAvg inference time : {np.mean(times):.2f} ± {np.std(times):.2f} s")
# print(f"Avg peak memory    : {np.mean(peaks):.2f} ± {np.std(peaks):.2f} MB")

# ============================================================
# INFERENCE — Single Image Visualization
# ============================================================

# image_path = os.path.join(base_path, "Yusheng (216).jpg")
# labels = ['Shredded Carrots', 'Shredded Cucumber', 'Pomelo Sacs', 'Pickled Ginger',
#           'Vermicelli Noodles', 'Seasoned Seaweed (Wakame) Salad', 'Fried Crisps',
#           'Red Pepper Strips', 'Egg Omelet Strips', 'Jellyfish Salad']

# image_array, detections = grounded_segmentation(
#     image=image_path,
#     labels=labels,
#     threshold=0.3,
#     polygon_refinement=True    
# )









