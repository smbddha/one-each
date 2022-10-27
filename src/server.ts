import dotenv from "dotenv";
import express from "express";
import * as Eta from "eta";
import requestIp from "request-ip";

import routes from "./routes";

let EDITABLE = false;

dotenv.config();

// function mysqlDate(date = new Date()) {
//   return date.toISOString().slice(0, 19).replace("T", " ");
// }

const PORT = process.env.PORT || 3000;
const app = express();

if (process.env.NODE_ENV === "development") {
  EDITABLE = true;
}

if (process.env.NODE_ENV === "production") {}

// ------------- ETA SETUP -----------------
Eta.configure({
  plugins: [],
  cache: false,
});
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
