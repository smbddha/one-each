import dotenv from "dotenv";

const mysql = require("mysql");

const result = dotenv.config();
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
export const get_msg = async (nip: number) => {
  // const [err, results, _] = await conn.query(msg_query, nip);
  // console.log(err)
  // if (err) {
  //     console.log("query error");
  //     return "";
  // }

  // return results;

  const p = await conn.query(
    { msg_query, values: [nip] },
    function (err: any, results: any, fields: any) {
      if (err) throw err;

      return results;
    }
  );

  return p;
};

const msg_insert = "INSERT INTO messages (ip, message) VALUES (?, ?)";
export const insert_msg = async (nip: number, msg: string) => {
  const p = await conn.query(
    { msg_insert, values: [nip, msg] },
    function (err: any, results: any, fields: any) {
      if (err) throw err;

      return results;
    }
  );

  return p;
};

const create_msg_table = async (overwrite: boolean): Promise<boolean> => {
    const res = await conn.query(create_table_sql);
    console.log(res);

    // if (err) throw new Error("unable to create messages table");

    return true;
};

(async () => {

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

    const res = await create_msg_table(false);
    console.log(`${res ? "SUCCESS" : "FAILURE"} creating messages table`);
})();
