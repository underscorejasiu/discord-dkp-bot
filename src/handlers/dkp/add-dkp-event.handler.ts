import { Message } from 'discord.js';
import { addDkpMessage } from '../../services/dkp-message.service';

export async function addDkpEvent(msg: Message): Promise<Message> {
    return await addDkpMessage(msg);
}
