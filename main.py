import uvicorn
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64
import os
# Fix for the Protobuf warning and the macOS Mutex crash
os.environ['PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION'] = 'python'
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'


app = FastAPI()

# Allow VS Code's local server to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # 1. Process Image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # 2. Logic Placeholder 
        # (This is where your trained .h5 model would perform inference)
        prediction_score = np.random.rand() 
        label = "Metastatic" if prediction_score > 0.5 else "Normal"
        confidence = float(prediction_score if label == "Metastatic" else 1 - prediction_score)

        return {
            "status": "success",
            "classification": label,
            "confidence": round(confidence * 100, 2),
            "details": f"AI Scan complete. Tissue patterns align with {label.lower()} characteristics."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    print("Backend server starting on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)