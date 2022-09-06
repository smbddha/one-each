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

    if (typeof mysql_string === "string") {
        t = mysql_string.split(/[- :]/);

        //@ts-ignore
        res = new Date(t[0], t[1] - 1, t[2], t[3] || 0, t[4] || 0, t[5] || 0);
    }

    return res;
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
    day = "day",
    week = "week",
    month = "month",
    year = "year",
}

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
        function(err: any, results: any, fields: any) {
            if (err) throw err;

            console.log(results, fields);

            callback(results);
            return results;
        }
    );
};

const msg_insert =
    "INSERT INTO messages (ip, ??) VALUES (?, ?) ON DUPLICATE KEY UPDATE ??=?";
const insert_msg = async (
    nip: number,
    period: PeriodsEnum,
    msg: string,
    cb: () => void
) => {
    // TODO use enum for period
    let period_column: string = period as string;
    const p = await conn.query(
        { sql: msg_insert, values: [period_column, nip, msg, period_column, msg] },
        function(err: any, results: any, fields: any) {
            if (err) throw err;

            // return results;
            cb();
        }
    );

    return p;
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

        get_msg(nip, (results) => {
            let r = {
                ip: nip,
                messages: [
                    { label: "day", text: "", time: null },
                    { label: "week", text: "", time: null },
                    { label: "month", text: "", time: null },
                    { label: "year", text: "", time: null },
                ],
            };

            if (results.length > 0) {
                r = {
                    ip: results.ip,
                    messages: [
                        { label: "day", text: results.day_msg, time: results.day_time },
                        { label: "week", text: results.week_msg, time: results.week_time },
                        {
                            label: "month",
                            text: results.month_msg,
                            time: results.month_time,
                        },
                        { label: "year", text: results.year_msg, time: results.year_time },
                    ],
                };
            }

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

        // TODO validate period here ...
        // or in insert message

        let p: PeriodsEnum = PeriodsEnum[period as keyof typeof PeriodsEnum];

        console.log(message, period);

        const cip = req?.clientIp;
        if (cip !== undefined) {
            const ipv4_ip = cip.split(":").pop();
            const nip = ip_to_int(ipv4_ip!);

            get_msg(nip, (results) => {
                if (results.length === 0) {
                    // return error response
                }

                let isValid = false;

                let now = new Date();
                switch (period) {
                    case PeriodsEnum.day:
                        let then = Date(results.day_time);
                        isValid = now.getDay();
                }

                insert_msg(nip, p, message, () => {
                    res.redirect("/");
                });
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
