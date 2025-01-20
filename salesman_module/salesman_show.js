function startsalesman_show(){
const mysql=require('mysql');
const express=require('express');
const json_parser=require('json-parser');
const body_parser=require('body-parser');
const logger=require('../security/logger/logger');
var app= express();
app.use(body_parser);
app.use(json_parser);
const dbconfig={
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'store_programme'
}
var pool=mysql.createPool(dbconfig);
function executeQuery(sql,params) {
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

async function startsalesmanexpress(){
app.use((req, res, next) => {
        var cookies=req.cookies
    
        var sql='SELECT * FROM users where type="salesman"';
        
        executeQuery(sql, []).then((result,err)=>{
            if(result.length===0){
                logger.error('Error executing query:',err);
            }else{
                for(var i=0; i<result.length; i++){
                if(result.name===cookies.name&&result.things!==cookies.good_list){
                    res.cookie('good_list',result.things);
                    res.status(200).json(result);
                    logger.info('Successfully load good_list');

                }}
            }
        }).catch(err=>{
            console.error('Error:',err);
            logger.error('['+Date.now()+']error:'+err)
        });
    
        
    }).listen(4001);
}
setInterval(startsalesmanexpress,30000)
}
module.exports.startsalesman_show = startsalesman_show();

