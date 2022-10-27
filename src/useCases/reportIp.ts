import { IMessagesRepo, Message, periodMap } from "src/domain";
import { Failure, SuccessOrFailure } from "src/utils";

export const reportIp =
  (reportRepo: IReportRepo) =>
  async (ip: number): Promise<SuccessOrFailure<{}>> => {
    return reportRepo.insertRepot({ ip });
  };
