# Hardware House Project

ต้องลง package ก่อนใช้ เข้าไปลงในโฟลเดอร์ functions
```
cd functions
npm install
```
และลง firebase tools
```
npm i -g firebase-tools
```
## functions folder
เก็บ functions ของ firebase กับ views ของ ejs 
### functions\index.js
``` 
// เรียก module ที่จำเป็น
const functions = require('firebase-functions');
const express = require('express');
const fs = require('fs');

const app = express();

// set view และ static
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('static'))

// route ทั้งหมด
app.get('/', (req, res) => {
    res.render('index', {
        title: "Home",
        name: "EJS"
    });
});

app.get('*', (req, res) => {
    res.send(
        fs.readFileSync(
            '../public/404.html'
        ).toString()
    );
});

// export firebase function
exports.app = functions.https.onRequest(app);
```
***
### functions\static
เก็บรูป, ไฟล์ css, ไฟล์ js และอื่นๆ ที่ใช้ใน view ทั้งหมด
***
### functions\views
เก็บไฟล์ HTML ทั้งหมดที่ใช้ใน views แต่ละไฟล์คือแต่ละหน้าของเว็บ (ไม่รวมไฟล์ในโฟลเดอร์ Components)

#### components
เก็บไฟล์ ejs ที่มี code HTML เพื่อนำไปเรียกใช้ในหน้าต่าง
```
/* functions\views\components
    -- header.ejs เก็บ tag ที่อยู่ใน tag header ทั้งหมดใช้ กำหนดค่าต่าง ๆ และเรียก css และ js มาใช้
    -- navbar.ejs เป็นแถบเมนูด้านบนของเว็บ
    -- script.ejs เป็นแถบที่ไว้ใช้เก็บ js ที่เรียกใช้ในเว็บ
*/
```
# การใช้งาน
ใส่ชื่อ Project Firebase ลงใน .firebaserc
```
// .firebaserc
{
  "projects": {
    "default": "< project id ของ firebase ที่ใช้ >"
  }
}
```
ใส่รายละเอียดของ Firebase App

```
functions\views\upload\upload.ejs
var firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  };
```
