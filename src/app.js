const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mainController = require('./controllers/mainController');

const app = express();

// Body parser middleware for parsing application/x-www-form-urlencoded and application/json
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public'));

// Serve static JS and CSS files
app.use('/JS', express.static(path.join(__dirname, '../public/JS')));
app.use('/CSS', express.static(path.join(__dirname, '../public/CSS')));


// Route for the home page
app.get('/', (req, res) => {
    res.render('index.ejs');
});

// Route for handling POST requests to /magicLink
app.post('/magicLink', mainController.getMagicLink);

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
});