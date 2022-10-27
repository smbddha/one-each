import dotenv from "dotenv";
import pify from "pify";
import { Database } from "sqlite3";

import {
  SuccessOrFailure,
  Success,
  Failure,
  isOlderThanPeriod,
} from "src/utils";
import {
  GetMessagesArgs,
  InsertMessageArgs,
  Message,
  Messages,
  IMessagesRepo,
  periodMap,
  PPair,
} from "src/domain";

dotenv.config();

const sqlite3 = require("sqlite3").verbose();

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
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(ip)
);
`;

// const INSERT_SQL = `INSERT INTO messages (ip, :lmsg, :ltime) VALUES ($ip, $msg, $time) ON CONFLICT(ip) DO UPDATE SET :lmsg=$msg, :ltime=$time`;
const GET_SQL = "SELECT * FROM messages WHERE ip = $ip";

// should the connect to db method be a part of the repo type ?
export const MessagesSQLiteRepo = (sqlitedb: Database): IMessagesRepo => {
  // console.log(process.env.DBFILE);
  // const _db: Database = new sqlite3.Database(process.env.DBFILE);
  const db: any = pify(sqlitedb, { excludeMain: true, multiArgs: true });
  // db.run(CREATE_TABLES_SQL).catch((err: any) => console.log(err));

  return {
    async insertMessage(
      args: InsertMessageArgs
    ): Promise<SuccessOrFailure<{}>> {
      const { ip, message } = args;

      // console.log("inserting", ip, message, `time_${message.period}`);

      try {
        let lmsg = `msg_${message.period}`;
        let ltime = `time_${message.period}`;

        const [err, res] = await db.run(
          `
        		INSERT INTO messages (ip, ${lmsg}, ${ltime})
        		VALUES ($ip, $msg, $time)
        		ON CONFLICT(ip)
        		DO UPDATE SET ${lmsg}=$msg, ${ltime}=$time`,
          {
            $ip: ip,
            $msg: message.text,
            $time: message.time,
          }
        );

        // console.log(err, res);

        if (err) {
          console.log(err);
          return Failure(
            new Error("error inserting messages")
          ) as SuccessOrFailure<{}>;
        }

        return Success({}) as SuccessOrFailure<{}>;
      } catch (e) {
        // console.log("ERROR", e);

        return Failure(
          new Error("error inserting messages")
        ) as SuccessOrFailure<{}>;
      }
    },
    async getMessages(
      args: GetMessagesArgs
    ): Promise<SuccessOrFailure<Messages>> {
      const { ip } = args;

      const [res, err] = await db.get(GET_SQL, { $ip: ip });
      // console.log("RES", res);
      // console.log("RES", res ? res["msg_8h"] : "NOPE");

      // const msgs: [string, any][] = Object.entries(res ?? {});

      // dummy fill the messages
      const messages: Messages = {
        ip: ip,
        messages: Object.entries(periodMap).map(([k, v]: [string, PPair]) => {
          // let msg = msgs.find((a) => a[1].period === v.p);
          let text = null;
          let time = null;

          if (res !== undefined) {
            text = res[`msg_${k}`] ?? null;
            time = res[`time_${k}`] ? new Date(res[`time_${k}`]) : null;
          }

          return {
            label: k,
            period: v.p,
            text: text ?? "",
            time: time,
            editable: !text ? true : isOlderThanPeriod(v.p, time ?? new Date()),
          } as Message;
        }),
      };

      return Success(messages) as SuccessOrFailure<Messages>;
    },
  };
};
