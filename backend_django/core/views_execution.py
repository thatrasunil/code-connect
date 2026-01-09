from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .models import Question, TestCase, Submission, Room
from django.shortcuts import get_object_or_404
import json
import time
import traceback

class ExecuteCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        code = request.data.get('code')
        language = request.data.get('language', 'javascript')
        question_id = request.data.get('questionId')
        
        if not code:
            return Response({'error': 'Code is required'}, status=400)
        
        # Get test cases
        test_cases = []
        if question_id:
            question = get_object_or_404(Question, id=question_id)
            test_cases = TestCase.objects.filter(question=question, is_hidden=False)
        else:
            # Use provided test cases
            test_cases_data = request.data.get('testCases', [])
            test_cases = [{'input_data': tc.get('input'), 'expected_output': tc.get('expected')} for tc in test_cases_data]
        
        results = []
        passed_count = 0
        total_count = len(test_cases) if isinstance(test_cases, list) else test_cases.count()
        
        # Execute code against test cases
        for tc in test_cases:
            if hasattr(tc, 'input_data'):
                input_data = tc.input_data
                expected = tc.expected_output
            else:
                input_data = tc['input_data']
                expected = tc['expected_output']
            
            result = self._execute_code(code, language, input_data)
            
            passed = str(result['output']).strip() == str(expected).strip()
            if passed:
                passed_count += 1
            
            results.append({
                'input': input_data,
                'expected': expected,
                'actual': result['output'],
                'passed': passed,
                'runtime': result['runtime'],
                'error': result.get('error')
            })
        
        # Determine overall status
        if passed_count == total_count:
            overall_status = 'Accepted'
        elif passed_count > 0:
            overall_status = 'Wrong Answer'
        else:
            overall_status = 'Wrong Answer'
        
        return Response({
            'results': results,
            'passed': passed_count,
            'total': total_count,
            'status': overall_status
        })

    def _execute_code(self, code, language, input_data):
        """
        Simple code execution for JavaScript only (client-side safe)
        For production, integrate Judge0 or Piston API
        """
        start_time = time.time()
        
        if language == 'javascript':
            try:
                # Parse input if JSON
                try:
                    input_obj = json.loads(input_data)
                except:
                    input_obj = input_data
                
                # Wrap code in function and execute
                # This is a simplified approach - in production use a sandbox
                exec_code = f'''
function solution(input) {{
    {code}
}}
result = solution({json.dumps(input_obj)});
'''
                local_vars = {}
                exec(self._js_to_python(exec_code), {}, local_vars)
                output = local_vars.get('result', '')
                
                runtime = int((time.time() - start_time) * 1000)
                return {'output': output, 'runtime': runtime}
            except Exception as e:
                return {'output': '', 'runtime': 0, 'error': str(e)}
        else:
            return {'output': 'Language not supported yet', 'runtime': 0, 'error': 'Only JavaScript is supported in this version'}
    
    def _js_to_python(self, js_code):
        """Basic JS to Python conversion for simple cases"""
        # This is a very basic converter - for production use a proper JS engine
        python_code = js_code.replace('function ', 'def ')
        python_code = python_code.replace('const ', '')
        python_code = python_code.replace('let ', '')
        python_code = python_code.replace('var ', '')
        python_code = python_code.replace('return', 'result =')
        return python_code


class SubmitSolutionView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, question_id):
        question = get_object_or_404(Question, id=question_id)
        code = request.data.get('code')
        language = request.data.get('language', 'javascript')
        room_id = request.data.get('roomId')
        
        # Get all test cases (including hidden)
        test_cases = TestCase.objects.filter(question=question)
        
        # Execute against all test cases
        executor = ExecuteCodeView()
        results = []
        passed_count = 0
        
        for tc in test_cases:
            result = executor._execute_code(code, language, tc.input_data)
            passed = str(result['output']).strip() == str(tc.expected_output).strip()
            if passed:
                passed_count += 1
            results.append(result)
        
        total_count = test_cases.count()
        
        # Determine status
        if passed_count == total_count:
            submission_status = 'Accepted'
        else:
            submission_status = 'Wrong Answer'
        
        # Create submission record
        submission = Submission.objects.create(
            user=request.user if request.user.is_authenticated else None,
            question=question,
            room=Room.objects.get(room_id=room_id) if room_id else None,
            code=code,
            language=language,
            status=submission_status,
            passed_tests=passed_count,
            total_tests=total_count
        )
        
        return Response({
            'submissionId': submission.id,
            'status': submission_status,
            'passed': passed_count,
            'total': total_count
        })
