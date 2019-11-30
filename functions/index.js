const functions = require('firebase-functions');
const express = require('express');
const fs = require('fs');

const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('static'))

app.get('/', (req, res) => {
    res.render('index', {
        title: "Home",
        name: "EJS"
    });
});

app.get('*', (req, res) => {
    res.send(fs.readFileSync('../public/404.html').toString());
});

exports.app = functions.https.onRequest(app);