// Import modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Set the static file directory to 'public'

const secretKey = crypto.randomBytes(32).toString('hex');
console.log('Randomly generated secret key:', secretKey);

// MySQL database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test2'
});

// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Search for user in the database
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    connection.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        // If user is found and the role is Admin, login is successful
        if (results.length > 0 && results[0].role === 'Admin') {
            const token = jwt.sign({ userId: results[0].id }, secretKey, { expiresIn: '2h' });
            res.json({ token });
        } else {
            // If the user is not an Admin or not found
            res.status(401).json({ message: 'Account not found or you do not have admin privileges' });
        }
    });
});

// Middleware function to verify token
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Call the next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}

// Protected route requiring token
app.get('/protected', verifyToken, (req, res) => {
    jwt.verify(req.token, secretKey, (err, authData) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                res.status(401).json({ message: 'Token expired. Please log in again.' });
            } else {
                res.status(403).json({ message: 'Invalid token' });
            }
        } else {
            res.json({
                message: 'Protected data',
                authData
            });
        }
    });
});

// Token verification middleware
function verifyToken(req, res, next) {
    // Get token from header
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        // No token
        res.sendStatus(403);
    }
}

// RESTful API endpoint to retrieve user data from MySQL database
app.get('/api/users', (req, res) => {
    // Query to select name, email, role, lastActive from users table
    const query = 'SELECT id, name, email, role, lastActive FROM users';

    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        // Send the retrieved user data as JSON response
        res.status(200).json(results);
    });
});

// RESTful API endpoint to update user data in MySQL database
app.post('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const { newName, newEmail, newRole, newLastActive } = req.body;

    // Query to update user data in users table
    const query = 'UPDATE users SET name=?, email=?, role=?, lastActive=? WHERE id=?';

    // Execute the query
    connection.query(query, [newName, newEmail, newRole, newLastActive, userId], (err, results) => {
        if (err) {
            console.error('Error updating user:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        // Send success response
        res.status(200).json({ message: 'User data updated successfully' });
    });
});

// RESTful API endpoint to delete a user from MySQL database
app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;

    // Query to delete user from users table
    const query = 'DELETE FROM users WHERE id = ?';

    // Execute the query
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error deleting user:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        // Check if any rows were affected
        if (results.affectedRows > 0) {
            res.status(200).json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    });
});

// For any other routes, return the index.html file to enable frontend routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
