import util from "util";
import { SuccessOrFailure, Success, Failure } from "utils";
import { InsertMessageArgs, Messages, IMessagesRepo } from "domain";
import { GetMessagesArgs } from "domain";

const INSERT_SQL =
  "INSERT INTO messages (ip, $lmsg, $ltime) VALUES ($ip, $msg, $time) ON DUPLICATE KEY UPDATE $lmsg=$msg, $ltime=$time";
const GET_SQL = "SELECT * FROM messages WHERE ip = $ip";

// should the connect to db method be a part of the repo type ?
export const MessagesSQLiteRepo = (): IMessagesRepo => {
  const sqlite3 = require("sqlite3").verbose();
  const db = new sqlite3.Database(":memory:");

  return {
    async insertMessage(
      args: InsertMessageArgs
    ): Promise<SuccessOrFailure<Messages>> {
      const { ip, message } = args;
      const insert = util.promisify(
        db.run(INSERT_SQL, {
          $ip: ip,
          $lmsg: `${message.period}_msg`,
          $msg: message.text,
          $ltime: `${message.period}_time`,
          $time: message.time,
        })
      );

      const [err, res] = await insert();

      if (err) {
        return Failure(
          new Error("error inserting messages")
        ) as SuccessOrFailure<{}>;
      }

      return Success(res) as SuccessOrFailure<{}>;
    },
    async getMessages(
      args: GetMessagesArgs
    ): Promise<SuccessOrFailure<Messages>> {
      const { ip } = args;

      const get = util.promisify(db.get(GET_SQL, { $ip: ip }));

      const messages = await get();

      db.run();

      return Success({}) as SuccessOrFailure<Messages>;
    },
  };
};
