import config from 'config';
import { Formatters, Message } from 'discord.js';
import { Command } from '../models/command.type';
import { InvalidUsageError } from '../models/invalid-ussage-error.model';
import { checkIfSufficientPermissions } from '../guards/permissions.guard';
import { Permissions } from '../models/dkp-permissions';
import { prohibitDms } from '../guards/dm.guard';
import { addGroup } from '../handlers/group/add-group.handler';

const commandName = 'config';

export const configCommand: Command = {
    name: commandName,
    description: `Command group for managing configurations.
${Formatters.inlineCode(
    `${config.get(
        'discord.prefix'
    )}${commandName} add \`<config-name>\` (formated as single line code block) <@mentions>`
)} add spending to person account. Returns <spending-id>.
`,
    async execute(msg: Message, args: string[]) {
        prohibitDms(msg);

        if (args[0] === 'group' && args[1] === 'add') {
            await checkIfSufficientPermissions(msg, Permissions.RoleManager);
            return msg.reply(await addGroup(msg));
        }

        throw new InvalidUsageError(
            'Invalid command, send `!help` for list of available commands.'
        );
    },
};
