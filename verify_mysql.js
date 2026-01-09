const mysql = require('mysql2');

const config = {
    host: 'localhost',
    user: 'root',
    password: '2837',
};

const run = async () => {
    // 1. Connect to Server (no DB)
    let conn = mysql.createConnection(config);
    let promiseConn = conn.promise();

    try {
        await promiseConn.connect();
        console.log('Connected to MySQL Server.');

        // 2. Create Database
        await promiseConn.query('CREATE DATABASE IF NOT EXISTS codeconnect');
        console.log('Database "codeconnect" ensured.');
        await promiseConn.end();

        // 3. Connect to Database
        conn = mysql.createConnection({ ...config, database: 'codeconnect' });
        promiseConn = conn.promise();
        await promiseConn.connect();

        // 4. Create Tables
        const createUsers = `
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(191) PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            avatar TEXT,
            role ENUM('USER', 'ADMIN') DEFAULT 'USER',
            createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
            updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
        )`;

        const createRooms = `
        CREATE TABLE IF NOT EXISTS rooms (
            id VARCHAR(191) PRIMARY KEY,
            roomId VARCHAR(20) UNIQUE NOT NULL,
            code TEXT,
            language VARCHAR(50) DEFAULT 'javascript',
            createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
            updatedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
        )`;

        const createMessages = `
        CREATE TABLE IF NOT EXISTS messages (
            id VARCHAR(191) PRIMARY KEY,
            userId VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            type ENUM('TEXT') DEFAULT 'TEXT',
            timestamp DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
            roomId VARCHAR(191) NOT NULL,
            FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE
        )`;

        const createHistory = `
        CREATE TABLE IF NOT EXISTS room_history (
            id VARCHAR(191) PRIMARY KEY,
            userId VARCHAR(255) NOT NULL,
            joinedAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
            roomId VARCHAR(191) NOT NULL,
            FOREIGN KEY (roomId) REFERENCES rooms(id) ON DELETE CASCADE
        )`;

        await promiseConn.query(createUsers);
        console.log('Table users synced.');
        await promiseConn.query(createRooms);
        console.log('Table rooms synced.');
        await promiseConn.query(createMessages);
        console.log('Table messages synced.');
        await promiseConn.query(createHistory);
        console.log('Table room_history synced.');

        console.log('✅ Tables initialized from raw SQL.');
        process.exit(0);
    } catch (err) {
        console.error('Initialization Error:', err);
        process.exit(1);
    }
};

run();
