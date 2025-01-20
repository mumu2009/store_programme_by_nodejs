function startcustomer_change(){
    const express = require('express');
    var app = express();
    const path=require('path');
    const fs= require('fs');
    const logger=require('../security/logger/logger');
    // 引入 cookie-parser 模块，用来解析 Cookie
    const cookieParser = require('cookie-parser');
    app.use(cookieParser());
    const bodyParser = require('body-parser');
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    const dbconfig={
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'store_programme'
    }
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

    // 引入 MySQL 连接池
    const mysql = require('mysql');
    const pool = mysql.createPool(dbconfig);
    async function closeConnectionPool(pool) {
        try {
            await pool.end();
            console.log('MySQL连接池已成功关闭');
        } catch (error) {
            console.error('关闭MySQL连接池时出错:', error);
            logger.error('['+Date.now()+']error:'+error)
            // 可以在这里添加更多的错误处理逻辑，例如重试机制或通知管理员
        }
    }
    app.post('/act_to_cart',(req,res)=>{
        var cookies=req.cookies;
        res.writeHead(200,{'content-type':'text/html','Content-Encoding':'utf-8'});
        if(cookies.type!=='customer'){
            res.status(403).send('You are not authorized');
            return;
        }
        var body=req.body;
        var sql,params,tmpJSON ;
        var username=req.cookies.username
        if(body.act==='add'){
            sql='select things from user where type="customer"&&username=?'
            params=[username];
            executeQuery(sql,params).then((result,err)=>{
                if(err){
                    console.error('Error executing query:', err);
                    res.status(500).send('Error executing query: ' + err);
                }else{
                    tmpJSON=JSON.parse(result[0].things)
                    tmpJSON[body.product_id]=body.quantity
                    sql='update user set things=? where type="customer"&&username=?'
                    params=[JSON.stringify(tmpJSON),username]
                    executeQuery(sql,params).then((result,err)=>{
                        if(err){
                            console.error('Error executing query:', err);
                            res.status(500).send('Error executing query: ' + err);
                        }else{
                            sql='update goods set view_time=view_time+1 where name=?';
                            executeQuery(sql,[body.product_id]).then((result,err)=>{
                                if(err){
                                    console.error('Error executing query:', err);
                                    res.status(500).send('Error executing query: ' + err);
                                }else{
                                    res.send('<script>Window.alert("success");Window.location.href="http://127.0.0.1:3000/";</script>');
                                    
                                }
                            });
                            
                            
                        }
                    });
                    
                }
            });
        }
        else if(body.act==='remove'){
            sql='select things from user where type="customer"&&username=?'
            params=[username];
            executeQuery(sql,params).then((result,err)=>{
                if(err){
                    console.error('Error executing query:', err);
                    res.status(500).send('Error executing query: ' + err);
                }else{
                    tmpJSON=JSON.parse(result[0].things)
                    tmpJSON[body.product_id]=0
                    sql='update user set things=? where type="customer"&&username=?'
                    params=[JSON.stringify(tmpJSON),username]
                    executeQuery(sql,params).then((result,err)=>{
                        if(err){
                            console.error('Error executing query:', err);
                            res.status(500).send('Error executing query: ' + err);
                        }else{
                            res.send('<script>Window.alert("success");Window.location.href="http://127.0.0.1:3000/";</script>'); 
                        }
                    })
                }
            })
        }
        else{
            res.status(400).send('Bad request');
        }
        res.end();
        closeConnectionPool();
    }).listen(4002)
}
module.exports.startcustomer_change=startcustomer_change()