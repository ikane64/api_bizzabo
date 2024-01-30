const getLinkController = require('./controllers/getLinkController');
const getLinkListController = require('./controllers/getLinkListController');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../public'));
app.use('/JS', express.static(path.join(__dirname, '../public/JS')));
app.use('/CSS', express.static(path.join(__dirname, '../public/CSS')));
app.use('/xls', express.static(path.join(__dirname, '../public/xls')));

app.get('/', (req, res) => {
    res.render('index.ejs');
});
app.get('/linkExport', (req, res) => {
    res.render('linkExport.ejs');
});

app.post('/', getLinkController.getMagicLink);
app.post('/linkExport', getLinkListController.getRegistrations);


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});