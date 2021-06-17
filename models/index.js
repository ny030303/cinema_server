
var mysql = require('mysql2/promise');
// require('dotenv').config();

// const uri = process.env.ATLAS_URI;
const db_info = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'cinema'
}
let pool = mysql.createPool(db_info);
let connection;

module.exports = {
    init: async () => {
        try {
            connection = await pool.getConnection(async conn => conn);
            console.log("DB connected");
        } catch (err) {
            console.log('DB err');
            console.log(err);
        }
        
    },
    dbQuery: async (type, sql, params) => {
        try {
            let result = {}; 
            // const connection = await pool.getConnection(async conn => conn);
            try {
                const [rows] = await connection.query(sql, params); // sql 쿼리문 실행
                if(type == "GET") result.row = rows;
                result.state = true;
                connection.release(); // 사용된 풀 반환
                return result;
            } catch (err) {
                console.log('Query Error');
                console.log(err);
                result.state = false;
                result.error = err;
                connection.release();
                return result;
            }
        } catch (err) {
            console.log('DB Error');
            console.log(err);
            result.state = false;
            result.error = err;
            return result;
        }
    }
};
//     connection.query('SELECT * FROM user', function (error, results, fields) {
//         if (error) {
//             console.log(error);
//         } 
//         console.log('The solution is: ', results);
//     });
