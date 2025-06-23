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
import h5py
import re

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
            
            # Get file data from storage instead of hex
            if 'fileData' not in model_data or not model_data['fileData']:
                return jsonify({'error': 'Model data not available'}), 400

            # Handle base64 encoded data
            if isinstance(model_data['fileData'], str):
                import base64
                try:
                    model_bytes = base64.b64decode(model_data['fileData'])
                except:
                    # Fallback to direct bytes if not base64
                    model_bytes = model_data['fileData'].encode('latin-1')
            else:
                model_bytes = model_data['fileData']

            # Create temporary model file
            with tempfile.NamedTemporaryFile(suffix='.h5', delete=False) as temp_model:
                temp_model.write(model_bytes)
                temp_model_path = temp_model.name

            # Verify it's an HDF5 file
            try:
                with h5py.File(temp_model_path, 'r') as f:
                    if not f.keys():
                        return jsonify({'error': 'Invalid HDF5 file (no keys found)'}), 400
            except Exception as e:
                return jsonify({
                    'error': 'Invalid model file',
                    'details': 'The file is not a valid HDF5 model',
                    'debug': str(e)
                }), 400

            # Load Keras model
            try:
                model = load_model(temp_model_path, compile=False)
                
                # Get expected input shape from model
                if hasattr(model, 'input_shape'):
                    input_shape = model.input_shape[1:3]  # Get height and width
                else:
                    input_shape = (32, 32)  # Default to CIFAR-10 size
                
                # Recompile model if needed
                if model.optimizer is None:
                    model.compile(optimizer='adam',
                                loss='sparse_categorical_crossentropy',
                                metrics=['accuracy'])
            except Exception as e:
                return jsonify({
                    'error': 'Failed to load Keras model',
                    'details': str(e)
                }), 400
            # Add this right after loading the model
            try:
                # Verify model structure
                if not all(key in model.__dict__ for key in ['layers', 'optimizer', 'loss']):
                    raise ValueError("Invalid Keras model structure")
                
                # Verify input shape
                if model.input_shape[1:] != (32, 32, 3):
                    raise ValueError(f"Model expects input shape {model.input_shape[1:]}, not 32x32x3")
                    
            except AttributeError as e:
                return jsonify({
                    'error': 'Invalid model architecture',
                    'details': str(e)
                }), 400
            # Load and preprocess image
            try:
                img = image.load_img(io.BytesIO(image_file.read()), target_size=input_shape)
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
                        'class_name': class_names[int(cat)] if int(cat) < len(class_names) else str(int(cat)),
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
        
        # Handle different data formats
        if isinstance(file_data['fileData'], str):
            if file_data['fileData'].startswith(r'\x'):
                # Hex format
                byte_data = bytes.fromhex(file_data['fileData'].replace(r'\x', ''))
            else:
                # Try base64 first
                try:
                    import base64
                    byte_data = base64.b64decode(file_data['fileData'])
                except:
                    # Fallback to raw string
                    byte_data = file_data['fileData'].encode('latin-1')
        else:
            byte_data = file_data['fileData']
        
        # Check if it's a binary file
        is_binary = True
        try:
            content = byte_data.decode('utf-8')
            is_binary = False
        except UnicodeDecodeError:
            content = "Binary data (HDF5 model file)"
        
        return jsonify({
            'success': True,
            'name': file_data['name'],
            'content': content,
            'fileType': file_data.get('fileType', '.h5'),
            'isBinary': is_binary,
            'size': len(byte_data)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'debug_info': {'file_id': file_id}
        })

if __name__ == '__main__':
    app.run(debug=True, port=5001)