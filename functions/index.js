const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const fs = require('fs');
const path = require('path');
const bdp = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

var serviceAccount = require(path.join(path.resolve('..'), 'hardware-house-system-firebase-adminsdk-c74mv-2f51c90b3d.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://hardware-house-system.firebaseio.com",
    storageBucket: "hardware-house-system.appspot.com"
});

const db = admin.firestore();
var storage = admin.storage().bucket();
var auth = admin.auth();

app.use(bdp.urlencoded({
    extended: false
}));
app.use(bdp.json());
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('static'));

var checkAuth = function (req, res, next) {
    var token = req.headers.cookie;

    if (token == "") {
        res.render('auth/login', {
            title: "Login"
        });
    }

    try {
        var decoded = jwt.verify(token.split(" ")[1], 'Hardware_House');
    } catch (err) {
        res.render('auth/login', {
            title: "Login"
        });
    }

    req.uid = decoded;

    next();
}


app.get('/', checkAuth, (req, res) => {
    res.send(req.uid);
});

app.post('/show/all-device', checkAuth, async (req, res) => {
    res.send(req.head);
});

app.get('/confirm', checkAuth, async (req, res) => {
    res.render('borrow_device/confirm_item', {
        title: "Confirm Item",
        uid: req.uid
    });
});

app.get('/borrow-list', checkAuth, async (req, res) => {
    var data = [];

    await db.collection("borrow_data").where("user", "==", req.uid)
        .get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                data.push(doc.data());
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });

    console.log(data);

    res.render('borrow_device/borrow_list', {
        title: "Borrow List",
        uid: req.uid,
        data: data
    });
});

app.post('/save-borrow', checkAuth, async (req, res) => {
    var data = JSON.parse(req.body);

    for (var i = 0; i < data.name.length; i++) {
        await db.collection('borrow_data').doc().set({
            'item': data.name[i],
            'amount': data.amount[i],
            'borrow_date': new Date(),
            'return_date': new Date(data.return_date[i]),
            'user': req.uid,
            'receive_status': false,
            'return_status': false
        });
    }

    res.redirect('edit_profile');
});

app.get('/all-device', checkAuth, async (req, res) => {
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
        data: data,
        uid: req.uid
    });
});

app.get('/upload-file', checkAuth, async (req, res) => {
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
        data: data,
        uid: req.uid
    });
});

app.post('/reg', (req, res) => {
    db.collection("users").add({
            FirstName: req.body.first_name,
            LastName: req.body.last_name,
            StudentID: req.body.studentID,
            Password: req.body.password,
            Email: req.body.email,
            Status: false
        })
        .then(function (docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function (error) {
            console.error("Error adding document: ", error);
        });

    res.redirect('login');
});

app.post('/update_profile', checkAuth, async (req, res) => {
    var edit = db.collection("users").doc(req.uid);

    if (req.body.new_password == "") {
        edit.update({
                FirstName: req.body.first_name,
                LastName: req.body.last_name,
                Email: req.body.email,
                Status: true
            })
            .then(function () {
                console.log("Document successfully updated!");
            })
            .catch(function (error) {
                console.error("Error updating document: ", error);
            });
    } else {
        edit.update({
                FirstName: req.body.first_name,
                LastName: req.body.last_name,
                Password: req.body.new_password,
                Email: req.body.email,
                Status: true
            })
            .then(function () {
                console.log("Document successfully updated!");
                res.send(data);
            })
            .catch(function (error) {
                console.error("Error updating document: ", error);
            });
    }

    var data = [];

    await db.collection("users").doc(req.uid)
        .get().then(function (querySnapshot) {
            data.push(querySnapshot.id);
            data.push(querySnapshot.data());
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });

    res.redirect('edit_profile');
});

app.post('/login_form', async (req, res) => {
    var data = [];

    await db.collection("users").where("StudentID", "==", JSON.parse(req.body).user)
        .where("Password", "==", JSON.parse(req.body).pass)
        .get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                data.push(doc.id);
                data.push(doc.data());
            });
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });

    if (data.length == 0) {
        res.send([false, "Username/Password Wrong"]);
    } else {
        var token = jwt.sign(data[0], "Hardware_House");

        res.send([true, token]);
    }
});

app.get('/register', (req, res) => {
    res.render('auth/register', {
        title: "Home",
        name: "reg"
    });
});

app.get('/edit_profile', checkAuth, async (req, res) => {
    var data = [];
    console.log(req.uid);
    await db.collection("users").doc(req.uid)
        .get().then(function (querySnapshot) {
            // querySnapshot.forEach(function (doc) {
            //     // console.log(doc.id, " => ", doc.data());
            //     data.push(doc.id);
            //     data.push(doc.data());

            // });
            data.push(querySnapshot.id);
            data.push(querySnapshot.data());
        })
        .catch(function (error) {
            console.log("Error getting documents: ", error);
        });

    res.render('auth/edit_profile', {
        title: "Home",
        name: "edit profile",
        first_name: data[1].FirstName,
        last_name: data[1].LastName,
        studentID: data[1].StudentID,
        email: data[1].Email,
        uid: req.uid
    });
});

app.get('/login', (req, res) => {
    res.render('auth/login', {
        title: "Login"
    });
});

app.get('*', (req, res) => {
    res.send(fs.readFileSync('../public/404.html').toString());
});

exports.app = functions.https.onRequest(app);