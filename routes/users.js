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

router.post('/signup', async (req, res, next) => {
  // console.log(req.body);
  let hashPwd;
  // let salt = await bcrypt.genSalt(saltRounds);
  // hashPwd = await bcrypt.hash(,salt);
  let sql = "INSERT INTO user(id, name, pwd, profile_url) VALUES (?,?,?,?)";
  let params = [req.body.email, req.body.name, req.body.pwd, req.body.profile_url];
  let queryRes = await dbQuery("INSERT", sql, params);
  console.log(queryRes);
  res.json({state: queryRes.state});
});

router.post('/upload', (req, res, next) => {
  // console.log(req.body);
  let data = req.body.img.split(';');
  let file = Buffer.from(data[1].substr(7), 'base64');
  let fileName = `${Date.now()}.${data[0].split('/').pop()}`;
  fs.writeFileSync('./public/images/users' + fileName, file);
  // const uploadedFiles = req.files;
  res.json({'fileName': fileName});
});

module.exports = router;
