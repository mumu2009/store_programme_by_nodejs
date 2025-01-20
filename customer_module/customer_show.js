function startcustomer_show(){
    const express = require('express');
    var app = express();
    const logger=require('../security/logger/logger');
    const cookieParser = require('cookie-parser');
    const bodyParser = require('body-parser');
    const jsonParser = require('json-parser');
    const mysql = require('mysql');
    app.use(cookieParser());
    app.use(bodyParser.json());
    app.use(jsonParser);
    const dbconfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'store_programme'
    };
    
    

    const pool = mysql.createPool(dbconfig);

    // Helper function to execute queries
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
    async function startcustomerexpress(){
        app.use((req, res, next) => {
                var cookies=req.cookies
            
                var sql='SELECT * FROM users where type="customer"';
                
                executeQuery(sql, []).then((result,err)=>{
                    if(result.length===0){
                        logger.error('Error executing query:',err);
                    }else{
                        for(var i=0; i<result.length; i++){
                        if(result.name===cookies.name&&result.things!==cookies.good_list){
                            res.cookie('cart',result.things);
                            res.status(200).json(result);
                            logger.info('Successfully load cart');
        
                        }}
                    }
                }).catch(err=>{
                    console.error('Error:',err);
                    logger.error('['+Date.now()+']error:'+err)
                });
                
            }).listen(4003);
    }
    setInterval(startcustomerexpress,30000)


}
module.exports.startcustomer_show = startcustomer_show();