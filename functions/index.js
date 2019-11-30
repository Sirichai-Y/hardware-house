const functions = require('firebase-functions');

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

var serviceAccount = require(path.join(path.resolve('..'), 'software-home-firebase-adminsdk-6ns6z-a1ffd465e4.json'));


var admin = require("firebase-admin");
// var user = db.collection("ussers");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://software-home.firebaseio.com"
});

var db = admin.firestore();

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('static'))

app.get('/', (req, res) => {
    res.render('index', {
        title: "Home",
        name: "EJS"
    });
});

app.post('/reg',(req,res)=>{

    // res.send(req.body);
    res.send("Register Success");
    db.collection("users").add({
        FirstName: req.body.first_name,
        LastName: req.body.last_name,
        StudentID : req.body.studentID,
        Password : req.body.password,
        Email : req.body.email,
        Status : false
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
});

app.post('/update_profile',async(req,res)=>{

    
    // res.send("Profile Updated");
    var data=[];
    
    await db.collection("users").where("StudentID", "==", "545654")
    .get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            data.push(doc.id);
            data.push(doc.data());
          
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
    var edit=db.collection("users").doc(data[0]);
    return edit.update({
        FirstName: req.body.first_name,
        LastName: req.body.last_name,
        Password : req.body.new_password,
        Email : req.body.email,
        Status : true
    })
    .then(function() {
        console.log("Document successfully updated!");
    })
    .catch(function(error) {
        // The document probably doesn't exist.
        console.error("Error updating document: ", error);
    });
    res.send(data);
});

// var data=[];

// var query = data.where("StudentID", "==", req.body.studentID);

app.post('/login_form',async(req,res)=>{
    var data=[];

    await db.collection("users").where("StudentID", "==", req.body.studentID).where("Password","==",req.body.password)
    .get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            data.push(doc.id);
            data.push(doc.data());
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
     res.send(data);
});

app.get('/register', (req, res) => {
    res.render('register', {
        title: "Home",
        name: "reg"
    });
});

app.get('/edit_profile', async(req, res) => {
    var data=[];
    
    await db.collection("users").where("StudentID", "==", "545654")
    .get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            // doc.data() is never undefined for query doc snapshots
            console.log(doc.id, " => ", doc.data());
            data.push(doc.id);
            data.push(doc.data());
          
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    });
    console.log(data[1]);
    res.render('edit_profile', {
        title: "Home",
        name: "edit profile",
        first_name:data[1].FirstName,
        last_name:data[1].LastName,
        studentID:data[1].StudentID,
        email:data[1].Email
    });
});

app.get('/login',(req,res)=>{
    // users.doc("SF").set({
    //     FirstName: "San Francisco" });
    res.render('login',{
        title:"HOME",
        name : "login"
    });
  
});

app.get('/test',(req,res)=>{
    // users.doc("SF").set({
    //     FirstName: "San Francisco" });
    res.render('test',{
        title:"HOME",
        name : "login"
    });
  
});

app.get('*', (req, res) => {
    res.send(fs.readFileSync('../public/404.html').toString());
});

exports.app = functions.https.onRequest(app);


