import requests
import os
import json
from django.conf import settings

# Configure API Key
API_KEY = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", "")) 

class GeminiService:
    """
    Adapter service that now uses Groq API but keeps the GeminiService name 
    to maintain compatibility with existing views.
    """
    def __init__(self):
        self.api_key = API_KEY
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.model = "llama-3.3-70b-versatile" # Using Llama 3.3 70B via Groq

    def _call_groq(self, messages):
        if not self.api_key:
            return "Error: API Key is missing."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1024
        }

        try:
            response = requests.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data['choices'][0]['message']['content']
        except requests.exceptions.HTTPError as e:
            error_msg = f"API Error: {e.response.status_code} - {e.response.text}"
            print(error_msg)
            return "I am having trouble connecting to the AI service right now. Please try again later."
        except Exception as e:
            print(f"Groq API Exception: {e}")
            return f"An error occurred: {str(e)}"

    def chat_with_ai(self, prompt, context=""):
        """
        Sends a prompt to the AI, optionally with code context.
        """
        messages = []
        
        system_prompt = "You are codeConnect AI, a helpful assistant for coding and debugging. Keep responses concise and relevant to programming."
        messages.append({"role": "system", "content": system_prompt})
        
        if context:
            messages.append({"role": "user", "content": f"Context:\n{context}\n\nUser Question: {prompt}"})
        else:
            messages.append({"role": "user", "content": prompt})
            
        return self._call_groq(messages)

    def explain_code(self, code, language="javascript"):
        """
        Asks AI to explain the provided code snippet.
        """
        messages = [
            {"role": "system", "content": f"You are an expert {language} developer. Explain the code clearly and simply for a student."},
            {"role": "user", "content": f"Please explain this {language} code:\n\n```{language}\n{code}\n```"}
        ]
        return self._call_groq(messages)

    def generate_interview_question(self, difficulty="medium", topic="algorithms"):
        """
        Generates a coding interview question.
        """
        messages = [
             {"role": "system", "content": "You are a technical interviewer."},
             {"role": "user", "content": f"Generate a {difficulty} coding interview question about {topic}. Return the response in JSON format (without markdown code blocks) with keys: title, description, example_input, example_output."}
        ]
        
        # We might want to enforce JSON or parse it, but for now text is fine as the frontend displays markdown usually.
        # Let's adjust prompt to be more flexible if JSON parsing isn't strictly enforced downstream.
        # Actually, let's keep it simple text for now to match previous behavior which returned text.
        
        messages = [
             {"role": "system", "content": "You are a technical interviewer."},
             {"role": "user", "content": f"Generate a {difficulty} coding interview question about {topic}. Format it with Markdown:\n## Title\n**Description**\n\n### Example\nInput: ...\nOutput: ..."}
        ]
        return self._call_groq(messages)

    def analyze_security(self, code):
        """
        Checks code for vulnerabilities.
        """
        messages = [
            {"role": "system", "content": "You are a security expert."},
            {"role": "user", "content": f"Analyze the following code for security vulnerabilities:\n\n{code}\n\nList any issues found and how to fix them."}
        ]
        return self._call_groq(messages)
