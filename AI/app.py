from flask import Flask, render_template, request
import google.generativeai as genai
import nltk

# Configure the API key directly
api_key = "AIzaSyBVbV0KNNMV70FVebcWm2Vn5AoNlXAvNlA"  # Replace "YOUR_API_KEY_HERE" with your actual API key
genai.configure(api_key=api_key)

# AI connect
model = genai.GenerativeModel('gemini-pro')
chat = model.start_chat(history=[])

nltk.download('punkt')

def get_gemini_response(question):
    response = chat.send_message(question, stream=True)
    return response

def format_response(response_text):
    # Split response into lines
    lines = response_text.split('\n')

    formatted_response = ''
    for line in lines:
        # Check if the line contains double asterisks
        if '**' in line:
            # Split the line by double asterisks
            segments = line.split('**')
            # Bolden the segments between double asterisks
            for i, segment in enumerate(segments):
                if i % 2 == 1:
                    segments[i] = f'<b>{segment}</b>'
            # Join the segments back together
            line = ''.join(segments)
        # Add line break after each line
        formatted_response += f'{line}<br>'

    return formatted_response

app = Flask(__name__)
title='G-Fluent'

@app.route('/g-ai')
def index():
    return render_template('index.html', title=title)

@app.route('/ask', methods=['POST'])
def ask_question():
    user_input = request.form['question']

    if user_input.lower() == 'quit':
        return "Exiting the chatbot. Goodbye!"

    response = get_gemini_response(user_input)
    response_text = ''
    for chunk in response:
        response_text += chunk.text + ' '

    formatted_response = format_response(response_text)

    return formatted_response

if __name__ == '__main__':
    app.run(debug=True)
