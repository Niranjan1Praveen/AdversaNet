import requests
from PIL import Image
import numpy as np

# 1. Prepare test image
img = Image.open('S5xGj8u.jpg').resize((32, 32))
img_array = np.array(img) / 255.0
img_array = np.expand_dims(img_array, axis=0)

# 2. Get model ID from Supabase
response = requests.post(
    'http://localhost:5001/classify',
    files={'image': open('S5xGj8u.jpg', 'rb')},
    data={'model_id': '0a9f6698-8e17-47fc-b9a8-bee69bcef155'}
)

print(response.json())