
# AI Endpoints
class AIChatView(APIView):
    permission_classes = [permissions.AllowAny] # Or IsAuthenticated

    def post(self, request):
        prompt = request.data.get('prompt')
        context = request.data.get('context', '')
        if not prompt:
            return Response({'error': 'Prompt is required'}, status=status.HTTP_400_BAD_REQUEST)

        service = GeminiService()
        response = service.chat_with_ai(prompt, context)
        return Response({'response': response})

class AIExplainView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        language = request.data.get('language', 'javascript')
        if not code:
            return Response({'error': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)

        service = GeminiService()
        response = service.explain_code(code, language)
        return Response({'response': response})

class AIInterviewView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        difficulty = request.data.get('difficulty', 'medium')
        topic = request.data.get('topic', 'algorithms')

        service = GeminiService()
        response = service.generate_interview_question(difficulty, topic)
        return Response({'response': response})
