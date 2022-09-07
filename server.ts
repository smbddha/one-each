import dotenv from "dotenv";
import express from "express";
import { body, validationResult } from "express-validator";
import * as Eta from "eta";
import requestIp from "request-ip";

import { zip } from "underscore";

import { ip_to_int } from "./utils";

const mysql = require("mysql");

dotenv.config();

function createFromMysql(mysql_string: string) {
  let t,
    res = null;

  console.log("STRING ", Object.keys(mysql_string));
  console.log(typeof mysql_string);
  t = mysql_string.split(/[- :Z]/);
  console.log("SPLIT", t);

  //@ts-ignore
  res = new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);

  return res;
}

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

const periodMap: Record<string, PeriodsEnum> = {
  "8h": PeriodsEnum.eight_hours,
  "24h": PeriodsEnum.day,
  "7d": PeriodsEnum.week,
  "30d": PeriodsEnum.month,
  "1y": PeriodsEnum.year,
};

const PORT = process.env.PORT || 3000;

const msg_query = "SELECT * FROM messages WHERE ip = ?";
const get_msg = (nip: number, callback: (res: any) => void) => {
  // const [err, results, _] = await conn.query(msg_query, nip);
  // console.log(err)
  // if (err) {
  //     console.log("query error");
  //     return "";
  // }

  // return results;

  conn.query(
    { sql: msg_query, values: [nip] },
    function (err: any, results: any, fields: any) {
      if (err) throw err;

      console.log(results);

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

app.engine("eta", Eta.renderFile);
app.set("view engine", "eta");
app.set("views", "./templates");

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

    // for (let p in PeriodsEnum) {
    //   messages.push({
    //     label: p as string,
    //     text: "",
    //     time: null,
    //   });
    // }

    get_msg(nip, (results) => {
      let messages: any = [];

      let r = {
        ip: nip,
        messages: messages,
      };

      // TODO transform time to time lj

      for (let p in PeriodsEnum) {
        let a = PeriodsEnum[p as keyof typeof PeriodsEnum];
        // console.log(p, a);

        messages.push({
          label: a,
          text: results[0][`${a}_msg`] ?? "",
          time: results[0][`${a}_time`] ?? null,
        });
      }

      r = {
        ip: results.ip,
        messages: messages,
      };

      // console.log("R", r);

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

    console.log({ period });

    // TODO validate period here ...
    // or in insert message

    // let p: PeriodsEnum = ;
    let p = periodMap[period];
    if (!p) {
      console.log("INVALID PERIOD");
      return res.redirect("/");
    }

    console.log({ p });

    const cip = req?.clientIp;
    if (cip !== undefined) {
      const ipv4_ip = cip.split(":").pop();
      const nip = ip_to_int(ipv4_ip!);

      get_msg(nip, (results) => {
        if (results.length === 0) {
          // return error response
          return res.redirect("/");
        }

        let isValid = false;

        // TODO decide whether you want it to be not just
        // on the same day but after x amount of time has past

        console.log("WHATTTT");

        console.log("p", p);
        console.log(typeof p);

        let now = new Date();
        switch (p) {
          case PeriodsEnum.eight_hours:
            console.log("HERE");
            if (results[0][`${period}_msg`]) {
              // let then = createFromMysql(results[0][`${period}_time`]);
              // console.log(then);

              let then = results[0][`${period}_time`];
              if (!then) {
                console.log("WHYYYY");
                isValid = true;
                break;
              }

              console.log("HEREEEEE");

              //@ts-ignore
              let d = Math.abs((now - then) as number);
              console.log("DIFF", d);

              isValid = d >= 1000 * 60 * 60 * 8;
            } else {
              isValid = true;
            }
            break;
          case PeriodsEnum.day:
            console.log("DAY");
            if (results[0][`${period}_msg`]) {
              // let then = createFromMysql(results[0][`${period}_time`]);
              let then = results[0][`${period}_time`];
              if (!then) {
                return false;
              }

              //@ts-ignore
              let d = Math.abs((now - then) as number);

              const diffDays = Math.ceil(d / (1000 * 60 * 60 * 24));

              isValid = diffDays >= 1;
            } else {
              isValid = true;
            }
            break;
          case PeriodsEnum.week:
            console.log("week");
            if (results[0][`${period}_msg`]) {
              let then = createFromMysql(results[0][`${period}_time`]);
              if (!then) {
                return false;
              }

              //@ts-ignore
              let d = Math.abs((now - then) as number);

              const diffWeeks = Math.ceil(d / (1000 * 60 * 60 * 24 * 7));

              isValid = diffWeeks >= 1;
            } else {
              isValid = true;
            }
            break;
          case PeriodsEnum.month:
            console.log("MONT");
            if (results[0][`${period}_msg`]) {
              let then = createFromMysql(results[0][`${period}_time`]);
              if (!then) {
                return false;
              }

              //@ts-ignore
              let d = Math.abs((now - then) as number);

              const diffMonths = Math.ceil(d / (1000 * 60 * 60 * 24 * 30));

              isValid = diffMonths >= 1;
            } else {
              isValid = true;
            }
            break;
          case PeriodsEnum.year:
            console.log("YEAR");
            if (results[0][`${period}_msg`]) {
              let then = createFromMysql(results[0][`${period}_time`]);
              if (!then) {
                return false;
              }

              //@ts-ignore
              let d = Math.abs((now - then) as number);

              const diffYears = Math.ceil(d / (1000 * 60 * 60 * 24 * 365));

              isValid = diffYears >= 1;
            } else {
              isValid = true;
            }
            break;
          default:
            console.log("NOT RECOGNIZED");
        }

        console.log("AND THEN");

        if (isValid) {
          console.log("inserting message");
          insert_msg(nip, p, message, () => {
            return res.redirect("/");
          });
        } else {
          console.log("INVALID");

          return res.redirect("/");
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
