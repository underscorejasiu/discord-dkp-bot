import config from 'config';
import { Formatters, Message } from 'discord.js';
import { Command } from '../models/command.type';
import { InvalidUsageError } from '../models/invalid-ussage-error.model';
import { checkIfSufficientPermissions } from '../guards/permissions.guard';
import { Permissions } from '../models/dkp-permissions';
import { prohibitDms } from '../guards/dm.guard';
import { addSpending } from '../handlers/spending/add-spending.handler';

const commandName = 'spending';

export const spendingCommand: Command = {
    name: commandName,
    description: `Command group for dkp spendings.
${Formatters.inlineCode(
    `${config.get(
        'discord.prefix'
    )}${commandName} add \`<spending-name>\` (formated as single line code block) <@mentions>`
)} add spending to person account. Returns <spending-id>.
${Formatters.inlineCode(
    `${config.get(
        'discord.prefix'
    )}${commandName} remove <spending-id> <@mention>`
)} remove spending from person account.
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} list <@mention>`
)} list person spendings.
`,
    async execute(msg: Message, args: string[]) {
        prohibitDms(msg);

        if (args[0] === 'add') {
            await checkIfSufficientPermissions(msg, Permissions.Banker);
            return msg.reply(await addSpending(msg));
        }

        // if (args[0] === 'delete') {
        //     await checkIfSufficientPermissions(msg, Permissions.Banker);
        //     return msg.reply(await unregisterChannel(msg));
        // }
        // if (args[0] === 'list') {
        //     return listChannels(msg);
        // }

        throw new InvalidUsageError(
            'Invalid command, send `!help` for list of available commands.'
        );
    },
};
