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
      // const msg_insert =
      //   "INSERT INTO messages (ip, ??, ??) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ??=?, ??=?";
      // const insert_msg = async (
      //   nip: number,
      //   period: PeriodsEnum,
      //   msg: string,
      //   cb: () => void
      // ) => {
      //   // TODO use enum for period
      //   let p: string = period as string;
      //   let period_column = p + "_msg";
      //   let period_time_column = p + "_time";

      //   // transform for mysql
      //   let t = mysqlDate();

      //   // conn.query(
      //   {
      //     sql: msg_insert,
      //     values: [
      //       period_column,
      //       period_time_column,
      //       nip,
      //       msg,
      //       t,
      //       period_column,
      //       msg,
      //       period_time_column,
      //       t,
      //     ],
      //   },
      //   function (err: any, results: any, fields: any) {
      //     if (err) throw err;

      //     // return results;
      //     cb();
      //   }
      // );
      //

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
