import { SuccessOrFailure } from "src/utils";
import {
  Messages,
  InsertMessageArgs,
  GetMessagesArgs,
  Flag,
  InsertFlagArgs,
} from "./types";

export interface IMessagesRepo {
  insertMessage(args: InsertMessageArgs): Promise<SuccessOrFailure<{}>>;
  getMessages(args: GetMessagesArgs): Promise<SuccessOrFailure<Messages>>;
}

export interface IFlagRepo {
  insertFlag(args: InsertFlagArgs): Promise<SuccessOrFailure<{}>>;
  getFlags(): Promise<SuccessOrFailure<Flag[]>>;
}
