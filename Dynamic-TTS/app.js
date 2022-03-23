const ejs = require('ejs');
const express = require('express');

const app = express();

let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.listen(port, host, () => {
    console.log('Server is running on port', port);});