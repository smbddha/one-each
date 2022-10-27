export enum PeriodsEnum {
  eight_hours = "8h",
  day = "24h",
  week = "7d",
  month = "30d",
  year = "1y",
}
export type PPair = {
  p: PeriodsEnum;
  l: number;
};

export type Message = {
  period: PeriodsEnum;
  text: String;
  time: Date;
  label?: String;
  editable?: Boolean;
};

export type Messages = {
  ip: Number;
  messages: Message[];
};

export const periodMap: Record<string, PPair> = {
  "8h": { p: PeriodsEnum.eight_hours, l: 1000 * 60 * 60 * 8 },
  "24h": { p: PeriodsEnum.day, l: 1000 * 60 * 60 * 24 },
  "7d": { p: PeriodsEnum.week, l: 1000 * 60 * 60 * 24 * 7 },
  "30d": { p: PeriodsEnum.month, l: 1000 * 60 * 60 * 24 * 30 },
  "1y": { p: PeriodsEnum.year, l: 1000 * 60 * 60 * 24 * 365 },
};

export type InsertMessageArgs = {
  ip: Number;
  message: Message;
};

export type GetMessagesArgs = {
  ip: Number;
};

/* ----- FLAGS ----- */
/* for reporting ips */

export type Flag = {
		ip: Number;
		createdAt: Date;
}

export type InsertFlagArgs = {
		ip: Number;
}

export type RemoveFlagArgs = {
		ip: Number;
}
