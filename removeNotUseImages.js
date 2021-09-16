let {dbQuery, init} = require('./controllers/dbController');
var fs = require("fs").promises;

let testFolder = "./public/images/uploads";

(async () => {
    await init();
    let res = await dbQuery("GET", "SELECT DISTINCT poster_img FROM `movie`", []);

    let filelist = await fs.readdir(testFolder);

    let removeImges = JSON.parse(JSON.stringify(filelist));
    console.log(removeImges.length);
    // console.log(filelist);
    
    res.row.forEach(m => {
        // removeImges.map( (v) => m != v);
        let useImgIdx = removeImges.findIndex(v => v == m.poster_img);
        if(useImgIdx >=0) {
            removeImges.splice(useImgIdx, 1);
        }
    });
    console.log(removeImges);

    // removeImges.forEach(img => {
    //     fs.unlink("./public/images/uploads/"+img);
    // });
    // console.log(res.row.length);
})();