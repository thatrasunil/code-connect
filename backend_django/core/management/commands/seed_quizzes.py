from django.core.management.base import BaseCommand
from core.utils.firebase_client import get_firestore_client
import json

class Command(BaseCommand):
    help = 'Seeds initial quiz data'

    def handle(self, *args, **kwargs):
        db = get_firestore_client()
        if not db:
            self.stdout.write(self.style.ERROR('Firestore not initialized'))
            return

        quizzes_data = [
            {
                "title": "Python Basics",
                "description": "Test your knowledge of Python fundamentals.",
                "category": "Python",
                "questions": [
                    {
                        "id": "q1",
                        "text": "What is the output of print(2 ** 3)?",
                        "options": ["6", "8", "9", "Error"],
                        "correct_answer": 1,
                        "explanation": "** is the exponentiation operator. 2 to the power of 3 is 8."
                    },
                    {
                        "id": "q2",
                        "text": "Which of these is NOT a valid variable name in Python?",
                        "options": ["_myVar", "my_var", "2myVar", "myVar2"],
                        "correct_answer": 2,
                        "explanation": "Variable names cannot start with a number."
                    },
                    {
                        "id": "q3",
                        "text": "How do you start a comment in Python?",
                        "options": ["//", "/*", "#", "<!--"],
                        "correct_answer": 2,
                        "explanation": "# is used for single-line comments."
                    }
                ]
            },
            {
                "title": "ReactJS Essentials",
                "description": "Core concepts of React library.",
                "category": "React",
                "questions": [
                    {
                        "id": "q1",
                        "text": "What is the primary purpose of useEffect?",
                        "options": ["State management", "Side effects", "Routing", "Styling"],
                        "correct_answer": 1,
                        "explanation": "useEffect is designed to handle side effects like data fetching or subscriptions."
                    },
                    {
                        "id": "q2",
                        "text": "Which hook is used to create a reference to a DOM element?",
                        "options": ["useState", "useEffect", "useRef", "useMemo"],
                        "correct_answer": 2,
                        "explanation": "useRef returns a mutable ref object whose .current property is initialized to the passed argument."
                    }
                ]
            },
            {
                "title": "JavaScript Mastery",
                "description": "Advanced JS concepts.",
                "category": "JavaScript",
                "questions": [
                    {
                        "id": "q1",
                        "text": "What does 'NaN' stand for?",
                        "options": ["Not a Null", "Not a Number", "Null and Number", "None of Above"],
                        "correct_answer": 1,
                        "explanation": "NaN stands for Not-a-Number."
                    },
                    {
                        "id": "q2",
                        "text": "Which method removes the last element from an array?",
                        "options": ["shift()", "unshift()", "pop()", "push()"],
                        "correct_answer": 2,
                        "explanation": "pop() removes the last element."
                    }
                ]
            }
        ]

        batch = db.batch()
        collection_ref = db.collection('quizzes')

        # Check existing to avoid dupes? Or just overwrite by title??
        # For simplicity, we'll just add them. Real app might check titles.
        # Let's verify if they exist by title.
        
        existing = {doc.to_dict().get('title'): doc.reference for doc in collection_ref.stream()}

        for q_data in quizzes_data:
            if q_data['title'] in existing:
                self.stdout.write(f"Updating quiz: {q_data['title']}")
                batch.set(existing[q_data['title']], q_data, merge=True)
            else:
                self.stdout.write(f"Creating quiz: {q_data['title']}")
                new_doc = collection_ref.document()
                batch.set(new_doc, q_data)

        batch.commit()
        self.stdout.write(self.style.SUCCESS('Successfully seeded quizzes to Firestore'))
