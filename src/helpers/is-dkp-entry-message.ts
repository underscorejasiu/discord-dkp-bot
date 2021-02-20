import config from 'config';
import { Message } from 'discord.js';
import { dkpCommand } from '../commands/dkp.command';

export const isDkpEntryMessage = (msg: Message) =>
    msg.content.startsWith(`${config.get('discord.prefix')}${dkpCommand.name}`);
