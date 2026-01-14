// Seed script to populate Firestore with initial problems
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const problems = require('./problemsData');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Initialize Firebase Admin
if (!admin.apps.length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        admin.initializeApp();
    }
}

const db = getFirestore();

async function seedProblems() {
    console.log('🌱 Starting to seed problems...\n');

    try {
        const batch = db.batch();
        let count = 0;

        for (const problem of problems) {
            const docRef = db.collection('problems').doc(problem.problemId);

            // Add timestamps
            const problemData = {
                ...problem,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            };

            batch.set(docRef, problemData);
            count++;
            console.log(`✓ Added: ${problem.title} (${problem.difficulty})`);
        }

        await batch.commit();
        console.log(`\n✅ Successfully seeded ${count} problems to Firestore!`);
        console.log('\nProblems by difficulty:');
        console.log(`  Easy: ${problems.filter(p => p.difficulty === 'Easy').length}`);
        console.log(`  Medium: ${problems.filter(p => p.difficulty === 'Medium').length}`);
        console.log(`  Hard: ${problems.filter(p => p.difficulty === 'Hard').length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding problems:', error);
        process.exit(1);
    }
}

seedProblems();
