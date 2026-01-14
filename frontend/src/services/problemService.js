// Problem Service - API client for problem-related operations
import config from '../config';

class ProblemService {
    /**
     * Fetch problem details by ID
     */
    static async fetchProblem(problemId) {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch problem');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching problem:', error);
            throw error;
        }
    }

    /**
     * Fetch all problems with optional filters
     */
    static async fetchAllProblems(filters = {}) {
        try {
            const params = new URLSearchParams();
            if (filters.difficulty) params.append('difficulty', filters.difficulty);
            if (filters.category) params.append('category', filters.category);
            if (filters.limit) params.append('limit', filters.limit);

            const response = await fetch(`${config.BACKEND_URL}/api/problems?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch problems');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching problems:', error);
            throw error;
        }
    }

    /**
     * Fetch problems assigned to a room
     */
    static async fetchRoomProblems(roomId) {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/problems/room/${roomId}/all`);
            if (!response.ok) {
                throw new Error('Failed to fetch room problems');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching room problems:', error);
            throw error;
        }
    }

    /**
     * Submit solution for testing and AI verification
     */
    static async submitSolution(problemId, code, language, userId, userName, roomId) {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code,
                    language,
                    userId,
                    userName,
                    roomId
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to submit solution');
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting solution:', error);
            throw error;
        }
    }

    /**
     * Get AI-generated hint
     */
    static async getHint(problemId, attemptedCode = null, difficulty = 'Medium') {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/hint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    attemptedCode,
                    difficulty
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get hint');
            }

            const data = await response.json();
            return data.hint;
        } catch (error) {
            console.error('Error getting hint:', error);
            throw error;
        }
    }

    /**
     * Get solution approach
     */
    static async getApproach(problemId) {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/approach`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get approach');
            }

            const data = await response.json();
            return data.approach;
        } catch (error) {
            console.error('Error getting approach:', error);
            throw error;
        }
    }

    /**
     * Save team discussion
     */
    static async saveDiscussion(problemId, roomId, type, content, userId, userName, userAvatar = null) {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/discussion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    roomId,
                    type,
                    content,
                    userId,
                    userName,
                    userAvatar
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save discussion');
            }

            return await response.json();
        } catch (error) {
            console.error('Error saving discussion:', error);
            throw error;
        }
    }

    /**
     * Fetch discussions for a problem
     */
    static async fetchDiscussions(problemId, roomId = null, type = null) {
        try {
            const params = new URLSearchParams();
            if (roomId) params.append('roomId', roomId);
            if (type) params.append('type', type);

            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/discussions?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch discussions');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching discussions:', error);
            throw error;
        }
    }

    /**
     * Fetch submission history
     */
    static async fetchSubmissions(problemId, userId = null, roomId = null, limit = 10) {
        try {
            const params = new URLSearchParams();
            if (userId) params.append('userId', userId);
            if (roomId) params.append('roomId', roomId);
            params.append('limit', limit);

            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/submissions?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch submissions');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching submissions:', error);
            throw error;
        }
    }

    /**
     * Assign problem to a room
     */
    static async assignProblemToRoom(problemId, roomId) {
        try {
            const response = await fetch(`${config.BACKEND_URL}/api/problems/${problemId}/assign-to-room`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ roomId })
            });

            if (!response.ok) {
                throw new Error('Failed to assign problem to room');
            }

            return await response.json();
        } catch (error) {
            console.error('Error assigning problem:', error);
            throw error;
        }
    }
}

export default ProblemService;
