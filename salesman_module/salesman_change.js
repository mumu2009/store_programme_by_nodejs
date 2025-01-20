

function startsalesman_change(){
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
    


    function traverseDirectory(dir, fileList = []) {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // 如果是目录，递归遍历
                traverseDirectory(filePath, fileList);
            } else {
                // 如果是文件，将文件名添加到数组中
                fileList.push(filePath);
            }
        });

        return fileList;
    }




    
// 引入 multer 模块，用来处理文件上传
    const multer = require('multer');
    

    // 配置 multer 存储选项
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, '../uploads/'); // 设置上传文件的目录
        },
        filename: function (req, file, cb) {
            cb(null,req.cookie.username+Date.now()); // 重命名文件以避免冲突
        }
    });

    // 配置文件过滤器
    const fileFilter = (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images Only!');
        }
    };

    // 初始化 multer
    const upload = multer({
        storage: storage,
        fileFilter: fileFilter
    });
    logger.info('['+Date.now()+']successfully started multer')
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
    app.post('/manage_good',(req,res)=>{
        var cookies=req.cookies;
        res.writeHead(200,{'content-type':'text/html','Content-Encoding':'utf-8'});
        if(cookies.type!=='salesman'){
            res.status(403).send('You are not authorized');
            return;
        }
        var body=req.body;
        if(body.action==='add'){
            var sql='INSERT INTO goods (name,have_photo,description,belong_to,view_time,price) VALUES (?,?,?,?,?,?);update user set things[?]=?';
            if(body.product_image===null){
                var params=[body.product_name,0,body.description,req.cookies.username,body.product_view_time,body.product_price,body.product_name,body.product_description]
                executeQuery(sql,params).then(result=>{
                    res.send('<script>Window.alert("success");Window.location.href="http://127.0.0.1:3000/";</script>');
                }).catch(err=>{
                    res.status(500).send('Internal Server Error');
                    logger.error('['+Date.now()+']error:'+err)
                })
            }else{
                params=[body.product_name,1,body.description,req.cookies.username,body.product_view_time,body.product_price,body.product_name,body.product_description]
                executeQuery(sql,params).then(result=>{
                    res.send('<script>Window.alert("success");Window.location.href="http://127.0.0.1:3000/";</script>');
                }).catch(err=>{
                    res.status(500).send('Internal Server Error');
                    logger.error('['+Date.now()+']error:'+err)
                })
            }

        }else if(body.action==='remove'){
            sql='DELETE FROM goods WHERE name=?;update user set things[?]=null';
            params=[body.product_name,body.product_name];
            var shouddelete=new RegExp('^'+body.product_name+'*$')
            var listoformove=traverseDirectory('../uploads/');
            for(let i=0;i<listoformove.length;i){
                if(shouddelete.test(listoformove[i])){
                    fs.rmSync(listoformove[i]);
                }
            }
            executeQuery(sql,params).then(result=>{
                res.send('<script>Window.alert("success");Window.location.href="http://127.0.0.1:3000/";</script>');
            }).catch(err=>{
                res.status(500).send('Internal Server Error');
                logger.error('['+Date.now()+']error:'+err)
            })

        }
        else if(body.action==='update'){
            var tmpJSON
            if(body.product_image===null){
                sql='select things from users where type=salesman and name=?'
                params=[body.name]
                
                executeQuery(sql,params).then((err,result)=>{
                    if(err){
                        res.status(500).send('Internal Server Error');
                        logger.error('['+Date.now()+']error:'+err)
                    }else{
                        tmpJSON=result[0].things
                        if(tmpJSON===null){
                            tmpJSON={}
                        }else{
                            tmpJSON=JSON.parse(tmpJSON)
                        }
                        
                        
                    }

                })
                tmpJSON[body.product_name]=body.product_description
                sql='UPDATE goods SET have_photo=?,description=?,belong_to=?,price=? WHERE name=?;update user set things=? where name=?;';
                params=[0,body.description,req.cookies.username,body.product_price,body.product_name,tmpJSON,req.cookies.username]
                executeQuery(sql,params).then(result=>{
                    res.send('<script>Window.alert("success");Window.location.href="http://127.0.0.1:3000/";</script>');
                }).catch(err=>{
                    res.status(500).send('Internal Server Error');
                    logger.error('['+Date.now()+']error:'+err)
                })
            }else{
                sql='select things from users where type=salesman and name=?'
                params=[body.name]
                
                executeQuery(sql,params).then((err,result)=>{
                    if(err){
                        res.status(500).send('Internal Server Error');
                        logger.error('['+Date.now()+']error:'+err)
                    }else{
                        tmpJSON=result[0].things
                        if(tmpJSON===null){
                            tmpJSON={}
                        }else{
                            tmpJSON=JSON.parse(tmpJSON)
                        }
                        
                        
                    }

                })
                sql='UPDATE goods SET have_photo=?,description=?,belong_to=?,price=? WHERE name=?;update user set things=?where name=?;';
                params=[1,body.description,req.cookies.username,body.product_price,body.product_name,tmpJSON,req.cookies.username]
                var imgpath='../uploads/'
                var imgnamelist=traverseDirectory(imgpath);
                for(var i=0;i<imgnamelist.length;){
                    if(imgnamelist[i].includes(body.product_name)){
                        
                        var isnew=new RegExp('^'+body.new_product_name+Date.now()+'*$')
                        if(!isnew.test(imgnamelist[i])){
                            fs.rmSync(imgpath+imgnamelist[i],function(){
                                res.send('<script>Window.alert("success");Window.location.href="http://127.0.0.1:3000/";</script>')
                            })

                        }
                    }
                }  
            }
        }
        else{
            res.status(400).send('Invalid action');
            return;
        }
        res.end();
    }).listen(4000);
    //关闭MySQL连接池
    closeConnectionPool(pool);
    
    
}
module.exports.startsalesman_change = startsalesman_change();