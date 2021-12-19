import dotenv from "dotenv";
import express from "express";
import * as Eta from "eta";
import requestIp from "request-ip";

import { ip_to_int } from "./utils";

const mysql = require("mysql");

dotenv.config();

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

const PORT = process.env.PORT || 3000;

const msg_query = "SELECT message FROM messages WHERE ip = ?";
const get_msg = async (nip: number) => {
    const [err, results, _] = await conn.query(msg_query, nip);
    if (err) {
        console.log("query error");
        return "";
    }

    return results;
};

const msg_insert = "INSERT INTO messages (ip, message) VALUES (?, ?)";
const insert_msg = async (nip: number, msg: string) => {
    const [err, results, fields] = await conn.query(msg_insert, [nip, msg]);
    if (err) {
        console.log("query error");
        return "";
    }

    return results;
};

const app = express();

app.engine("eta", Eta.renderFile);
app.set("view engine", "eta");
app.set("views", "./templates");

app.use(requestIp.mw());
app.use(express.urlencoded({ extended: true }));

app.get("/about", (_, res: express.Response) => {
    res.render("about");
});

app.get("/", async (req: express.Request, res: express.Response) => {
    // TODO validate this
    const cip = req.clientIp;
    if (!cip) {
        console.log("what");
        return;
    }

    const nip = ip_to_int(cip.split(":").pop());

    const msg = await get_msg(nip);

    res.render(msg ? "index" : "form", {
        message: msg,
        clientIp: cip,
    });
});

app.post("/submit-message", (req: express.Request, res: express.Response) => {
    const message = req.body.message;
    console.log(message);

    res.redirect("/");
});

app.use((_, res: express.Response) => {
    res.status(404).render("page404");
});

app.listen(3000, () => {
    console.log("listening on port", PORT);
});
