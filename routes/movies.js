var express = require('express');
var router = express.Router();
const {dbQuery} = require('../models');
// let dbUser = await dbQuery("GET", "SELECT * FROM user WHERE email = ?", [email]);
// dbUser = dbUser.row[0];

router.get('/', async (req, res, next) => {
    console.log(req.body);
    let sql = "SELECT * FROM `movie` WHERE production_status = '개봉'";
    let params = [];
    try {
        let queryRes = await dbQuery("GET", sql, params);
        // console.log(queryRes);
        res.json({movies: queryRes.row});
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
});
// SELECT * FROM `movie_review` WHERE movie_id = "20194501"
router.get('/genore', async (req, res, next) => {
    // console.log(req.body);
    let sql = "SELECT * FROM `movie` WHERE production_status = '개봉' AND genore LIKE '%"+req.body.genore+"%'"; 
    let params = [];
    try {
        let queryRes = await dbQuery("GET", sql, params);
        // console.log(queryRes);
        res.json({movies: queryRes.row});
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
});

// router.get('/review', async (req, res, next) => {
//     // console.log(req.body);
//     let sql = "SELECT * FROM `movie_review` WHERE movie_id = ?"; 
//     let params = [req.body.movie_id];
//     try {
//         let queryRes = await dbQuery("GET", sql, params);
//         // console.log(queryRes);
//         res.json({reviews: queryRes.row});
//     } catch (err) {
//         console.log(err);
//         res.json({error: err});
//     }
//     // res.json({state: queryRes.state});
// });

router.get('/rank', async (req, res, next) => {
    // console.log(req.body);
    let sql = "SELECT a.*,b.* FROM `movie` a, `movie_score` b where a.movie_id = b.movie_id AND DATE_FORMAT(now(), '%Y-%m-%d')  = left(b.created, 10) order by b.reservation_rate desc"; 
    let params = [];
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

router.get('/review', async (req, res, next) => {
    // console.log(req.body);
    let sql = "SELECT * FROM `movie_review` WHERE movie_id = ? ORDER BY like_num DESC"; 
    let params = [req.body.movie_id];
    try {
        let queryRes = await dbQuery("GET", sql, params);
        // console.log(queryRes);
        res.json({reviews: queryRes.row});
    } catch (err) {
        console.log(err);
        res.json({error: err});
    }
    // res.json({state: queryRes.state});
});

// SELECT a.*,b.* FROM `movie` a,
// `movie_score` b 
// where a.movie_id = b.movie_id AND
// DATE_FORMAT(now(), '%Y-%m-%d')  = left(b.created, 10)
// order by b.reservation_rate desc

module.exports = router;