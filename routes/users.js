var express = require('express');
const {init: dbInit, dbQuery, getTodayMovies} = require("../controllers/dbController");
var router = express.Router();
const fs = require('fs');
const { localFormDataUpload, mimeTypes } = require('../CommenUtil');
const { session } = require('passport');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//192.168.31.31:54000/images/1624430805798_f5b9324a8a5b4c01977419a6e6442ab9.jpg
router.get('/images/:fileName', function (req, res, next) {
  // __dirname.split('router')[0] + 'public/uploads/images/' + req.params.fileName
  let extname = String(req.params.fileName.split('.')[1].toLowerCase()); // ex. jpg, jpeg
  let contentType = mimeTypes[extname];
  fs.readFile('public/images/users/' + req.params.fileName, function (err, result) {
    if (err) {
      fs.readFile('public/images/resized/0000000000000_noimage.jpg', function (emptyErr, emptyRes) {
        if(emptyErr) {
          res.status(201).json({result: err});
        } else {
          res.writeHead(200, { 'Content-Type': 'image/jpg' });
          res.end(emptyRes, 'utf-8');
        }
      });
      // res.status(201).json({result: err});
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(result, 'utf-8');
    }
  });

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
/* 5. 유저의 영화 리뷰 movie_id로 따로 나오게
   6. 페이지네이션 할때 해당 정보의 개수 반환   */
router.get('/review/one', async function(req, res, next) {
  console.log(req.user);
  console.log(req.query.movie_id);
  if(req.user) { // 유저 로그인 중
    let movieSql = "SELECT * FROM `movie` WHERE movie_id = ?";
    let reviewSql = "SELECT * FROM `movie_review` WHERE writer = ? AND movie_id = ?";
    try {
        let movieQueryRes = await dbQuery("GET", movieSql, [req.query.movie_id]);
        let reviewQueryRes = await dbQuery("GET", reviewSql, [req.user.id, req.query.movie_id]);
        res.json({movie: movieQueryRes.row[0], reviews: reviewQueryRes.row});
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
router.post('/signup', localFormDataUpload.single('img'), async (req, res, next) => {
  try {
    console.log(req.file);
    let sql = "INSERT INTO user(id, name, pwd, profile_url) VALUES (?,?,?,?)";
    let params = [req.body.id, req.body.name, req.body.pwd, req.file.filename];
    // let params = [req.body.id, req.body.name, req.body.pwd, req.file.filename];
    let queryRes = await dbQuery("INSERT", sql, params);
    console.log(queryRes);
    if(queryRes.state) {
      res.json({result: {id: req.body.id, name: req.body.name, pwd: req.body.pwd, profile_url: req.file.filename}});
    } else {
      res.json({result: false});
    }
  } catch (error) {
    console.log(error);
  }
  
});

// changed_pwd
router.post('/edit', localFormDataUpload.none(), async (req, res, next) => {
  console.log(req.user);
  if(req.user) { // 유저 로그인 중
    try {
      // console.log(req.file);
      let sql = "UPDATE user SET pwd = ? WHERE id = ?";
      let params = [req.body.changed_pwd, req.user.id];
      // let params = [req.body.id, req.body.name, req.body.pwd, req.file.filename];
      let queryRes = await dbQuery("UPDATE", sql, params);
      console.log(queryRes);

      res.json({state: queryRes.state});
    } catch (error) {
      console.log(error);
    }
  } else {
    res.status(201).json({result: 0});
  }
});

// SELECT * FROM movie_review WHERE LENGTH(comment) < 1


const{searchSqlFilter, makeCountQuery} = require('../controllers/filterController');
router.get('/search', async (req, res, next) => {
  console.log(req.user);
  if(req.user) { // 유저 로그인 중
    let params = req.query; // req.body.text
    let sql = "SELECT DISTINCT a.* " + 
        `FROM (SELECT * FROM movie WHERE movie_id in(SELECT DISTINCT movie_id FROM movie_review WHERE writer = "${req.user.id}")) as a, ` +
        "`movie_genore` as b, " +
        "`movie_rated` as c WHERE " ;
    try {
        let searchSqlText = searchSqlFilter(sql, params);
        console.log(searchSqlText);
        if(searchSqlText == null) {
            res.json({error: "serch 대상이 없음"});
        } else {
          if(params["count"] == "true") {
              let countRes = await dbQuery("GET", makeCountQuery(searchSqlText), params);
              res.json({count_num: countRes.row[0].count_num});
          } else {
            // console.log(sql);
            let queryRes = await dbQuery("GET", searchSqlText, params);
            // console.log(queryRes);
            res.json({movies: queryRes.row});
          }
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
