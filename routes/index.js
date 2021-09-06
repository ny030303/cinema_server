var express = require('express');
var router = express.Router();
const fs = require('fs');
/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(req.user);
  if(req.user) { // 유저 로그인 중
    res.status(201).json({result: req.user});
  } else {
    res.status(201).json({result: 0});
  }
});
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

const mimeTypes = {
  'png': 'image/png',
  'jpg': 'image/jpg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'wav': 'audio/wav',
  'mp4': 'video/mp4',
  'json': 'application/json'
};

//192.168.31.31:54000/images/1624430805798_f5b9324a8a5b4c01977419a6e6442ab9.jpg
router.get('/images/:fileName', function (req, res, next) {
  // __dirname.split('router')[0] + 'public/uploads/images/' + req.params.fileName
  let extname = String(req.params.fileName.split('.')[1].toLowerCase()); // ex. jpg, jpeg
  let contentType = mimeTypes[extname];
  fs.readFile('public/images/uploads/' + req.params.fileName, function (err, result) {
    if (err) {
      res.status(201).json({result: err});
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(result, 'utf-8');
    }
  });

});

module.exports = router;
