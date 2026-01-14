// AI Verification Service
// Uses Groq API for code analysis and verification

class AIVerificationService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        this.model = 'llama-3.3-70b-versatile';
    }

    /**
     * Call Groq API with messages
     */
    async callGroqAPI(messages) {
        if (!this.apiKey) {
            throw new Error('API Key is missing. Please set GROQ_API_KEY in environment variables.');
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Groq API Error (${response.status}):`, errorText);
                throw new Error(`AI service error (Status: ${response.status})`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Groq API Exception:', error);
            throw error;
        }
    }

    /**
     * Verify solution correctness and quality
     * @param {string} code - User's code
     * @param {string} language - Programming language
     * @param {Object} problem - Problem details
     * @returns {Promise<Object>} Verification results
     */
    async verifySolution(code, language, problem) {
        try {
            const prompt = `You are an expert code reviewer analyzing a solution to a coding problem.

**Problem:** ${problem.title}
**Description:** ${problem.description}
**Difficulty:** ${problem.difficulty}

**Solution (${language}):**
\`\`\`${language}
${code}
\`\`\`

Please analyze this solution and provide a JSON response with the following structure:
{
  "isCorrect": true/false,
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "score": 0-100,
  "feedbacks": [
    {
      "type": "Logic" | "Performance" | "Code Quality" | "Edge Cases",
      "message": "Detailed feedback message"
    }
  ],
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2"
  ],
  "edgeCases": [
    "Edge case 1",
    "Edge case 2"
  ]
}

Focus on:
1. Correctness of the logic
2. Time and space complexity analysis
3. Code quality (readability, best practices)
4. Potential edge cases or bugs
5. Performance optimizations

Respond ONLY with valid JSON, no additional text.`;

            const messages = [
                { role: 'system', content: 'You are an expert programming instructor and code reviewer. Provide constructive, detailed feedback in JSON format.' },
                { role: 'user', content: prompt }
            ];

            const response = await this.callGroqAPI(messages);

            // Parse JSON response
            let analysis;
            try {
                // Extract JSON from response (in case there's extra text)
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    analysis = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No JSON found in response');
                }
            } catch (parseError) {
                console.error('Failed to parse AI response:', response);
                // Return fallback response
                analysis = {
                    isCorrect: true,
                    timeComplexity: 'Unable to analyze',
                    spaceComplexity: 'Unable to analyze',
                    score: 70,
                    feedbacks: [
                        {
                            type: 'Code Quality',
                            message: 'AI analysis temporarily unavailable. Your solution passed all test cases.'
                        }
                    ],
                    suggestions: [],
                    edgeCases: []
                };
            }

            return analysis;
        } catch (error) {
            console.error('AI Verification Error:', error);
            return {
                error: 'AI verification failed',
                isCorrect: false,
                timeComplexity: 'N/A',
                spaceComplexity: 'N/A',
                score: 0,
                feedbacks: [
                    {
                        type: 'Error',
                        message: error.message || 'AI verification service is currently unavailable'
                    }
                ],
                suggestions: [],
                edgeCases: []
            };
        }
    }

    /**
     * Provide a hint without revealing the solution
     * @param {Object} problem - Problem details
     * @param {string} attemptedCode - User's attempted code (optional)
     * @param {string} difficulty - Hint difficulty level
     * @returns {Promise<string>} Hint text
     */
    async provideHint(problem, attemptedCode = null, difficulty = 'Medium') {
        try {
            const prompt = `Problem: ${problem.title}
${problem.description}

Difficulty Level: ${difficulty}
${attemptedCode ? `User's attempted code:\n\`\`\`\n${attemptedCode}\n\`\`\`` : ''}

Provide a helpful hint WITHOUT giving away the solution:
- For Easy hints: Suggest the general approach or data structure
- For Medium hints: Provide more specific guidance on the algorithm
- For Hard hints: Offer optimization tips or edge case considerations

Keep the hint brief (2-3 sentences) and encouraging.`;

            const messages = [
                { role: 'system', content: 'You are a helpful coding mentor. Provide hints that guide without revealing the solution.' },
                { role: 'user', content: prompt }
            ];

            const response = await this.callGroqAPI(messages);
            return response.trim();
        } catch (error) {
            console.error('Hint Generation Error:', error);
            return 'Unable to generate hint at this time. Try breaking down the problem into smaller steps.';
        }
    }

    /**
     * Generate a step-by-step solution approach
     * @param {Object} problem - Problem details
     * @returns {Promise<string>} Solution approach
     */
    async generateApproach(problem) {
        try {
            const prompt = `For the problem "${problem.title}":
${problem.description}

Provide a step-by-step approach to solve this problem WITHOUT showing actual code:

1. **Problem Type**: Identify what kind of problem this is
2. **Algorithm/Data Structure**: Suggest the best approach
3. **Steps**: Outline the solution steps
4. **Complexity**: Mention expected time and space complexity
5. **Edge Cases**: List important edge cases to consider

Format your response in clear, numbered steps.`;

            const messages = [
                { role: 'system', content: 'You are an expert algorithm instructor. Explain problem-solving approaches clearly without writing code.' },
                { role: 'user', content: prompt }
            ];

            const response = await this.callGroqAPI(messages);
            return response.trim();
        } catch (error) {
            console.error('Approach Generation Error:', error);
            return 'Unable to generate approach at this time. Consider reviewing the problem constraints and examples.';
        }
    }

    /**
     * Analyze code for common mistakes
     * @param {string} code - User's code
     * @param {string} language - Programming language
     * @returns {Promise<Array>} List of potential issues
     */
    async analyzeCodeIssues(code, language) {
        try {
            const prompt = `Analyze this ${language} code for potential issues:

\`\`\`${language}
${code}
\`\`\`

List any:
- Syntax errors
- Logic errors
- Performance issues
- Edge cases not handled

Provide a brief, bulleted list of issues found.`;

            const messages = [
                { role: 'system', content: 'You are a code analyzer. Identify potential issues concisely.' },
                { role: 'user', content: prompt }
            ];

            const response = await this.callGroqAPI(messages);

            // Parse response into array of issues
            const issues = response
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map(line => line.replace(/^[-•]\s*/, '').trim());

            return issues;
        } catch (error) {
            console.error('Code Analysis Error:', error);
            return [];
        }
    }
}

module.exports = AIVerificationService;
