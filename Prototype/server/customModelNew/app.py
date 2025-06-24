import os
import io
import uuid
import base64
import numpy as np
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import tensorflow as tf
from PIL import Image
from supabase import create_client, Client
from dotenv import load_dotenv
import base64

load_dotenv()

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/images'
app.config['ALLOWED_EXTENSIONS'] = {'h5', 'hdf5', 'png', 'jpg', 'jpeg', 'jfif', 'webp'}

# Ensure image directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def generate_adversarial_pattern(input_image, input_label, model, epsilon):
    input_image = tf.convert_to_tensor(input_image)
    input_label = tf.convert_to_tensor(input_label)
    
    with tf.GradientTape() as tape:
        tape.watch(input_image)
        prediction = model(input_image)
        loss = tf.keras.losses.MSE(input_label, prediction)
    
    gradient = tape.gradient(loss, input_image)
    signed_grad = tf.sign(gradient)
    adversarial_image = input_image + epsilon * signed_grad
    adversarial_image = tf.clip_by_value(adversarial_image, 0, 1)
    
    return adversarial_image.numpy()

def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(32, 32))  # keep it 32x32
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0
    return img_array



def image_to_base64(img_array, upscale_to=(256, 256)):
    if isinstance(img_array, tf.Tensor):
        img_array = img_array.numpy()

    img_array = (img_array * 255).astype('uint8')

    # Get first image in batch if necessary
    if img_array.ndim == 4:
        img_array = img_array[0]

    img = Image.fromarray(img_array)

    # Upscale for better visibility
    img = img.resize(upscale_to, Image.NEAREST)

    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    # Handle single image in batch
    if len(img_array.shape) == 4:
        img_array = img_array[0]
    
    img = Image.fromarray(img_array)
    buffered = io.BytesIO()
    img.save(buffered, format="JPEG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

@app.route('/')
def index():
    try:
        response = supabase.table("CustomModel").select("id, name, fileType, fileSize, createdAt").execute()
        models = response.data
        return render_template("index.html", models=models)
    except Exception as e:
        return jsonify({"error": "Failed to fetch models", "details": str(e)}), 500

def pgd_attack(image, label, model, epsilon=0.3, alpha=0.01, iters=40):
    adv_image = tf.identity(image)
    for i in range(iters):
        with tf.GradientTape() as tape:
            tape.watch(adv_image)
            prediction = model(adv_image)
            loss = tf.keras.losses.categorical_crossentropy(label, prediction)
        gradient = tape.gradient(loss, adv_image)
        adv_image = adv_image + alpha * tf.sign(gradient)
        perturbation = tf.clip_by_value(adv_image - image, -epsilon, epsilon)
        adv_image = tf.clip_by_value(image + perturbation, 0, 1)
    return adv_image

def bim_attack(image, label, model, epsilon=0.3, alpha=0.01, iters=10):
    adv_image = tf.identity(image)
    for i in range(iters):
        with tf.GradientTape() as tape:
            tape.watch(adv_image)
            prediction = model(adv_image)
            loss = tf.keras.losses.categorical_crossentropy(label, prediction)
        gradient = tape.gradient(loss, adv_image)
        adv_image = adv_image + alpha * tf.sign(gradient)
        adv_image = tf.clip_by_value(adv_image, 0, 1)
    
    # Apply epsilon constraint after iterations
    perturbation = tf.clip_by_value(adv_image - image, -epsilon, epsilon)
    adv_image = tf.clip_by_value(image + perturbation, 0, 1)
    return adv_image

@app.route('/classify', methods=['POST'])
def classify():
    if 'image' not in request.files or 'model_id' not in request.form:
        return jsonify({'error': 'Missing image or model ID'}), 400

    image_file = request.files['image']
    model_id = request.form['model_id']
    attack_type = request.form.get('attack_type', 'none')
    epsilon = float(request.form.get('epsilon', 0.05))

    if image_file.filename == '' or not allowed_file(image_file.filename):
        return jsonify({'error': 'Invalid image file'}), 400

    # Save image temporarily
    img_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{uuid.uuid4().hex}.jpg")
    image_file.save(img_path)

    try:
        # Fetch model data from Supabase
        response = supabase.table("CustomModel").select("fileData").eq("id", model_id).single().execute()
        model_row = response.data
        file_data = model_row.get("fileData")

        if not file_data:
            return jsonify({"error": "No model data found"}), 404

        # If it starts with \x, it's a hex string from PostgreSQL's bytea
        if isinstance(file_data, str) and file_data.startswith("\\x"):
            hex_data = file_data[2:]  # strip off the '\x'
            try:
                model_bytes = bytes.fromhex(hex_data)
            except Exception as e:
                return jsonify({"error": "Failed to decode hex model data", "details": str(e)}), 500
        else:
            return jsonify({"error": "Unsupported fileData format"}), 400

        # Save and load the model
        model_path = os.path.join("uploads/models", f"{uuid.uuid4().hex}_temp.h5")
        with open(model_path, "wb") as f:
            f.write(model_bytes)

        model = load_model(model_path)

        # Preprocess image
        img_array = preprocess_image(img_path)
        original_image_base64 = image_to_base64(img_array)

        # Classify original image
        predictions = model.predict(img_array)
        class_names = ['airplane', 'automobile', 'bird', 'cat', 'deer',
                      'dog', 'frog', 'horse', 'ship', 'truck']

        top_indices = np.argsort(predictions[0])[::-1][:5]
        original_results = [{
            'class': int(i),
            'class_name': class_names[i] if i < len(class_names) else str(i),
            'probability': float(predictions[0][i])
        } for i in top_indices]

        response_data = {
            'success': True,
            'original_predictions': original_results,
            'original_image': original_image_base64
        }

        # Generate adversarial image if requested
        if attack_type == 'fgsm':
            # Get the original predicted class
            original_class = np.argmax(predictions[0])
            target_label = np.zeros((1, 10))
            target_label[0, original_class] = 1  # Using the original class as target
            
            adversarial_image = generate_adversarial_pattern(img_array, target_label, model, epsilon)
            
            # Classify adversarial image
            adv_predictions = model.predict(adversarial_image)
            
            top_adv_indices = np.argsort(adv_predictions[0])[::-1][:5]
            adversarial_results = [{
                'class': int(i),
                'class_name': class_names[i] if i < len(class_names) else str(i),
                'probability': float(adv_predictions[0][i])
            } for i in top_adv_indices]

            adversarial_image_base64 = image_to_base64(adversarial_image)
            
            response_data.update({
                'adversarial_predictions': adversarial_results,
                'adversarial_image': adversarial_image_base64,
                'epsilon': epsilon
            })
        elif attack_type == 'pgd':
            original_class = np.argmax(predictions[0])
            target_label = np.zeros((1, 10))
            target_label[0, original_class] = 1

            adversarial_image = pgd_attack(tf.convert_to_tensor(img_array), 
                                        tf.convert_to_tensor(target_label), 
                                        model, 
                                        epsilon=epsilon, 
                                        alpha=0.01, 
                                        iters=40)

            # Convert to numpy array if it's a tensor
            if isinstance(adversarial_image, tf.Tensor):
                adversarial_image = adversarial_image.numpy()

            adv_predictions = model.predict(adversarial_image)
            top_adv_indices = np.argsort(adv_predictions[0])[::-1][:5]
            adversarial_results = [{
                'class': int(i),
                'class_name': class_names[i] if i < len(class_names) else str(i),
                'probability': float(adv_predictions[0][i])
            } for i in top_adv_indices]

            adversarial_image_base64 = image_to_base64(adversarial_image)
            response_data.update({
                'adversarial_predictions': adversarial_results,
                'adversarial_image': adversarial_image_base64,
                'epsilon': epsilon
            })
        elif attack_type == 'bim':
            original_class = np.argmax(predictions[0])
            target_label = np.zeros((1, 10))
            target_label[0, original_class] = 1

            adversarial_image = bim_attack(img_array, target_label, model, epsilon=epsilon, alpha=0.01, iters=10)

            adv_predictions = model.predict(adversarial_image)
            top_adv_indices = np.argsort(adv_predictions[0])[::-1][:5]
            adversarial_results = [{
                'class': int(i),
                'class_name': class_names[i] if i < len(class_names) else str(i),
                'probability': float(adv_predictions[0][i])
            } for i in top_adv_indices]

            adversarial_image_base64 = image_to_base64(adversarial_image)

            response_data.update({
                'adversarial_predictions': adversarial_results,
                'adversarial_image': adversarial_image_base64,
                'epsilon': epsilon
            })
        os.remove(img_path)
        os.remove(model_path)

        return jsonify(response_data)

    except Exception as e:
        return jsonify({'error': 'Classification failed', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)