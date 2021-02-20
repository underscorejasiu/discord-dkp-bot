import config from 'config';
import { Command } from '../models/command.type';
import { event } from './event.command';
import { dkpCommand } from './dkp.command';
import { Message } from 'discord.js';
import { permissionsCommand } from './permissions.command';
import { auditCommand } from './audit.command';
import { sendText } from '../helpers/send-long-msg';
import { parseCommand } from '../helpers/parse-command';
import { channelCommand } from './channel.command';
import { spendingCommand } from './spending.command';
import { InvalidUsageError } from '../models/invalid-ussage-error.model';
import { configCommand } from './config.command';

const allCommands: { [key: string]: Command } = {
    event,
    dkpCommand,
    permissionsCommand,
    auditCommand,
    channelCommand,
    spendingCommand,
    configCommand,
};

const commandMap = new Map(
    Object.values(allCommands).map((command) => [command.name, command])
);

async function printHelp(msg: Message): Promise<Message | Message[]> {
    const commands = Object.entries(allCommands).sort(([a], [b]) => {
        if (a > b) {
            return 1;
        }
        if (a < b) {
            return -1;
        }
        return 1;
    });

    const data = [
        `**List of all commands:**`,
        ...commands.map(([, command]) => {
            return `**\`${config.get('discord.prefix')}${command.name}\`** — ${
                command.description
            }`;
        }),
    ].join('\n');

    try {
        if (msg.channel.type !== 'DM') {
            await msg.reply(
                'You should recieve DM with guide to all comands in a moment! 🎉'
            );
        }

        return await sendText(data, (partialMessage) =>
            msg.author.send(partialMessage)
        );
    } catch (error) {
        console.error(`Could not send help DM to ${msg.author.tag}.\n`, error);
        return msg.reply('Could not send help DM 😢 Do you have turn off DM?');
    }
}

export async function handleCommand(
    msg: Message,
    commands: Map<string, Command> = commandMap
): Promise<Message | Message[] | null> {
    const [, maybeCommand, rest] = parseCommand(msg);

    if (maybeCommand === 'help') {
        return printHelp(msg);
    }
    if (!maybeCommand || !commands.has(maybeCommand)) {
        throw new InvalidUsageError(
            'Invalid command, send `!help` for list of available commands.'
        );
    }

    const command = commands.get(maybeCommand) as Command;
    const args = rest ? rest.split(/\s+/g) : [];
    return await command.execute(msg, args);
}
