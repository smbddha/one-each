import dotenv from "dotenv";
import mysql from "mysql";
import util from "util";

import { Failure, Success, SuccessOrFailure } from "src/utils";
import {
  IMessagesRepo,
  Messages,
  GetMessagesArgs,
  InsertMessageArgs,
} from "src/domain";

const GET_SQL = "SELECT * FROM messages WHERE ip = ?";
const INSERT_SQL =
  "INSERT INTO messages (ip, ??, ??) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ??=?, ??=?";

dotenv.config();
export const MessagesMySQLRepo = (): IMessagesRepo => {
  const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });

  console.log(conn);
  console.log(process.env);

  return {
    async insertMessage(
      args: InsertMessageArgs
    ): Promise<SuccessOrFailure<Messages>> {
      const { ip, message } = args;
      const insert = util.promisify(conn.query);

      //@ts-ignore
      const [err, res] = await insert({ sql: INSERT_SQL, values: [ip] });

      if (err) {
        console.log(err);
        return Failure(
          new Error("unable to get messages")
        ) as SuccessOrFailure<Messages>;
      }

      return Success(res) as SuccessOrFailure<Messages>;
    },

    async getMessages(
      args: GetMessagesArgs
    ): Promise<SuccessOrFailure<Messages>> {
      const { ip } = args;
      const get = util.promisify(conn.query);

      console.log("HERE");
      const x = await get({ sql: GET_SQL, values: [ip] });
      console.log(x);

      // if (err) {
      //   console.log(err);
      //   return Failure(
      //     new Error("unable to get messages")
      //   ) as SuccessOrFailure<Messages>;
      // }

      return Success({}) as SuccessOrFailure<Messages>;
    },
  };
};
