
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("✅ Firebase Admin initialized with SERVICE_ACCOUNT");
        } else {
            admin.initializeApp();
            console.log("✅ Firebase Admin initialized with default credentials");
        }
    } catch (error) {
        console.error("❌ Failed to initialize Firebase Admin:", error);
        process.exit(1);
    }
}

const db = admin.firestore();

const sampleUsers = [
    {
        id: 'user1',
        data: {
            username: 'John Dev',
            email: 'john@example.com',
            points: 2500,
            totalRooms: 15,
            totalMessages: 342,
            rank: 1,
            joinedDate: new Date(),
            isOnline: false
        }
    },
    {
        id: 'user2',
        data: {
            username: 'Sarah Coder',
            email: 'sarah@example.com',
            points: 2200,
            totalRooms: 12,
            totalMessages: 298,
            rank: 2,
            joinedDate: new Date(),
            isOnline: false
        }
    }
];

const sampleProblems = [
    {
        id: 'problem1',
        data: {
            title: 'Two Sum',
            description: 'Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.',
            difficulty: 'easy',
            topic: 'Array',
            language: 'javascript',
            testCases: [
                { input: '[2,7,11,15], target = 9', expected: '[0,1]' },
                { input: '[3,2,4], target = 6', expected: '[1,2]' }
            ],
            createdAt: new Date(),
            solution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}`
        }
    },
    {
        id: 'problem2', // Added another data point
        data: {
            title: 'Palindrome Number',
            description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
            difficulty: 'easy',
            topic: 'Math',
            language: 'javascript',
            testCases: [
                { input: '121', expected: 'true' },
                { input: '-121', expected: 'false' }
            ],
            createdAt: new Date(),
            solution: `function isPalindrome(x) {
    if (x < 0) return false;
    const str = x.toString();
    return str === str.split('').reverse().join('');
}`
        }
    }
];

const sampleQuizzes = [
    {
        id: 'quiz1',
        data: {
            title: 'JavaScript Basics',
            difficulty: 'easy',
            duration: 30,
            questions: [
                {
                    id: 'q1',
                    text: 'What is 2 + 2?',
                    options: ['3', '4', '5', '6'],
                    correct: 1 // Index of '4'
                },
                {
                    id: 'q2',
                    text: 'Which is not a JS data type?',
                    options: ['Number', 'Boolean', 'Float', 'String'],
                    correct: 2
                }
            ],
            createdAt: new Date()
        }
    }
];

async function seedDatabase() {
    try {
        console.log("🌱 Starting Database Seeding...");

        // Seed Users
        for (const user of sampleUsers) {
            await db.collection('users').doc(user.id).set(user.data);
            console.log(`👤 User ${user.id} seeded.`);
        }

        // Seed Problems
        for (const problem of sampleProblems) {
            await db.collection('problems').doc(problem.id).set(problem.data);
            console.log(`🧩 Problem ${problem.id} seeded.`);
        }

        // Seed Quizzes
        for (const quiz of sampleQuizzes) {
            await db.collection('quiz').doc(quiz.id).set(quiz.data);
            console.log(`📚 Quiz ${quiz.id} seeded.`);
        }

        console.log("✅ Database Seeding Completed Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
}

seedDatabase();
