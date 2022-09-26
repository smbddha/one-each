import { SuccessOrFailure } from 'utils'
import {
		Messages, InsertMessageArgs, GetMessagesArgs
} from './types';

export interface IMessagesRepo {
		insertMessage(args: InsertMessageArgs): Promise<SuccessOrFailure<Messages>>
		getMessages(args: GetMessagesArgs): Promise<SuccessOrFailure<Messages> >
}
