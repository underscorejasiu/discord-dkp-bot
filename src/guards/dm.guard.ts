import { Message } from 'discord.js';
import { InvalidUsageError } from '../models/invalid-ussage-error.model';

export function prohibitDms(msg: Message): null {
    if (msg.channel.type !== 'DM') {
        return null;
    }

    throw new InvalidUsageError(`Command cannot be used in DM's.`);
}
