exports.getNowDateToYYMMDD =  () => {
    let d = new Date();
    let fomatDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString();
    return fomatDate.replace("T", " ").slice(0, -5);
}

// const multer = require('multer');
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {cb(null,'./public/images/users')},
//   filename: function (req, file, cb) { cb(null, `${Date.now()}_${file.originalname}`) }
// });
// exports.formDataUpload = multer({storage: storage});

const upload = require('../modules/multer');

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