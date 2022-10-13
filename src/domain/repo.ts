import { SuccessOrFailure } from "src/utils";
import { Messages, InsertMessageArgs, GetMessagesArgs } from "./types";

export interface IMessagesRepo {
  insertMessage(args: InsertMessageArgs): Promise<SuccessOrFailure<{}>>;
  getMessages(args: GetMessagesArgs): Promise<SuccessOrFailure<Messages>>;
}
