exports.getNowDateToYYMMDD =  () => {
    let d = new Date();
    let fomatDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString();
    return fomatDate.replace("T", " ").slice(0, -5);
}

/* ==== Local ==== */
// const multer = require('multer');
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {cb(null,'./public/images/users')},
//   filename: function (req, file, cb) { cb(null, `${Date.now()}_${file.originalname}`) }
// });
// exports.formDataUpload = multer({storage: storage});
/* ============== */

// const multerS3 = require('multer-s3');
// const multer = require('multer');
// const path = require('path');
// const AWS = require('aws-sdk');



const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

const dotenv = require('dotenv');
dotenv.config(); // env
// aws.config.loadFromPath(__dirname + '/../config/s3.json');
aws.config.update({
  "accessKeyId": process.env.AWS_ACCESS_KEY_ID,
  "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY,
  "region" : "ap-northeast-2"
});

const s3 = new aws.S3();
const upload = multer({
    storage: multerS3({
        s3: s3,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        bucket: 'cinema-s3-upload',
        acl: 'public-read',
        key: function(req, file, cb){
          console.log(file);
            cb(null, Date.now() + '.' + file.originalname.split('.').pop()); // 이름 설정
        }
    })
});
exports.formDataUpload = upload;


// const upload = multer({
//   storage: multerS3({
//       s3: AWS,
//       bucket: "cinema-s3-upload", // 버킷 이름
//       contentType: multerS3.AUTO_CONTENT_TYPE, // 자동을 콘텐츠 타입 세팅
//       acl: 'public-read', // 클라이언트에서 자유롭게 가용하기 위함
//       key: (req, file, cb) => {
//           console.log(file);
//           let extension = path.extname(file.originalname);

//           console.log(extension);
//           cb(null, Date.now().toString() + extension)
//       },
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 용량 제한
// });



// const upload = require('../modules/multer');

exports.formDataUpload = upload;




// ---------


let {dbQuery, init} = require('./controllers/dbController');
exports.filterGenoreAndInsertToTable = async () => {
  await init();
  let res = await dbQuery("GET", "SELECT DISTINCT genore FROM `movie`", []);
  let returnArr = [];
  res.row.forEach(json => {
    json.genore.split(',').forEach(word => {
      let nowWord = word.trim();
      let inWord = returnArr.find(v => v == nowWord);
      if(inWord == undefined && nowWord.trim().length > 0) returnArr.push(nowWord);
    });
  });
  returnArr.forEach(async keyword => {
    let res = await dbQuery("GET", "SELECT * FROM movie_genore WHERE keyword = ?", [keyword]);
    let isIn = res.row[0];
    console.log(isIn);
    if(!isIn) {
      let insertRes = await dbQuery("INSERT", "INSERT INTO movie_genore VALUES (?)", [keyword]);
      console.log(insertRes);
    }
  });
  // console.log(returnArr);
}