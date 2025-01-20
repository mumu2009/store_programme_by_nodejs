function startrootserver(){
    const express = require('express');
    const app = express();
    const bodyParser = require('body-parser');
    app.use(bodyParser.json()); // 使用 bodyParser.json() 来解析 JSON 请求体
    const logger = require('../security/logger/logger');
    const mysql = require('mysql');

    const dbconfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'store_programme'
    };

    const pool = mysql.createPool(dbconfig);

    function executeQuery(sql, params) {
        return new Promise((resolve, reject) => {
            pool.query(sql, params, function (err, result) {
                if (err) {
                    console.error('Error executing query:', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }
    app.get('/root',(req,res)=>{
        logger.info(Date.now()+'successfully start root server')
        var sql,params;
        sql='select * from user where type="customer"'
        params=[]
        executeQuery(sql,params).then(result=>{
            var customeramount=result.length;
            res.send('the amount of customers is'+customeramount);
        })
        sql='select * from user where type="salesman"'
        params=[]
        executeQuery(sql,params).then(result=>{
            var salesmanamount=result.length;
            res.send('the amount of salesman is'+selleramount);
        })
        var thepeopleamount=customeramount+salesmanamount;
        res.send('the amount of people is'+thepeopleamount);
        sql='select view from goods'
        params=[]
        var viewamount=0;
        executeQuery(sql,params).then(result=>{
            for(var i=0;i<result.length;i++){
                viewamount+=result[i].view_time;

            }
            res.send('the view time is'+viewamount);
        })


    })
    .listen(8000)
}
module.exports.startrootserver = startrootserver();