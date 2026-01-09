import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
import os
from django.conf import settings

# Configure API Key (ideally from settings/env, but using provided key for now if env missing)
# USER PROVIDED KEY: AIzaSyAImUp4rrRH_XmPsBHhu87hdrps6AmoH4I
API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyAImUp4rrRH_XmPsBHhu87hdrps6AmoH4I") 

genai.configure(api_key=API_KEY)

class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-pro')

    def chat_with_ai(self, prompt, context=""):
        """
        Sends a prompt to the AI, optionally with code context.
        """
        try:
            full_prompt = f"{context}\n\nUser: {prompt}" if context else prompt
            response = self.model.generate_content(full_prompt)
            return response.text
        except ResourceExhausted:
            return "AI service is currently busy (Quota Exceeded). Please try again later."
        except Exception as e:
            return f"Error communicating with AI: {str(e)}"

    def explain_code(self, code, language="javascript"):
        """
        Asks AI to explain the provided code snippet.
        """
        prompt = f"Explain the following {language} code in simple terms:\n\n```{language}\n{code}\n```"
        return self.chat_with_ai(prompt)

    def generate_interview_question(self, difficulty="medium", topic="algorithms"):
        """
        Generates a coding interview question.
        """
        prompt = f"Generate a {difficulty} coding interview question about {topic}. Format it with Title, Description, and Example Input/Output."
        return self.chat_with_ai(prompt)

    def analyze_security(self, code):
        """
        Checks code for vulnerabilities.
        """
        prompt = f"Analyze the following code for security vulnerabilities and bugs:\n\n{code}\n\nProvide a list of issues and fixes."
        return self.chat_with_ai(prompt)
