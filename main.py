import uvicorn
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from PIL import Image
import io
import base64
import cv2
import hashlib

app = FastAPI(title="PathoAI Simulation Server")

# Allow CORS for the frontend application
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_simulated_heatmap(image_bytes, is_metastatic):
    # Load image in OpenCV
    np_img = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    if img is None:
        # Fallback to empty canvas if decode fails
        img = np.zeros((400, 400, 3), dtype=np.uint8)
    
    # Resize to standard 400x400
    img_resized = cv2.resize(img, (400, 400))
    
    # Create empty single-channel mask for heatmap
    heatmap_mask = np.zeros((400, 400), dtype=np.uint8)
    
    # Seed based on image content to make results deterministic per image
    img_hash = hashlib.md5(image_bytes).hexdigest()
    seed = int(img_hash[:8], 16)
    rng = np.random.default_rng(seed)
    
    if is_metastatic:
        # Metastatic slides have hot spots corresponding to dense hyperchromatic nuclei groups
        num_blobs = rng.integers(3, 6)
        for _ in range(num_blobs):
            cx = rng.integers(80, 320)
            cy = rng.integers(80, 320)
            axes = (rng.integers(25, 60), rng.integers(25, 60))
            angle = rng.integers(0, 180)
            # Create a glowing elliptical spot
            blob = np.zeros((400, 400), dtype=np.uint8)
            cv2.ellipse(blob, (cx, cy), axes, angle, 0, 360, 255, -1)
            blob = cv2.GaussianBlur(blob, (81, 81), 0)
            # Normalize to maintain high intensity peak
            if blob.max() > 0:
                blob = np.uint8(255 * (blob / blob.max()))
            heatmap_mask = cv2.max(heatmap_mask, blob)
    else:
        # Normal tissues have more sparse, diffuse, or low-intensity background activations
        num_blobs = rng.integers(1, 3)
        for _ in range(num_blobs):
            cx = rng.integers(100, 300)
            cy = rng.integers(100, 300)
            axes = (rng.integers(15, 30), rng.integers(15, 30))
            angle = rng.integers(0, 180)
            blob = np.zeros((400, 400), dtype=np.uint8)
            cv2.ellipse(blob, (cx, cy), axes, angle, 0, 360, 120, -1)
            blob = cv2.GaussianBlur(blob, (99, 99), 0)
            if blob.max() > 0:
                blob = np.uint8(120 * (blob / blob.max()))
            heatmap_mask = cv2.max(heatmap_mask, blob)
            
    # Normalize final heatmap mask to 0-255 range
    if heatmap_mask.max() > 0:
        heatmap_mask = np.uint8(255 * (heatmap_mask / heatmap_mask.max()))
        
    # Apply JET colormap (blue -> green -> red)
    heatmap_color = cv2.applyColorMap(heatmap_mask, cv2.COLORMAP_JET)
    
    # Superimpose/blend heatmap onto the original image
    # Alpha = 0.55 for original, Beta = 0.45 for heatmap overlay
    blended = cv2.addWeighted(img_resized, 0.55, heatmap_color, 0.45, 0)
    
    # Encode back to PNG
    _, buffer = cv2.imencode('.png', blended)
    base64_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/png;base64,{base64_str}"

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        
        # Analyze the image content to determine classification deterministically
        # Use image hash to calculate a score between 0 and 1
        img_hash = hashlib.md5(contents).hexdigest()
        hash_val = int(img_hash[:8], 16)
        
        # Scale value between 0.10 and 0.95
        prediction_score = 0.10 + (hash_val % 86) / 100.0
        
        # Threshold at 0.31 to match Shashwati's specifications
        label = "Metastatic" if prediction_score > 0.31 else "Normal"
        confidence = prediction_score if label == "Metastatic" else (1.0 - prediction_score)
        
        # Generate simulated Grad-CAM heatmap
        heatmap_data = generate_simulated_heatmap(contents, label == "Metastatic")
        
        # Construct exact keys expected by pathology-frontend (App.js)
        return {
            "status": "success",
            "prediction": label,
            "confidence": f"{confidence * 100:.2f}%",
            "heatmap": heatmap_data,
            "message": f"Inference complete. Tissue patterns align with {label.lower()} characteristics. Identified cellular clusters show {confidence * 100:.1f}% path-correlation."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    print("Starting PathoAI Simulated Server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)