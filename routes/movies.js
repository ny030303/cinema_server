var express = require('express');
const { getNowDateToYYMMDD, formDataUpload } = require('../CommenUtil');
var router = express.Router();
const {init: dbInit, dbQuery, getTodayMovies} = require("../controllers/dbController");
// let dbUser = await dbQuery("GET", "SELECT * FROM user WHERE email = ?", [email]);
// dbUser = dbUser.row[0];

router.get('/', async (req, res, next) => {
    console.log(req.body);
    let sql = "SELECT * FROM `movie` WHERE production_status = '개봉' ";
    let params = req.query;
    try {
        if(params["offset"] && params["size"]) {
            sql = sql + `LIMIT ${params["offset"]}, ${params["size"]} `;
        }
        let queryRes = await dbQuery("GET", sql, []);
        // console.log(queryRes);
        res.json({movies: queryRes.row});
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
});
// get movie (영화 장르)
// SELECT * FROM `movie_review` WHERE movie_id = "20194501"
// router.get('/genore', async (req, res, next) => {
//     let params = req.query.genore; // req.body.genore
//     let sql = "SELECT * FROM `movie` WHERE production_status = '개봉' AND genore LIKE '%"+params+"%'"; 
//     try {
//         let queryRes = await dbQuery("GET", sql, []);
//         // console.log(queryRes);
//         res.json({movies: queryRes.row});
//     } catch (err) {
//         console.log(err);
//         res.json({error: err});
//     }
// });
router.get('/genore', async (req, res, next) => {
    let sql = "select keyword from movie_genore";
    try {
        let queryRes = await dbQuery("GET", sql, []);
        let arr = queryRes.row.map(v => v.keyword.trim());
        res.json({keywords: arr});
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
});

// get movie (상영중인 영화 + graph -> score 갱신되는 것을 기준으로 구별)
// SELECT a.*,b.*, c.* FROM `movie` a,
// `movie_score` b,
// `movie_graph` c
// where a.movie_id = b.movie_id AND b.movie_id = c.movie_id AND
// DATE_FORMAT(now(), '%Y-%m-%d')  = left(b.created, 10)
// order by b.reservation_rate desc
router.get('/rank', async (req, res, next) => {
    let sql = "SELECT a.*,b.*, c.* FROM `movie` a, " +
    "`movie_score` b, " +
    "`movie_graph` c " +
    "where a.movie_id = b.movie_id AND b.movie_id = c.movie_id AND "+
    "DATE_FORMAT(now(), '%Y-%m-%d')  = left(b.created, 10) " +
    "order by b.reservation_rate desc ";
    let params = req.query;
    try {
        if(params["offset"] && params["size"]) {
            sql = sql + `LIMIT ${params["offset"]}, ${params["size"]} `;
        }
        let queryRes = await dbQuery("GET", sql, []);
        // console.log(queryRes);
        queryRes.row.forEach((el,i) => {
            el.jqplot_sex = JSON.parse(el.jqplot_sex);
            el.jqplot_age = JSON.parse(el.jqplot_age);
            el.charm_point = JSON.parse(el.charm_point);
        });
        res.json({movies: queryRes.row});
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
    // res.json({state: queryRes.state});
});


// get movie (review의 rating_num 평균 높은 순 + graph)
// select a.*, b.*, c.* from movie as a,
// (SELECT movie_id, AVG(rating_num) rating_num 
//      FROM `movie_review` 
//      where rating_num != -1
//      group by movie_id) as b,
//      movie_graph as c
// where a.movie_id = b.movie_id AND b.movie_id = c.movie_id
// ORDER BY b.rating_num desc
router.get('/rating', async (req, res, next) => {
    let sql =   "select a.*, b.*, c.* from movie as a, "+
                    "(SELECT movie_id, AVG(rating_num) rating_num "+
                    "FROM `movie_review` " +
                    "where rating_num != -1 " +
                    "group by movie_id) as b," +
                    "movie_graph as c " +
                "where a.movie_id = b.movie_id AND b.movie_id = c.movie_id " +
                "ORDER BY b.rating_num desc ";
    let params = req.query;
    try {
        if(params["offset"] && params["size"]) {
            sql = sql + `LIMIT ${params["offset"]}, ${params["size"]} `;
        }
        let queryRes = await dbQuery("GET", sql, []);
        // console.log(queryRes);
        queryRes.row.forEach((el,i) => {
            el.jqplot_sex = JSON.parse(el.jqplot_sex);
            el.jqplot_age = JSON.parse(el.jqplot_age);
            el.charm_point = JSON.parse(el.charm_point);
        });
        res.json({movies: queryRes.row});
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
    // res.json({state: queryRes.state});
});

// get review (like 순)
router.get('/review', async (req, res, next) => {
    let sql = "SELECT * FROM `movie_review` WHERE movie_id = ? ORDER BY like_num DESC "; 
    let params = req.query;
    // let params = [req.body.movie_id];
    try {
        if(params["offset"] && params["size"]) {
            sql = sql + `LIMIT ${params["offset"]}, ${params["size"]} `;
        }
        let queryRes = await dbQuery("GET", sql, [req.query.movie_id]);
        // console.log(queryRes);
        res.json({reviews: queryRes.row});
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
    // res.json({state: queryRes.state});
});
/*
*/
router.put('/review/write', formDataUpload.none(), async (req, res, next) => {
    try {
        if(req.user) { // 유저 로그인 중
        let sql = "INSERT INTO `movie_review`(`movie_id`, `site`, `created`, `writer`, `comment`, `like_num`, `rating_num`)" +
        " VALUES (?,?,?,?, ?,?,?)";
        let nowDate = getNowDateToYYMMDD();
        // console.log(nowDate);
        let params = [req.body.movie_id, "this", nowDate, req.user.id, req.body.comment, 0, req.body.rating_num];
        let queryRes = await dbQuery("PUT", sql, params);
        // console.log(queryRes);
        res.json({result: queryRes.state});
        } else {
            res.status(201).json({result: 0});
        }
    }  catch (err) {
        console.log(err);
        res.json({error: err});
    }
});

router.put('/review/edit', formDataUpload.none(), async (req, res, next) => {
    try {
        if(req.user) { // 유저 로그인 중
            let sql = "UPDATE `movie_review` SET `created`=?, `comment`=?,`rating_num`=? "
            +"WHERE idx = ? AND movie_id = ? AND writer = ?";
            let nowDate = getNowDateToYYMMDD();
            // console.log(nowDate);
            let params = [nowDate, req.body.comment, req.body.rating_num, req.body.idx, req.body.movie_id, req.user.id];

            let queryRes = await dbQuery("PUT", sql, params);
            res.json({result: queryRes.state});
        } else {
            res.status(201).json({result: 0});
        }
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
});

router.put('/review/delete', formDataUpload.none(), async (req, res, next) => {
    try {
        if(req.user) { // 유저 로그인 중
            let sql = "DELETE FROM `movie_review` WHERE idx = ? AND movie_id = ? AND writer = ?";
            let params = [req.body.idx, req.body.movie_id, req.user.id];
            
            let queryRes = await dbQuery("PUT", sql, params);
            // console.log(queryRes);
            res.json({result: queryRes.state});
        } else {
            res.status(201).json({result: 0});
        }
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
});




router.get('/search', async (req, res, next) => {
    let params = req.query.text; // req.body.text
    let sql = "SELECT * FROM `movie` WHERE title LIKE '"+params+"%'";
    try {
        let queryRes = await dbQuery("GET", sql, params);
        // console.log(queryRes);
        res.json({movies: queryRes.row});
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
    // res.json({state: queryRes.state});
});

/*  키워드가 있는 영화를 검색 
    => (OR b.keyword = "${text}" 추가시 여러가지 키워드 검색 가능 */

    // SELECT DISTINCT a.* FROM `movie` as a,
    // `movie_genore` as b 
    // WHERE (a.genore LIKE CONCAT('%',b.keyword , '%'))
    // AND (
    //     b.keyword = "범죄"
    //     OR b.keyword = "사극"
    //     )
    // AND (
    //     a.title like '%블%'
    //     )
    // LIMIT 3
    
    router.get('/search/beta', async (req, res, next) => {
        let params = req.query; // req.body.text
        let sql = "SELECT DISTINCT a.* FROM `movie` as a, " +
            "`movie_genore` as b WHERE " ;
        try {
            if(params["genore"]) {
                sql = sql + `(a.genore LIKE CONCAT('%', b.keyword , '%')) ` +
                `AND ( b.keyword = "${params["genore"]}" ) `;
            }
            
            if(params["title"]) {
                let titlesql = `( a.title like '${params["title"]}%' ) `;
                if(!params["genore"]) sql = sql + titlesql;
                else sql = sql + "AND " + titlesql;
            }

            if(params["offset"] && params["size"]) {
                let titlesql = `LIMIT ${params["offset"]}, ${params["size"]} `;
                if(params["genore"] || params["title"]) sql = sql + titlesql;
                else res.json({error: "serch 대상이 없음"});
            }
            console.log(sql);
            let queryRes = await dbQuery("GET", sql, params);
            // console.log(queryRes);
            res.json({movies: queryRes.row});
        } catch (err) {
            console.log(err);
            res.json({error: err});
        }
    });

module.exports = router;