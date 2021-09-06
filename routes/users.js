var express = require('express');
var {dbQuery} = require('../models');
var router = express.Router();
const fs = require('fs');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// router.post('/signup', async (req, res, next) => {
//   let sql = "INSERT INTO user(id, name, pwd, profile_url) VALUES (?,?,?,?)";
//   let params = [req.body.email, req.body.name, req.body.pwd, req.body.profile_url];
//   let queryRes = await dbQuery("INSERT", sql, params);
//   console.log(queryRes);
//   res.json({state: queryRes.state});
// });

router.post('/uploadBase64', (req, res, next) => {
  // console.log(req.body);
  let data = req.body.img.split(';');
  let file = Buffer.from(data[1].substr(7), 'base64');
  let fileName = `${Date.now()}.${data[0].split('/').pop()}`;
  fs.writeFileSync('./public/images/users' + fileName, file);
  // const uploadedFiles = req.files;
  res.json({'fileName': fileName});
});

// const multer = require('multer');
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {cb(null,'./public/images/users')},
//   filename: function (req, file, cb) { cb(null, file.originalname) }
// });

// const upload = multer({storage: storage});
// router.post('/uploadFile', upload.single('img'),(req,res) => {
//     res.json(req.file);
//     console.log(req.file);
//     // res.send(`<h1>Custom Property Value: ${req.file}</h1>`);
// });

const multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {cb(null,'./public/images/users')},
  filename: function (req, file, cb) { cb(null, `${Date.now()}_${file.originalname}`) }
});
const upload = multer({storage: storage});

// id, name, pwd, prifile_url (file)
router.post('/signup', upload.single('img'), async (req, res, next) => {
  console.log(req.file);
  let sql = "INSERT INTO user(id, name, pwd, profile_url) VALUES (?,?,?,?)";
  let params = [req.body.id, req.body.name, req.body.pwd, req.file.filename];
  let queryRes = await dbQuery("INSERT", sql, params);
  console.log(queryRes);

  res.json({state: queryRes.state});
});

module.exports = router;
