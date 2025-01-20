function startsearchserver() {
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

    app.post('/search_good_*', async (req, res) => {
        logger.info(Date.now() + ' start search server');
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.write('<html><head><meta charset="utf-8"></head><body><h1>搜索结果</h1>')

        try {
            const { regexPattern } = req.body; // 从请求体中获取正则表达式模式

            if (!regexPattern) {
                return res.status(400).json({ error: '正则表达式模式不能为空' });
            }

            const sql = 'SELECT * FROM goods WHERE name REGEXP ? order by view_time desc limit 50'; // 使用 REGEXP 进行正则匹配
            const result = await executeQuery(sql, [regexPattern]);

            for (let i = 0; i < result.length; i++) {
                res.send('<p>商品名：'+result[i]['name']+'</p><br>')
                if(result[i][have_photo]=1){
                    res.send('<img src="'+'../uploads/'+result[i]['name']+'" alt="商品图片">')
                }else{res.send('<img src="../uploads/no_photo.jpg" alt="商品图片">')
}
                res.send('<p>商品描述：'+result[i]['description']+'</p><br>')
                res.send('<p>所属人：'+result[i]['belong_to']+'</p><br>')
                res.send('<p>浏览量：'+result[i]['view_time']+'</p><br>')
                res.send('<p>价格：'+result[i]['price']+'</p><br>')
            }
        } catch (error) {
            console.error('搜索出错:', error);
            logger.error(Date.now() +'search module error:'+ error);
        }
        res.end('</body></html>');
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`搜索服务器正在端口 ${PORT} 上运行`);
    });
}

module.exports.startsearchserver=startsearchserver();