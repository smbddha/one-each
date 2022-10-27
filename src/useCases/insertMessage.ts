import { IMessagesRepo, Message, periodMap } from "src/domain";
import { Failure, SuccessOrFailure } from "src/utils";

export const insertMessage =
  (messagesRepo: IMessagesRepo) =>
  async (
    ip: number,
    period: string,
    text: string
  ): Promise<SuccessOrFailure<{}>> => {
    const sof = await messagesRepo.getMessages({ ip });
    if (!sof.ok) {
      return Failure(new Error("db error")) as SuccessOrFailure<{}>;
    }

    const message: Message = {
      period: periodMap[period].p,
      text: text,
      time: new Date(),
    };

    const messages = sof.val;
    const periodMessage = messages.messages.find(
      (v) => v.period === message.period
    );

    if (!periodMessage?.editable) {
      return Failure(
        new Error("message not editable yet")
      ) as SuccessOrFailure<{}>;
    }

    return messagesRepo.insertMessage({ ip, message });
  };
