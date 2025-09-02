const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Set up static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Assessment Grid server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});
