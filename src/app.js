const getLinkController = require('./controllers/getLinkController');
const getLinkListController = require('./controllers/getLinkListController');
const updateFieldController = require('./controllers/updateFieldController');
const bulkCancelController = require('./controllers/bulkCancelController');

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const https = require('https');
const fs = require('fs');
const http = require('http');

const options = {
  key: null,
  cert: null
};

/*
try {
  options.key = fs.readFileSync('/etc/letsencrypt/live/bizzaboapitest.online/privkey.pem');
  options.cert = fs.readFileSync('/etc/letsencrypt/live/bizzaboapitest.online/fullchain.pem');
} catch (err) {
  console.error('Error reading key/cert files:', err);
  // Handle the error, such as exiting the application or providing a default key/cert
}
*/
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
app.get('/fieldUpdate', (req, res) => {
    res.render('fieldUpdate.ejs');
});
app.get('/bulkCancel', (req, res) => {
  res.render('bulkCancel.ejs');
});

app.post('/', getLinkController.getMagicLink);
app.post('/linkExport', getLinkListController.getRegistrations);
app.post('/fieldUpdate', updateFieldController.updateField);

app.post('/bulkCancel', bulkCancelController.bulkTicketCancel);
app.post('/cancel-bulk-cancelation', bulkCancelController.stopBulkCancellation);


const httpsServer = http.createServer(app);

httpsServer.listen(3000, () => {
  console.log('Server is running on port 443');
});
