function startregistserver(){
    const mysql = require('mysql');
    const express = require('express');
    const cookieParser = require('cookie-parser');
    const bodyParser = require('body-parser');
    const bcrypt = require('bcrypt');

    const app = express();
    app.use(cookieParser());
    app.use(bodyParser.json());

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

    // Function to hash passwords
    function hashPassword(password) {
        return bcrypt.hashSync(password, 10);
    }

    // Function to compare passwords
    function comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compareSync(plainPassword, hashedPassword);
    }

    app.post('/log_in_or_signup', async (req, res) => {
        try {
            const data = req.body;

            // Input validation
            if (!data.name || !data.password || !data.type) {
                return res.status(400).send('Invalid input');
            }

            const sql_select = 'SELECT * FROM users WHERE username = ?';
            const params = [data.name];
            const result = await executeQuery(sql_select, params);

            if (result.length > 0) {
                const user = result[0];
                if (comparePassword(data.password, user.password)) {
                    res.cookie('type', user.type);
                    res.cookie('username', user.username);
                    if(user.type==='salesman'){
                        res.cookie('goodlist',result['things'])

                    }else if (user.type==='root'){
                        res.cookie('root', user.name);

                    }else if (user.type==='customer'){
                        res.cookie('cart', result['things']);
                    }
                    else{
                        res.send('<script>window.alert("error");window.location.href="/";</script>');
                    }

                    res.send('<script>window.alert("Login successfully");window.location.href="/";</script>');
                } else {
                    res.send('<script>window.alert("error");window.location.href="/";</script>');
                }
            } else {
                const hashedPassword = hashPassword(data.password);
                const sql_insert = 'INSERT INTO users (username, password, type,things) VALUES (?, ?, ?,?)';
                const insertParams = [data.name, hashedPassword, data.type,{}];
                await executeQuery(sql_insert, insertParams);
                res.cookie('type', data.type);
                res.cookie('username', data.name);
                res.send('<script>window.alert("Sign up successfully");window.location.href="/";</script>');
            }
        } catch (err) {
            console.error('Error processing request:', err);
            res.status(500).send('Internal Server Error');
        }
    }).listen(4004);

    // Close the connection pool when the application is shutting down
    process.on('SIGINT', () => {
        pool.end(() => {
            console.log('Database connection pool closed.');
            process.exit(0);
        });
    });


}

module.exports.startregistserver=startregistserver();