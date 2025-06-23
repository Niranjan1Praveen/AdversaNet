# Adversarial Attack Testing Web App

## Team Members

- Niranjan Praveen
- Abhishek Chaubey

## Problem Statement

**Adversarial Robustness Testing for Machine Learning Models**: Develop a web application that enables users to upload their own machine learning models (image classifiers) and test their robustness against adversarial attacks. The app should allow users to upload models and images, apply attacks like Fast Gradient Sign Method (FGSM) or Projected Gradient Descent (PGD), and visualize the results to identify vulnerabilities, helping ML practitioners improve model security and reliability.

## Web App Title

**AdversaNet – AI-Powered Adversarial Attack Testing Platform**

## A Brief of the Prototype

Interact with the website here – https://adversary-lab.example.com

**AdversaNet** is a modular web platform designed to test the robustness of user-uploaded machine learning models against adversarial attacks. Users can upload image classifier models (e.g., TensorFlow `.h5`, PyTorch `.pt`) and test images, apply adversarial attacks, and visualize the impact through predictions, confidence scores, and difference maps. Built with React and Tailwind CSS on the front-end and Python (Flask/FastAPI) on the backend, **AdversaNet** leverages libraries like CleverHans or Foolbox for attack generation and provides an intuitive interface for ML practitioners to assess model weaknesses.

### Key Features Include

- **Model Upload**: Upload and validate ML models in formats like TensorFlow `.h5` or PyTorch `.pt`.
- **Image Upload**: Test models with JPEG or PNG images.
- **Adversarial Attacks**: Apply attacks like FGSM or PGD to generate perturbed images.
- **Visualization Dashboard**: Display original and adversarial predictions, confidence scores, and pixel difference maps.
- **Weakness Metrics**: Show attack success rate and confidence drop to highlight vulnerabilities.
- **Secure Processing**: Validate and sandbox model execution for safety.

### Multi-User Roles

- **Researcher**: Upload models and images, select attack types, and analyze results.
- **Developer**: Use the platform to test and improve model robustness.

### AI & Cloud Integration (Simplified Overview)

#### Adversarial Attack Pipeline

- **Model Loading**: Securely load user-uploaded models using TensorFlow or PyTorch.
- **Image Processing**: Preprocess images (e.g., resize, normalize) to match model requirements.
- **Attack Generation**: Use libraries like CleverHans or Foolbox to apply attacks (e.g., FGSM, PGD).
- **Result Visualization**: Generate Base64-encoded difference images and compute metrics like attack success rate.

### Technology Stack

- **Frontend**: React, Tailwind CSS, Next.js, Chart.js (for confidence visualizations)
- **Backend**: FastAPI (Python), TensorFlow
- **Database**: SupaBase
- **Deployment**: Vercel (frontend), Render (backend)
- **Other**: NumPy, OpenCV for image processing

## Code Execution Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/<your-username>/adversary-lab.git
   cd adversary-lab
   ```

2. **Install Frontend Dependencies**

   ```bash
   cd frontend
   npm install
   ```

   Note: If using the provided `index.html` with CDN-hosted libraries, this step is optional.

3. **Install Backend Dependencies**

   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

4. **Start Development Servers**

   - **Frontend (React)**

     ```bash
     cd frontend
     npm run dev
     ```

     Alternatively, serve `index.html` directly:

     ```bash
     python -m http.server 8000
     ```
   - **Backend (Flask/FastAPI)**

     ```bash
     cd ../backend
     python app.py
     ```

5. **Access the Application**

   - Open `http://localhost:8000` (frontend) in your browser.
   - Ensure the backend is running at `http://localhost:5000` (or your configured port).
   - Update the API endpoint in `frontend/index.html` (e.g., `fetch('http://localhost:5000/api/test-model')`) if needed.

## Scalability & Business Model

- **Subscription Model**: Offer tiered pricing for individual researchers, teams, or enterprises, with limits on model uploads or attack runs.
- **Enterprise Integrations**: Support for batch testing and integration with ML development pipelines.
- **Security & Compliance**: Implement sandboxing, encryption, and role-based access to ensure safe model execution.
- **Modular Architecture**: Easily extend to support new attack types, model formats, or visualization tools.
- **Affordability**: Free tier for small-scale testing, with premium tiers for advanced features (e.g., batch processing, detailed reports).

## Summary

**AdversaNet** empowers ML practitioners to test and improve the robustness of their image classifier models by providing an intuitive platform for adversarial attack testing. Combining a React-based front-end with a Python-powered backend, it enables users to upload models and images, apply attacks like FGSM or PGD, and visualize vulnerabilities through predictions, difference maps, and metrics. This AI-driven tool reduces the complexity of adversarial testing, helping developers build more secure and reliable machine learning systems.
