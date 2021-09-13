exports.getNowDateToYYMMDD =  () => {
    let d = new Date();
    let fomatDate = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString();
    return fomatDate.replace("T", " ").slice(0, -5);
}

const multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {cb(null,'./public/images/users')},
  filename: function (req, file, cb) { cb(null, `${Date.now()}_${file.originalname}`) }
});
exports.formDataUpload = multer({storage: storage});