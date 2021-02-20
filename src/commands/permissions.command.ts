import config from 'config';
import { Formatters, Message } from 'discord.js';
import { Command } from '../models/command.type';
import { InvalidUsageError } from '../models/invalid-ussage-error.model';
import { checkIfSufficientPermissions } from '../guards/permissions.guard';
import { Permissions } from '../models/dkp-permissions';
import { addPermission } from '../handlers/permissions/add-permission.handler';
import { removePermission } from '../handlers/permissions/remove-permission.handler';
import { listPermissions } from '../handlers/permissions/list-permissions.handler';
import { prohibitDms } from '../guards/dm.guard';

const commandName = 'permissions';
export const permissionsCommand: Command = {
    name: commandName,
    description: `Manging roles permissions. Initial permissions needs to be configured by server owner.
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} add`
)} configuration wizard for adding permissions to roles.
${Formatters.inlineCode(
    `${config.get(
        'discord.prefix'
    )}${commandName} add <permission: ${Object.values(
        Permissions
    )}> <@&role1> ... <@&roleN>`
)} adds provided permission to mentioned roles.
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} delete`
)} configuration wizard for removing permissions from roles.
${Formatters.inlineCode(
    `${config.get(
        'discord.prefix'
    )}${commandName} delete <permission: ${Object.values(
        Permissions
    )}> <@&role1> ... <@&roleN>`
)} removes permission from provided roles.
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} list`
)} shows list of permissions with registered roles for them.
`,
    async execute(msg: Message, args: string[]) {
        prohibitDms(msg);
        if (args[0] === 'add') {
            await checkIfSufficientPermissions(msg, Permissions.RoleManager);
            return msg.channel.send(await addPermission(msg, args));
        }

        if (args[0] === 'delete') {
            await checkIfSufficientPermissions(msg, Permissions.RoleManager);
            return msg.channel.send(await removePermission(msg, args));
        }

        if (args[0] === 'list') {
            return listPermissions(msg);
        }

        throw new InvalidUsageError(
            'Invalid command, send `!help` for list of available commands.'
        );
    },
};
