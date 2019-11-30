const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const fs = require('fs');
const path = require('path');
const bdp = require('body-parser');

const app = express();

var serviceAccount = require(path.join(path.resolve('..'), 'hardware-house-system-firebase-adminsdk-c74mv-2f51c90b3d.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://hardware-house-system.firebaseio.com",
    storageBucket: "hardware-house-system.appspot.com"
});

const db = admin.firestore();
var storage = admin.storage().bucket();

app.use(bdp.urlencoded({ extended: false }));
app.use(bdp.json());
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('static'))

app.get('/', (req, res) => {
    res.render('index', {
        title: "Home",
        name: "EJS"
    });
});

app.get('/', (req, res) => {
    res.send(req.body);
});

app.post('/show/all-device', async (req, res) => {
    res.send(req.body);
});

app.get('/confirm', async (req, res) => {
    res.render('borrow_device/confirm_item', {
        title: "Confirm Item"
    });
});

app.post('/save-borrow', async (req, res) => {
    var data = JSON.parse(req.body);

    for(var i = 0; i < data.name.length; i++) {
        await db.collection('borrow_data').doc().set({
            'item': data.name[i],
            'amount': data.amount[i],
            'borrow_date': new Date(),
            'return_date': new Date(data.return_date[i]),
            'user': "aa",
            'receive': false,
            'return': false
        });
    }

    res.send("Uploaded");
});

app.get('/show/all-device', async (req, res) => {
    var data = [];

    await db.collection('devices').get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                data.push({
                    id: doc.id,
                    detail: doc.data(),
                    url: ""
                });
                console.log(doc.data());
            });
        }).catch((err) => {
            console.log('Error getting documents', err);
        });

    for (var i = 0; i < data.length; i++) {
        data[i].url = await storage.file("devices/" + data[i].detail.picture).getSignedUrl({
            action: 'read',
            expires: (new Date()).setDate((new Date()).getDate() + 1)
        });
    }

    res.render('borrow_device/show_all', {
        title: "Device",
        name: "EJS",
        data: data
    });
});

app.get('/setdb', async (req, res) => {
    db.collection('users').doc().set({
        'name': 'Arduino',
        'middle': 'Mathison',
        'last': 'Turing',
        'born': 1912
    });

    res.send("All Set");
});

app.get('*', (req, res) => {
    res.send(fs.readFileSync('../public/404.html').toString());
});

exports.app = functions.https.onRequest(app);