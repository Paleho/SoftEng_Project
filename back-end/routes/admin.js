const express = require('express');
const Joi = require('joi');
const router = express.Router();
const mysql = require('mysql');
require('dotenv').config()
const {authRole, authenticateToken} = require('../Authentication/basicAuth');
const conn = require('../Dbconnection/connection');

function verifyBody(body){
    const schema = Joi.object({
        email: Joi.string().min(3).required(),
        name: Joi.string().min(3).required(),
        password: Joi.string().min(8).required(),
        country: Joi.string().min(3).required(),
        city: Joi.string().min(3).required(),
        street_name: Joi.string().min(3).required(),
        street_number: Joi.number().integer().required(),
        postal_code: Joi.string().min(5).required(),
        phone_number: Joi.string().min(8).max(12).required(),
        date_of_birth: Joi.date().greater('1-1-1950').required(),
        points: Joi.number().integer().required(),
        sex: Joi.number().integer().min(0).max(2).required(),
        is_admin: Joi.number().integer().min(0).max(1).required(),
        username: Joi.string().min(3).required(),
    });

    const res = schema.validate(body);
    if(res.error) return false;
    else return true;
}

router.post('/usermod/:username/:password', authenticateToken, authRole(1), (req, res) => {
    const username = req.params.username;
    const password = req.params.password;
    //check if username appears in the database
    //add or update user accordingly

    let sql = `SELECT * FROM user WHERE username='${username}'`;

    conn.query(sql, (error, results) => {
        if (error) throw error;
        // console.log('The result is: ', results);
        if(results.length > 0){
            //update user
            let update_query = `UPDATE user SET password = '${password}' WHERE username='${username}'`;
            conn.query(update_query, (err, qres) => {
                if (err) throw err;
                console.log('The result is: ', qres);
            });
            res.send('Updated');
        }
        else{
            //create user
            if(!verifyBody(req.body)){
                res.status(400).send('give all required fields');
                return;
            }
            if(req.body.username !== username || req.body.password !== password){
                res.status(400).send('args in url and body do not match');
                return;
            }
        
            const user = {
                email: req.body.email,
                name: req.body.name, 
                password: req.body.password,
                country: req.body.country, 
                city: req.body.city, 
                street_name: req.body.street_name, 
                street_number: req.body.street_number, 
                postal_code: req.body.postal_code, 
                phone_number: req.body.phone_number, 
                date_of_birth: req.body.date_of_birth,
                points: req.body.points, 
                sex: req.body.sex, 
                is_admin: req.body.is_admin, 
                username: req.body.username
            };

            let create_query = 'INSERT INTO user SET ?';
            conn.query(create_query, user, (err, qres) => {
                if (err) throw err;
                console.log('The result is: ', qres);
            });
            res.send('Created');
        }
    });
    
});

router.get('/users/:username', authenticateToken, authRole(1), (req,res) =>{
    const username = req.params.username;
    //check if username appears in the database
    let sql = `SELECT * FROM user WHERE username='${username}'`;

    conn.query(sql, (error, results) => {
        if (error) throw error;
        if(results.length > 0){
            let thisUser = results[0];
            res.json(thisUser);
        }
        else{
            res.status(402).send('User not found');
        }
    });

});

router.get('/healthcheck', (req,res) =>{
    const conn = mysql.createConnection({
        host: 'localhost', 
        user:'back-end', 
        password: 'back-end1234',
        port: 3306,
        connectionLimit: 5,
        database: 'softeng'
    });
    conn.connect((err) =>{
        if(err){
            console.log('healthCheck error ' + err);
            res.status(402).json({status: "failed"});
            return;
        }
        console.log('MySql connected');
        res.json({status: "OK"});
    });
});

router.post('/system/sessionsupd', (req,res) =>{
    if(req.files && req.files.file){
        let file = req.files.file;
        let csvData = file.data.toString('utf8');
        let lines = csvData.split("\r\n")
        //remove first (categories) and last (empty) line 
        lines.shift();
        lines.splice(-1,1);

        let sql = `INSERT INTO charge_event (user_id, station_id, point_id, license_plate, start_time, finish_time, kwh_transferred, price, payment_method, protocol) VALUES `;

        //format sql string
        for (let i = 0; i < lines.length; i++) {
            let value = '(' + lines[i] + '),';
            sql += value;
        }
        sql = sql.slice(0, -1);
        // console.log(sql);

        conn.query(sql, (err, q_res) => {
            if (err) {
                console.log('error in csv upload: ' + err);
                res.status(400).send('error in csv upload');
            }
            else{
                //respond
                // console.log(q_res);
                let count_sql = `SELECT COUNT(*) FROM charge_event`;
                conn.query(count_sql, (err, c_res) => {
                    if (err) {
                        console.log('error in csv upload - cound query: ' + err);
                        res.status(400).send('error in csv upload');
                    }
                    else{
                        const ret_obj = JSON.parse(JSON.stringify(c_res[0])); //convert RowDataPacket to plain object
                        // console.log(ret_obj);
                        let count = 0;
                        for (var prop in ret_obj) {
                            count = ret_obj[prop];
                            break;
                        }
                        // console.log(count);
                        res.json({
                            SessionsInUploadedFile: lines.length,
                            SessionsImported: q_res.affectedRows,
                            TotalSessionsInDatabase: count
                        });
                    }
                })
            }
        });
    }
    else{
        console.log('no file');
        res.send('Please provide a file in the field name "file"');
    }
});

module.exports = router;