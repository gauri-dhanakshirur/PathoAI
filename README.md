# PathoAI — AI-Powered Histopathology Diagnostic Workstation

PathoAI is a modern, high-performance web workstation designed to analyze histopathological tissue slides. Powered by a deep learning CNN architecture (DenseNet), the system identifies and classifies cellular structures into **Metastatic** or **Normal** tissues and generates real-time explainable AI (XAI) overlays using **Grad-CAM (Gradient-weighted Class Activation Mapping)** to highlight regions of path-correlation.

---

## 🏗️ System Architecture

The project consists of three core components:
1. **Interactive Web Workspace (`pathology-frontend`):** A premium React-based medical dashboard utilizing interactive widgets, spatial viewports, real-time diagnostic transcripts, and custom Grad-CAM overlays.
2. **Local Simulation Server (`main.py`):** A lightweight FastAPI server designed for rapid local development and testing. It features deterministic image hashing to generate simulation analytics and morphological overlays without requiring active GPU/TensorFlow resources.
3. **Production DenseNet Backend (`real_densenet_backend.py`):** The actual AI pipeline running a TensorFlow DenseNet model (`best_densenet_model.h5`) designed for 96x96 px slide scans with threshold validation at `0.31` as specified in the clinical guidelines.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
* **Node.js** (v18.0 or higher)
* **Python** (v3.9 or higher)
* **pip** (Python package installer)

---

### 📂 Step 1: Clone the Repository
```bash
git clone https://github.com/gauri-dhanakshirur/PathoAI.git
cd PathoAI
```

---

### 🐍 Step 2: Set Up and Start the Python Backend

You have two options depending on your environment. For local testing, the **Simulation Backend** is recommended as it does not require deep learning dependencies (like TensorFlow).

#### Option A: Simulation Backend (Recommended for Local Dev)
1. Install standard dependencies:
   ```bash
   pip install fastapi uvicorn numpy opencv-python pillow
   ```
2. Launch the server:
   ```bash
   python main.py
   ```
   *The server will boot up instantly on **`http://localhost:8000`**.*

#### Option B: Production DenseNet Backend (Requires TensorFlow)
1. Install deep learning and server dependencies:
   ```bash
   pip install fastapi uvicorn tensorflow pillow opencv-python-headless nest_asyncio python-multipart
   ```
2. Ensure `best_densenet_model.h5` is in your project root.
3. Since the production backend script was optimized for Google Colab environment variables, edit the `MODEL_PATH` on line 33 of `real_densenet_backend.py` if needed:
   ```python
   MODEL_PATH = './best_densenet_model.h5'
   ```
4. Run the production backend server:
   ```bash
   python real_densenet_backend.py
   ```

---

### 💻 Step 3: Set Up and Start the React Frontend

1. Navigate to the frontend directory:
   ```bash
   cd pathology-frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Boot up the React web application:
   ```bash
   npm start
   ```
   *This opens the web browser automatically to **`http://localhost:3000`**.*

---

## 🔬 Running Diagnostic Analysis

1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. In the top-right corner, enter your backend endpoint: **`http://localhost:8000`**.
3. Under **Sample Viewport**, click **Load Histology Patch** and select any tumor or tissue image (.png or .jpg).
4. Click **Initialize Diagnostic Run**.
5. View the output:
   * **Inference Conclusion:** Metastatic vs. Normal.
   * **Confidence Rating:** Scaled correlation indicator.
   * **Grad-CAM Overlay:** Toggle the **View Grad-CAM Map** button to see the cell activation highlight layers.
