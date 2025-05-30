from flask import Flask, request, jsonify, render_template
from flask_cors import CORS 
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import base64
from tensorflow.keras.applications.mobilenet_v2 import (
    MobileNetV2,
    preprocess_input,
    decode_predictions
)

app = Flask(__name__, template_folder="templates")
CORS(app) 
# Load your MNIST model
mnist_model = tf.keras.models.load_model("models/mnist_model.h5")

# Load pretrained MobileNetV2 model for ImageNet
imagenet_model = MobileNetV2(weights="imagenet")

def fgsm_attack_mnist(image_np, model, epsilon=0.1):
    image = tf.convert_to_tensor(image_np, dtype=tf.float32)
    image = tf.Variable(image)
    
    # Get the original prediction to determine the true label
    with tf.GradientTape() as tape:
        tape.watch(image)
        prediction = model(image)
        label = tf.argmax(prediction[0])
        loss = tf.keras.losses.sparse_categorical_crossentropy(
            tf.expand_dims(label, 0), 
            prediction,
            from_logits=False
        )

    gradient = tape.gradient(loss, image)
    signed_grad = tf.sign(gradient)

    adv_image = image + epsilon * signed_grad
    adv_image = tf.clip_by_value(adv_image, 0.0, 1.0)
    return adv_image.numpy()

def array_to_base64(img_array, model_type):
    """Convert numpy array to base64 encoded image"""
    if model_type == "mnist":
        img = Image.fromarray((img_array[0,:,:,0] * 255).astype(np.uint8))
    else:
        # Denormalize ImageNet image
        img_array = img_array[0] + 1.0  # Scale back to 0-2
        img_array = img_array * 127.5    # Scale to 0-255
        img = Image.fromarray(img_array.astype(np.uint8))
    
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'model' not in request.form or 'image' not in request.files:
        return jsonify({"error": "Missing model type or image"}), 400
        
    model_type = request.form['model']
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        img = Image.open(file)
    except:
        return jsonify({"error": "Invalid image file"}), 400

    if model_type == 'mnist':
        # Preprocess image for MNIST model
        img = img.convert("L").resize((28, 28))
        img_array = np.array(img).astype("float32") / 255.0
        img_array = img_array.reshape(1, 28, 28, 1)

        # Original prediction
        original_pred = mnist_model.predict(img_array)
        original_class = int(np.argmax(original_pred[0]))

        # Generate adversarial image and prediction
        try:
            adv_img = fgsm_attack_mnist(img_array, mnist_model)
            adv_pred = mnist_model.predict(adv_img)
            adv_class = int(np.argmax(adv_pred[0]))
            
            # Convert adversarial image to base64
            adv_img_base64 = array_to_base64(adv_img, "mnist")
        except Exception as e:
            return jsonify({"error": f"Adversarial attack failed: {str(e)}"}), 500

        return jsonify({
            "original_prediction": original_class,
            "adversarial_prediction": adv_class,
            "model_type": "mnist",
            "adversarial_image": adv_img_base64
        })

    elif model_type == 'imagenet':
        # Preprocess image for ImageNet model
        img = img.convert("RGB").resize((224, 224))
        img_array = np.array(img).astype("float32")
        preprocessed = preprocess_input(img_array)
        input_tensor = tf.convert_to_tensor(preprocessed.reshape((1, 224, 224, 3)))

        # Original prediction
        original_pred = imagenet_model.predict(input_tensor)
        original_decoded = decode_predictions(original_pred)[0][0]

        # Generate adversarial image
        input_var = tf.Variable(input_tensor)
        with tf.GradientTape() as tape:
            tape.watch(input_var)
            prediction = imagenet_model(input_var)
            pred_class = tf.argmax(prediction[0])
            # Convert to one-hot encoding for categorical crossentropy
            target = tf.one_hot([pred_class], 1000)
            loss = tf.keras.losses.categorical_crossentropy(target, prediction)

        gradient = tape.gradient(loss, input_var)
        signed_grad = tf.sign(gradient)
        epsilon = 0.01
        adv_img = tf.clip_by_value(input_var + epsilon * signed_grad, -1, 1)

        # Adversarial prediction
        adv_prediction = imagenet_model(adv_img)
        adv_decoded = decode_predictions(adv_prediction.numpy())[0][0]

        # Convert adversarial image to base64
        adv_img_base64 = array_to_base64(adv_img.numpy(), "imagenet")

        return jsonify({
            "original_prediction": {
                "class_name": original_decoded[1],
                "probability": float(original_decoded[2])
            },
            "adversarial_prediction": {
                "class_name": adv_decoded[1],
                "probability": float(adv_decoded[2])
            },
            "model_type": "imagenet",
            "adversarial_image": adv_img_base64
        })

    else:
        return jsonify({"error": "Invalid model type"}), 400

if __name__ == '__main__':
    app.run(debug=True)