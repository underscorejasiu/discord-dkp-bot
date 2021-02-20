import { Message, Snowflake } from 'discord.js';

export function getLastMessageId(messages: Message[]): Snowflake | null {
    const lastMsg = messages[messages.length - 1];
    return lastMsg ? lastMsg.id : null;
}
