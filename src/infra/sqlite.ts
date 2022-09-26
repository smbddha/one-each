import pify from "pify";
import util from "util";
import { SuccessOrFailure, Success, Failure } from "src/utils";
import {
  GetMessagesArgs,
  InsertMessageArgs,
  Messages,
  IMessagesRepo,
} from "src/domain";
import { Database } from "sqlite3";

const CREATE_TABLES_SQL = ` 
CREATE TABLE messages (
    ip INTEGER,
    msg_8h TEXT,
    time_8h DATETIME NULL DEFAULT NULL,
    msg_24h TEXT,
    time_24h DATETIME NULL DEFAULT NULL,
    msg_7d TEXT,
    time_7d DATETIME NULL DEFAULT NULL,
    msg_30d TEXT,
    time_30d DATETIME NULL DEFAULT NULL,
    msg_1y TEXT,
    time_1y DATETIME NULL DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_DATETIME,
    PRIMARY KEY(ip)
);
`;

const INSERT_SQL =
  "INSERT INTO messages (ip, $lmsg, $ltime) VALUES ($ip, $msg, $time) ON DUPLICATE KEY UPDATE $lmsg=$msg, $ltime=$time";
const GET_SQL = "SELECT * FROM messages WHERE ip = $ip";

// should the connect to db method be a part of the repo type ?
export const MessagesSQLiteRepo = (): IMessagesRepo => {
  const sqlite3 = require("sqlite3").verbose(); //@ts-ignore
  const db: Database = new sqlite3.Database(":memory:", (err) => {
    console.log("WHAT");
    console.log(err);
  });

  db.run(CREATE_TABLES_SQL);
  console.log(db);

  console.log(db);

  // const create_tables = util.promisify((sql) => db.run(sql));
  console.log("CREATING");
  //@ts-ignore
  // create_tables(CREATE_TABLES_SQL).then((err, res) => {
  //   console.log(err, res);
  // });

  return {
    async insertMessage(
      args: InsertMessageArgs
    ): Promise<SuccessOrFailure<Messages>> {
      const { ip, message } = args;
      const insert = util.promisify(db.run);

      //@ts-ignore
      const [err, res] = await insert([
        INSERT_SQL,
        {
          $ip: ip,
          $lmsg: `msg_${message.period}`,
          $msg: message.text,
          $ltime: `time_${message.period}`,
          $time: message.time,
        },
      ]);

      if (err) {
        return Failure(
          new Error("error inserting messages")
        ) as SuccessOrFailure<Messages>;
      }

      return Success(res) as SuccessOrFailure<Messages>;
    },
    async getMessages(
      args: GetMessagesArgs
    ): Promise<SuccessOrFailure<Messages>> {
      const { ip } = args;

      const get = util.promisify(db.get);
      //@ts-ignore
      const messages = await get(GET_SQL, { $ip: ip });

      return Success({}) as SuccessOrFailure<Messages>;
    },
  };
};
