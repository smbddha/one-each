import dotenv from "dotenv";
import express from "express";
import { body, validationResult } from "express-validator";
import * as Eta from "eta";
import requestIp from "request-ip";
import mysql from "mysql";

import { ip_to_int } from "./utils";

const debug = require("debug")("SERVER");

let EDITABLE = false;

dotenv.config();

// function createFromMysql(mysql_string: string) {
//   let t,
//     res = null;

//   debug("STRING ", Object.keys(mysql_string));
//   debug(typeof mysql_string);
//   t = mysql_string.split(/[- :Z]/);
//   debug("SPLIT", t);

//   //@ts-ignore
//   res = new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);

//   return res;
// }

function mysqlDate(date = new Date()) {
  // return date.toISOString().split("T")[0];
  return date.toISOString().slice(0, 19).replace("T", " ");
}

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

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
  conn.query(
    { sql: msg_query, values: [nip] },
    function (err: any, results: any, fields: any) {
      if (err) throw err;

      debug(results);

      callback(results);
      return results;
    }
  );
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

  conn.query(
    {
      sql: msg_insert,
      values: [
        period_column,
        period_time_column,
        nip,
        msg,
        t,
        period_column,
        msg,
        period_time_column,
        t,
      ],
    },
    function (err: any, results: any, fields: any) {
      if (err) throw err;

      // return results;
      cb();
    }
  );
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

app.get("/about", (_, res: express.Response) => {
  res.render("about");
});

app.get("/", async (req: express.Request, res: express.Response) => {
  // TODO validate this
  const cip = req?.clientIp;
  if (cip !== undefined) {
    //const nip = ip_to_int(cip.split(":").pop());
    const ipv4_ip = cip.split(":").pop();

    const nip = ip_to_int(ipv4_ip!);

    get_msg(nip, (results) => {
      let messages: any = [];

      let r = {
        ip: nip,
        messages: messages,
      };

      // TODO transform time to time lj

      for (let p in PeriodsEnum) {
        let a = PeriodsEnum[p as keyof typeof PeriodsEnum];
        // debug(p, a);

        console.log(
          results[0][`${a}_time`],
          a,
          isOlderThanPeriod(a, results[0][`${a}_time`])
        );

        messages.push({
          label: a,
          text: results[0][`${a}_msg`] ?? "",
          time: results[0][`${a}_time`] ?? null,
          editable: results[0][`${a}_time`]
            ? isOlderThanPeriod(a, results[0][`${a}_time`])
            : true,
        });
      }

      r = {
        ip: results.ip,
        messages: messages,
      };

      res.render("index", {
        data: r,
        clientIp: cip,
      });
    });
  }
});

app.post(
  "/submit-message/:period",
  body("message").isLength({ max: 255 }).escape(),
  (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: "Invalid message" });
    }

    const message = req.body.message;
    const period = req.params.period;

    debug({ period });

    // TODO validate period here ...
    // or in insert message

    // let p: PeriodsEnum = ;
    let { p, l: _ } = periodMap[period];
    if (!p) {
      debug("INVALID PERIOD");

      // add error to redirect
      return res.redirect("/");
    }

    debug({ p });

    const cip = req?.clientIp;
    if (cip !== undefined) {
      const ipv4_ip = cip.split(":").pop();
      const nip = ip_to_int(ipv4_ip!);

      get_msg(nip, (results) => {
        if (results.length === 0) {
          // return error response
          return res.redirect("/");
        }

        // TODO decide whether you want it to be not just
        // on the same day but after x amount of time has past
        let isValid = isOlderThanPeriod(period, results[0][`${period}_time`]);

        debug("AND THEN");

        if (isValid) {
          debug("inserting message");
          insert_msg(nip, p, message, () => {
            return res.redirect(`/?success=${p}`);
          });
        } else {
          debug("INVALID");
          return res.redirect(`/?error=${p}`);
        }
      });
    }
  }
);

app.use((_, res: express.Response) => {
  res.status(404).render("page404");
});

app.listen(3000, () => {
  console.log("listening on port", PORT);
});
