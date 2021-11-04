/* ==== genore filter ==== */

let {dbQuery, init} = require('./dbController');

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


exports.searchSqlFilter = (sql, params) => {
    // params = req.query; (GET)
    let resultText = null;
    console.log(params);
    if(params["genore"]) {
        sql = sql + `(a.genore LIKE CONCAT("%", b.keyword , "%")) ` +
        `AND ( b.keyword = "${params["genore"]}" ) `;
    }
    
    if(params["rated"]) {
        let titlesql = `( a.memo like "%${params["rated"]}%" ) ` +
        `AND ( c.keyword = "${params["rated"]}" ) `;
        if(!params["genore"]) sql = sql + titlesql;
        else sql = sql + "AND " + titlesql;
    }

    if(params["title"]) {
        let titlesql = `( a.title like "${params["title"]}%" ) `;
        if(!params["genore"] && !params["rated"]) sql = sql + titlesql;
        else sql = sql + "AND " + titlesql;
    }

    if(params["offset"] && params["size"]) {
        let titlesql = `LIMIT ${params["offset"]}, ${params["size"]} `;
        if(params["genore"] || params["title"] || params["rated"]) sql = sql + titlesql;
        else resultText = null;
    }
    resultText = sql;
    return resultText;
};

exports.makeCountQuery = (sql) => {
  return "select count(*) 'count_num' from (" + sql + ") temp_name"; 
};