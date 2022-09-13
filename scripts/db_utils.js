"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insert_msg = exports.get_msg = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const mysql = require("mysql");
const result = dotenv_1.default.config();
console.log(result);
const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_SUPER_USER,
    password: process.env.DB_SUPER_PASS,
});
const drop_table_sql = `
DROP TABLE IF EXISTS oneeach.messages;
`;
const create_database_sql = `
CREATE DATABASE oneeach;
`;
const create_table_sql = `
CREATE TABLE IF NOT EXISTS oneeach.messages (
    ip INT,
    day VARCHAR(255),
    week VARCHAR(255),
    month VARCHAR(255),
    year VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
)`;
const user_sql = `
CREATE USER IF NOT EXISTS 'oneeachRW'@'${process.env.APP_HOST}' IDENTIFIED BY '${process.env.DB_PASS}';
GRANT SELECT,INSERT ON oneach.messages TO 'oneeachRW'@'${process.env.APP_HOST}';
`;
const msg_query = "SELECT message FROM messages WHERE ip = ?";
const get_msg = (nip) => __awaiter(void 0, void 0, void 0, function* () {
    // const [err, results, _] = await conn.query(msg_query, nip);
    // console.log(err)
    // if (err) {
    //     console.log("query error");
    //     return "";
    // }
    // return results;
    const p = yield conn.query({ msg_query, values: [nip] }, function (err, results, fields) {
        if (err)
            throw err;
        return results;
    });
    return p;
});
exports.get_msg = get_msg;
const msg_insert = "INSERT INTO messages (ip, message) VALUES (?, ?)";
const insert_msg = (nip, msg) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield conn.query({ msg_insert, values: [nip, msg] }, function (err, results, fields) {
        if (err)
            throw err;
        return results;
    });
    return p;
});
exports.insert_msg = insert_msg;
const create_msg_table = (overwrite) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield conn.query(create_table_sql);
    console.log(res);
    // if (err) throw new Error("unable to create messages table");
    return true;
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    let drop_tables = false;
    let create_user = false;
    process.argv.forEach((arg) => {
        if (arg === '--drop') {
            drop_tables = true;
        }
        if (arg === '--user') {
            create_user = true;
        }
    });
    const res = yield create_msg_table(false);
    console.log(`${res ? "SUCCESS" : "FAILURE"} creating messages table`);
}))();
