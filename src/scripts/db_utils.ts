import dotenv from "dotenv";

const mysql = require("mysql");

dotenv.config();

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
});

const sql = 'CREATE TABLE messages (

) '
const create_msg_table = (overwrite: boolean) => {
    conn.query();
};
