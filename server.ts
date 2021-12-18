import dotenv from 'dotenv';
import express from 'express';
import * as Eta from 'eta';
import mysql from 'mysql';
import requestIp from 'request-ip';

dotenv.config();

// process.env.DB_USER
// process.env.DB_KEY

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
})

Eta.configure({
    plugins: [],
    cache: false
});

const PORT = process.env.PORT || 3000;

const app = express();

app.engine("eta", Eta.renderFile);
app.set("view engine", "eta");
app.set("views", "./templates");

app.use(requestIp.mw());

app.get('/', (req: express.Request, res: express.Response) => {
    const msg = "WHAT";

    // TODO validate this
    const cip = req.clientIp;

    res.render("index", {
        message: msg
    });
});

app.listen(3000, () => {
    console.log('listening on port', PORT);
});
