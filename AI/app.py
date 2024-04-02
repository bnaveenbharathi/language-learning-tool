from flask import Flask, render_template, request
from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv()  # Take environment variables from .env.

os.getenv("AIzaSyBVbV0KNNMV70FVebcWm2Vn5AoNlXAvNlA")
genai.configure(api_key=os.getenv("AIzaSyBVbV0KNNMV70FVebcWm2Vn5AoNlXAvNlA"))

#AI connect
model = genai.GenerativeModel('gemini-pro')
chat = model.start_chat(history=[])

def get_gemini_response(question):
    response = chat.send_message(question, stream=True)
    return response

app = Flask(__name__)
title='G-Fluent'
@app.route('/g-ai')
def index():
    return render_template('index.html',title=title)

@app.route('/ask', methods=['POST'])
def ask_question():
    user_input = request.form['question']

    if user_input.lower() == 'quit':
        return "Exiting the chatbot. Goodbye!"

    response = get_gemini_response(user_input)
    response_text = ''
    for chunk in response:
        response_text += chunk.text + ' '

    return response_text

if __name__ == '__main__':
    app.run(debug=True)
