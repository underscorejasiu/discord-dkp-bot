import config from 'config';
import { Message } from 'discord.js';

const COMMAND_PATTERN = new RegExp(
    `${config.get('discord.prefix')}([a-z\-]+)(?: (.*))?`
);

export function parseCommand(msg: Message): (string | null)[] {
    return msg.content.match(COMMAND_PATTERN) || [null, null, null];
}

export function parseCommandArgs(msg: Message): string[] {
    const [, maybeCommand, rest] = parseCommand(msg);
    return rest ? rest.split(/\s+/g) : [];
}
