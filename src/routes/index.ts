import express from "express";
import { body, validationResult } from "express-validator";

import { ip_to_int, SuccessOrFailure } from "../utils";
import { IMessagesRepo, Messages, periodMap } from "src/domain";

// import { MessagesMySQLRepo } from "src/infra";
import { MessagesSQLiteRepo } from "src/infra";
import { insertMessage as _insertMessage } from "src/useCases";

const debug = require("debug")("SERVER");

// const db: IMessagesRepo = MessagesMySQLRepo();
const db: IMessagesRepo = MessagesSQLiteRepo();
const insertMessage = _insertMessage(db);

const router = express.Router();

router.get("/about", (_, res: express.Response) => {
  res.render("about");
});

router.get("/", async (req: express.Request, res: express.Response) => {
  debug("GET");
  // TODO validate this
  const cip = req?.clientIp;
  if (cip !== undefined) {
    //const nip = ip_to_int(cip.split(":").pop());
    const ipv4_ip = cip.split(":").pop();
    const nip = ip_to_int(ipv4_ip!);

    try {
      const sof = await db.getMessages({ ip: nip });

      // handle unfound messages

      let messages: Messages = { ip: nip, messages: [] };
      if (!sof.ok) {
        console.log("ERROR", sof);
      } else {
        messages = sof.val;
      }

      console.log(sof);
      console.log(messages);

      return res.render("index", {
        data: messages,
        clientIp: cip,
      });
    } catch (e) {
      debug(e);
      return res.redirect(`/asdfasdfsdf`);
    }
  }
});

router.post(
  "/submit-message/:period",
  body("message").isLength({ max: 255 }).escape(),
  async (req: express.Request, res: express.Response) => {
    debug("POST");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ msg: "Invalid message" });
    }

    const message = req.body.message;
    const period = req.params.period;

    // debug({ period });

    // TODO validate period here ...
    // or in insert message
    let { p, l: _ } = periodMap[period];
    if (!p) {
      console.log("INVALID PERIOD");

      // TODO add error to redirect
      return res.redirect("/");
    }

    console.log({ p });

    const cip = req?.clientIp;
    if (cip !== undefined) {
      const ipv4_ip = cip.split(":").pop();
      const nip = ip_to_int(ipv4_ip!);

      const sof: SuccessOrFailure<{}> = await insertMessage(
        nip,
        period,
        message
      );

      if (!sof.ok) {
        return res.redirect(`/?error=${p}`);
      }

      return res.redirect(`/?success=${p}`);
    }

    // TODO decide whether you want it to be not just
    // on the same day but after x amount of time has past
    console.log("couldnt getip");
    return res.redirect(`/asdfasdfsdf`);
  }
);

export default router;
