import dotenv from "dotenv";
import express from "express";
import { body, validationResult } from "express-validator";
import * as Eta from "eta";
import requestIp from "request-ip";
import mysql from "mysql";

import routes from "./routes";

const debug = require("debug")("SERVER");

let EDITABLE = false;

dotenv.config();

function mysqlDate(date = new Date()) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

// const conn = mysql.createConnection({
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
// });

Eta.configure({
  plugins: [],
  cache: false,
});

export enum PeriodsEnum {
  eight_hours = "8h",
  day = "24h",
  week = "7d",
  month = "30d",
  year = "1y",
}
type PPair = {
  p: PeriodsEnum;
  l: number;
};

const periodMap: Record<string, PPair> = {
  "8h": { p: PeriodsEnum.eight_hours, l: 1000 * 60 * 60 * 8 },
  "24h": { p: PeriodsEnum.day, l: 1000 * 60 * 60 * 24 },
  "7d": { p: PeriodsEnum.eight_hours, l: 1000 * 60 * 60 * 24 * 7 },
  "30d": { p: PeriodsEnum.eight_hours, l: 1000 * 60 * 60 * 24 * 30 },
  "1y": { p: PeriodsEnum.eight_hours, l: 1000 * 60 * 60 * 24 * 365 },
};

function isOlderThanPeriod(p: string, t1: Date, t2: Date = new Date()) {
  let { p: _, l } = periodMap[p];

  //@ts-ignore
  console.log(p, t2 - t1, l);

  //@ts-ignore
  return ((t2 - t1) as number) > l;
}

const PORT = process.env.PORT || 3000;

const msg_query = "SELECT * FROM messages WHERE ip = ?";
const get_msg = (nip: number, callback: (res: any) => void) => {
  // conn.query(
  //   { sql: msg_query, values: [nip] },
  //   function (err: any, results: any, fields: any) {
  //     if (err) throw err;
  //     debug(results);
  //     callback(results);
  //     return results;
  //   }
  // );
};

const msg_insert =
  "INSERT INTO messages (ip, ??, ??) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE ??=?, ??=?";
const insert_msg = async (
  nip: number,
  period: PeriodsEnum,
  msg: string,
  cb: () => void
) => {
  // TODO use enum for period
  let p: string = period as string;
  let period_column = p + "_msg";
  let period_time_column = p + "_time";

  // transform for mysql
  let t = mysqlDate();

  // conn.query(
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
};

const app = express();

if (process.env.NODE_ENV === "development") {
  // app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  EDITABLE = true;
}

if (process.env.NODE_ENV === "production") {
  // app.use(express.errorHandler());
}

app.engine("eta", Eta.renderFile);
app.set("view engine", "eta");
app.set("views", "src/templates");

app.use(requestIp.mw());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static("public"));

app.use(routes);

app.use((_, res: express.Response) => {
  res.status(404).render("page404");
});

app.listen(3000, () => {
  console.log("listening on port", PORT);
});
