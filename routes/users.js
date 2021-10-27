var express = require('express');
const {init: dbInit, dbQuery, getTodayMovies} = require("../controllers/dbController");
var router = express.Router();
const fs = require('fs');
const { formDataUpload } = require('../CommenUtil');
const { session } = require('passport');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/review', async function(req, res, next) {
  console.log(req.user);
  if(req.user) { // 유저 로그인 중
    let movieSql = "SELECT * FROM `movie` WHERE movie_id in(SELECT DISTINCT movie_id FROM `movie_review` WHERE writer = ?)";
    let reviewSql = "SELECT * FROM `movie_review` WHERE writer = ?";
    try {
        let movieQueryRes = await dbQuery("GET", movieSql, [req.user.id]);
        let reviewQueryRes = await dbQuery("GET", reviewSql, [req.user.id]);
        res.json({movies: movieQueryRes.row, reviews: reviewQueryRes.row});
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
  } else {
    res.status(201).json({result: 0});
  }
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



// id, name, pwd, prifile_url (file)
router.post('/signup', formDataUpload.single('img'), async (req, res, next) => {
  try {
    console.log(req.file);
    let sql = "INSERT INTO user(id, name, pwd, profile_url) VALUES (?,?,?,?)";
    let params = [req.body.id, req.body.name, req.body.pwd, req.file.key];
    // let params = [req.body.id, req.body.name, req.body.pwd, req.file.filename];
    let queryRes = await dbQuery("INSERT", sql, params);
    console.log(queryRes);

    res.json({state: queryRes.state});
  } catch (error) {
    console.log(error);
  }
  
});

// SELECT * FROM movie_review WHERE LENGTH(comment) < 1


const{searchSqlFilter} = require('../controllers/filterController');
router.get('/search', async (req, res, next) => {
  console.log(req.user);
  if(req.user) { // 유저 로그인 중
    let params = req.query; // req.body.text
    let sql = "SELECT DISTINCT a.* " + 
        "FROM (SELECT * FROM `movie` WHERE movie_id in(SELECT DISTINCT movie_id FROM `movie_review` WHERE writer = 'testerff')) as a, " +
        "`movie_genore` as b, " +
        "`movie_rated` as c WHERE " ;
    try {
        let searchSqlText = searchSqlFilter(sql, params);
        console.log(searchSqlText);
        if(searchSqlText == null) {
            res.json({error: "serch 대상이 없음"});
        } else {
            // console.log(sql);
            let queryRes = await dbQuery("GET", searchSqlText, params);
            // console.log(queryRes);
            res.json({movies: queryRes.row});
        }
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
  } else {
    res.status(201).json({result: 0});
  }
});

module.exports = router;
