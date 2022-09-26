import express from "express";

import { ip_to_int } from "../utils";
// TODO fix resolution to just domain
import { IMessagesRepo } from "domain/repo";
import { MessagesMySQLRepo } from "infra/mysql";

const debug = require("debug")("SERVER");
const db: IMessagesRepo = MessagesMySQLRepo();

const router = express.Router();

router.get("/about", (_, res: express.Response) => {
  res.render("about");
});

router.get("/", async (req: express.Request, res: express.Response) => {
  // TODO validate this
  const cip = req?.clientIp;
  if (cip !== undefined) {
    //const nip = ip_to_int(cip.split(":").pop());
    const ipv4_ip = cip.split(":").pop();

    const nip = ip_to_int(ipv4_ip!);

    const sof = await db.getMessages({ ip: nip });

    // handle unfound messages
    if (!sof.ok) {
      console.log("ERROR", sof);
    }

    console.log(sof);

    // get_msg(nip, (results) => {
    //   let messages: any = [];

    //   let r = {
    //     ip: nip,
    //     messages: messages,
    //   };

    //   // TODO transform time to time lj

    //   for (let p in PeriodsEnum) {
    //     let a = PeriodsEnum[p as keyof typeof PeriodsEnum];
    //     // debug(p, a);

    //     console.log(
    //       results[0][`${a}_time`],
    //       a,
    //       isOlderThanPeriod(a, results[0][`${a}_time`])
    //     );

    //     messages.push({
    //       label: a,
    //       text: results[0][`${a}_msg`] ?? "",
    //       time: results[0][`${a}_time`] ?? null,
    //       editable: results[0][`${a}_time`]
    //         ? isOlderThanPeriod(a, results[0][`${a}_time`])
    //         : true,
    //     });
    //   }

    //   r = {
    //     ip: results.ip,
    //     messages: messages,
    //   };

    //   res.render("index", {
    //     data: r,
    //     clientIp: cip,
    //   });
    // });

    res.render("index", {
      data: {},
      clientIp: cip,
    });
  }
});

// router.post(
//   "/submit-message/:period",
//   body("message").isLength({ max: 255 }).escape(),
//   (req: express.Request, res: express.Response) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ msg: "Invalid message" });
//     }

//     const message = req.body.message;
//     const period = req.params.period;

//     debug({ period });

//     // TODO validate period here ...
//     // or in insert message

//     // let p: PeriodsEnum = ;
//     let { p, l: _ } = periodMap[period];
//     if (!p) {
//       debug("INVALID PERIOD");

//       // add error to redirect
//       return res.redirect("/");
//     }

//     debug({ p });

//     const cip = req?.clientIp;
//     if (cip !== undefined) {
//       const ipv4_ip = cip.split(":").pop();
//       const nip = ip_to_int(ipv4_ip!);

//       get_msg(nip, (results) => {
//         if (results.length === 0) {
//           // return error response
//           return res.redirect("/");
//         }

//         // TODO decide whether you want it to be not just
//         // on the same day but after x amount of time has past
//         let isValid = isOlderThanPeriod(period, results[0][`${period}_time`]);

//         debug("AND THEN");

//         if (isValid) {
//           debug("inserting message");
//           insert_msg(nip, p, message, () => {
//             return res.redirect(`/?success=${p}`);
//           });
//         } else {
//           debug("INVALID");
//           return res.redirect(`/?error=${p}`);
//         }
//       });
//     }
//   }
// );

export default router;
