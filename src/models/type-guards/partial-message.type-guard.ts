import { Message, PartialMessage } from 'discord.js';

export const isPartialMessage = (
    msg: Message | PartialMessage
): msg is PartialMessage => msg.partial;
