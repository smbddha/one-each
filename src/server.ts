import dotenv from "dotenv";
import express from "express";
import * as Eta from "eta";
import requestIp from "request-ip";

import routes from "./routes";


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

const PORT = process.env.PORT || 3000;

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
// };

const app = express();

if (process.env.NODE_ENV === "development") {
  EDITABLE = true;
}

if (process.env.NODE_ENV === "production") {
}

app.engine("eta", Eta.renderFile);
app.set("view engine", "eta");
app.set("views", "src/templates");

app.use(requestIp.mw());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static("public"));

// ------------ ROUTES ---------------------
app.use(routes);
app.use((_, res: express.Response) => {
  res.status(404).render("page404");
});

// ------------ START SERVER ---------------
app.listen(3000, () => {
  console.log("listening on port", PORT);
});
