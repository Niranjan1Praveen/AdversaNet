from flask import Flask, request, jsonify
from supabase import create_client, Client
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/analysis-result/<string:id>', methods=['GET'])
def get_analysis_result(id):
    try:
        response = supabase.table("AnalysisResult").select("*").eq("id", id).single().execute()

        if response.error:
            return jsonify({"error": response.error.message}), 404

        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/analysis-result/test-id', methods=['GET'])
def test():
    return jsonify({"message": "test success"}), 200

@app.route('/', methods=['GET'])
def index():
    return "GeminiModel API is running."

if __name__ == '__main__':
    app.run(debug=True, port=5002)
