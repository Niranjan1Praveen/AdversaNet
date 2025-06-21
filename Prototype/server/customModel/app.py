from flask import Flask, render_template, request, jsonify
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import tempfile
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Image preprocessing transform
preprocess = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

@app.route('/')
def index():
    """Main page with file selector and image upload"""
    try:
        # Fetch all files from CustomModel table
        response = supabase.table('CustomModel').select("*").execute()
        files = response.data
        return render_template('index.html', files=files)
    except Exception as e:
        return render_template('error.html', error=str(e))

@app.route('/classify', methods=['POST'])
def classify_image():
    try:
        # Check for required files and data
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
        
        image_file = request.files['image']
        model_id = request.form.get('model_id')
        
        if not model_id:
            return jsonify({'error': 'No model selected'}), 400

        # Verify image file
        if not image_file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            return jsonify({'error': 'Invalid image format. Please upload PNG or JPG'}), 400

        # Load model metadata from database
        try:
            model_response = supabase.table('CustomModel')\
                                  .select("*")\
                                  .eq('id', model_id)\
                                  .execute()
            
            if not model_response.data:
                return jsonify({'error': 'Model not found in database'}), 404
                
            model_data = model_response.data[0]
            
            # Verify model file type
            if not model_data['fileType'].lower() == '.h5':
                return jsonify({
                    'error': 'Invalid model type',
                    'details': f"Expected .h5 file, got {model_data['fileType']}"
                }), 400

            # Convert hex data to bytes with verification
            try:
                if not model_data['fileData'].startswith(r'\x'):
                    return jsonify({
                        'error': 'Invalid model data format',
                        'details': 'Model data should start with \\x'
                    }), 400
                
                clean_hex = model_data['fileData'].replace(r'\x', '')
                if len(clean_hex) % 2 != 0:
                    return jsonify({
                        'error': 'Invalid hex data length',
                        'details': 'Hex string should have even number of characters'
                    }), 400
                
                model_bytes = bytes.fromhex(clean_hex)
                if len(model_bytes) < 100:  # Minimum reasonable size for .h5 file
                    return jsonify({
                        'error': 'Model file too small',
                        'details': f"File size only {len(model_bytes)} bytes"
                    }), 400
            except ValueError as e:
                return jsonify({
                    'error': 'Failed to convert model data',
                    'details': str(e)
                }), 400

            # Create temporary model file
            with tempfile.NamedTemporaryFile(suffix='.h5', delete=False) as temp_model:
                temp_model.write(model_bytes)
                temp_model_path = temp_model.name

            # Verify file magic number (HDF5 format)
            with open(temp_model_path, 'rb') as f:
                magic = f.read(8)
                if magic != b'\x89HDF\r\n\x1a\n':
                    return jsonify({
                        'error': 'Invalid HDF5 file format',
                        'details': 'File header does not match HDF5 specification'
                    }), 400

            # Load Keras model with custom objects support
            try:
                model = load_model(temp_model_path, compile=False)
                
                # Recompile model if needed
                if model.optimizer is None:
                    model.compile(optimizer='adam',
                                loss='sparse_categorical_crossentropy',
                                metrics=['accuracy'])
            except Exception as e:
                return jsonify({
                    'error': 'Failed to load Keras model',
                    'details': str(e),
                    'solution': 'Ensure model was saved with model.save() and uses supported layers'
                }), 400

            # Load and preprocess image
            try:
                img = image.load_img(io.BytesIO(image_file.read()), target_size=(32, 32))
                img_array = image.img_to_array(img)
                img_array = np.expand_dims(img_array, axis=0) / 255.0
            except Exception as e:
                return jsonify({
                    'error': 'Image processing failed',
                    'details': str(e)
                }), 400

            # Make prediction
            predictions = model.predict(img_array)
            top_prob = np.sort(predictions[0])[::-1][:5]
            top_cat = np.argsort(predictions[0])[::-1][:5]
            
            class_names = ['airplane', 'automobile', 'bird', 'cat', 'deer',
                          'dog', 'frog', 'horse', 'ship', 'truck']
            
            return jsonify({
                'success': True,
                'predictions': [
                    {
                        'class': int(cat),
                        'class_name': class_names[int(cat)],
                        'probability': float(prob)
                    } for prob, cat in zip(top_prob, top_cat)
                ],
                'model_name': model_data['name']
            })

        except Exception as e:
            return jsonify({
                'error': 'Classification error',
                'details': str(e)
            }), 500

        finally:
            # Clean up temporary files
            try:
                if 'temp_model_path' in locals():
                    os.unlink(temp_model_path)
            except:
                pass

    except Exception as e:
        return jsonify({
            'error': 'Server error',
            'details': str(e)
        }), 500

@app.route('/get_file_content', methods=['POST'])
def get_file_content():
    try:
        file_id = request.form.get('file_id')
        
        # Fetch file data from database
        response = supabase.table('CustomModel')\
                        .select("*")\
                        .eq('id', file_id)\
                        .execute()
        
        if not response.data:
            raise Exception("File not found in database")
            
        file_data = response.data[0]
        
        if not file_data.get('fileData'):
            raise Exception("File content not available in database")
        
        # Convert the stored hex data back to original form
        hex_str = file_data['fileData']
        try:
            # Remove the \x prefixes and convert from hex
            byte_data = bytes.fromhex(hex_str.replace(r'\x', ''))
            
            # Try to decode as UTF-8 if it's text
            try:
                content = byte_data.decode('utf-8')
                return jsonify({
                    'success': True,
                    'name': file_data['name'],
                    'content': content,
                    'fileType': file_data['fileType'],
                    'isBinary': False
                })
            except UnicodeDecodeError:
                # If not UTF-8, return as binary
                import base64
                return jsonify({
                    'success': True,
                    'name': file_data['name'],
                    'content': "Binary file content",
                    'fileType': file_data['fileType'],
                    'isBinary': True,
                    'base64Data': base64.b64encode(byte_data).decode('utf-8')
                })
                
        except Exception as conversion_error:
            raise Exception(f"Failed to convert file data: {str(conversion_error)}")
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'debug_info': {'file_id': file_id}
        })

if __name__ == '__main__':
    app.run(debug=True, port=5001)   