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
        # Get uploaded image and selected model
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400
        
        image_file = request.files['image']
        model_id = request.form.get('model_id')
        
        if not model_id:
            return jsonify({'error': 'No model selected'}), 400
        
        # Load the model from database
        model_response = supabase.table('CustomModel')\
                              .select("*")\
                              .eq('id', model_id)\
                              .execute()
        
        if not model_response.data:
            return jsonify({'error': 'Model not found'}), 404
            
        model_data = model_response.data[0]
        
        # Convert hex data back to bytes
        hex_str = model_data['fileData']
        model_bytes = bytes.fromhex(hex_str.replace(r'\x', ''))
        
        # Create a temporary file to load the model
        with tempfile.NamedTemporaryFile(suffix='.pt', delete=False) as temp_model:
            temp_model.write(model_bytes)
            temp_model_path = temp_model.name
        
        try:
            # Load the PyTorch model
            model = torch.jit.load(temp_model_path)
            model.eval()
            
            # Preprocess the image
            image = Image.open(io.BytesIO(image_file.read()))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            input_tensor = preprocess(image)
            input_batch = input_tensor.unsqueeze(0)  # Add batch dimension
            
            # Run inference
            with torch.no_grad():
                output = model(input_batch)
            
            # Get predictions (assuming classification model)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            top_prob, top_cat = torch.topk(probabilities, 5)
            
            # Convert to lists for JSON serialization
            top_prob = top_prob.numpy().tolist()
            top_cat = top_cat.numpy().tolist()
            
            return jsonify({
                'success': True,
                'predictions': [
                    {'class': int(cat), 'probability': float(prob)} 
                    for prob, cat in zip(top_prob, top_cat)
                ],
                'model_name': model_data['name']
            })
            
        except Exception as e:
            return jsonify({'error': f'Error during classification: {str(e)}'}), 500
            
        finally:
            # Clean up temporary model file
            try:
                os.unlink(temp_model_path)
            except:
                pass
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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