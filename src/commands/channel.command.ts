import config from 'config';
import { Formatters, Message } from 'discord.js';
import { Command } from '../models/command.type';
import { InvalidUsageError } from '../models/invalid-ussage-error.model';
import { checkIfSufficientPermissions } from '../guards/permissions.guard';
import { Permissions } from '../models/dkp-permissions';
import { registerChannel } from '../handlers/channel/register-channel.handler';
import { unregisterChannel } from '../handlers/channel/unregister-channel.handler';
import { listChannels } from '../handlers/channel/list-channels.handler';
import { prohibitDms } from '../guards/dm.guard';

const commandName = 'channel';

export const channelCommand: Command = {
    name: commandName,
    description: `Command group for managing function channels.
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} add`
)} configuration wizard for setting function channel.
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} add #channel-name`
)} setting function channel.
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} delete`
)} configuration wizard for unregistering function channel.
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} delete #channel-name`
)} unregistering function channel.
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} list`
)} shows list of function channels.
`,
    async execute(msg: Message, args: string[]) {
        prohibitDms(msg);

        if (args[0] === 'add') {
            await checkIfSufficientPermissions(msg, Permissions.EventManager);
            return msg.reply(await registerChannel(msg));
        }

        if (args[0] === 'delete') {
            await checkIfSufficientPermissions(msg, Permissions.EventManager);
            return msg.reply(await unregisterChannel(msg));
        }
        if (args[0] === 'list') {
            return listChannels(msg);
        }

        throw new InvalidUsageError(
            'Invalid command, send `!help` for list of available commands.'
        );
    },
};
