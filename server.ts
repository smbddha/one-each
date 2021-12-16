import express from 'express';
import * as Eta from 'eta';
import requestIp from 'request-ip';

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

app.get('/', (req, res) => {
    const msg = "WHAT";

    res.render("index", {
        message: msg
    });
});

app.listen(3000, () => {
    console.log('listening on port', PORT);
});
