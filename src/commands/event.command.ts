import config from 'config';
import { Formatters, Message } from 'discord.js';
import { Command } from '../models/command.type';
import { InvalidUsageError } from '../models/invalid-ussage-error.model';
import { registerEvent } from '../handlers/event/register-event.handler';
import { checkIfSufficientPermissions } from '../guards/permissions.guard';
import { removeEvent } from '../handlers/event/remove-event.handler';
import { editEvent } from '../handlers/event/edit-event.handler';
import { listEvents } from '../handlers/event/list-events.handler';
import { Permissions } from '../models/dkp-permissions';
import { prohibitDms } from '../guards/dm.guard';
import { EventType } from '../models/dkp-event.type';

const commandName = 'event';
export const event: Command = {
    name: commandName,
    description: `Command group for managing dkp events.
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} add`
)} configuration wizard for setting dkp event.
${Formatters.inlineCode(
    `${config.get(
        'discord.prefix'
    )}${commandName} add <event-name> <event-type: ${Object.values(
        EventType
    )}> <type schema>`
)} setting dkp event, schema for ${EventType.Plain} is number value and for ${
        EventType.Extended
    } is json with following pattern: ${Formatters.inlineCode(
        `{value:number,levels:{name:string,value:number}[],modifiers:{name:string,value:number}[]}`
    )}
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} delete`
)} configuration wizard for removing dkp event.
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} delete <event-name>`
)} remove dkp event.
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} edit`
)} configuration wizard for edditing dkp event.
${Formatters.inlineCode(
    `${config.get(
        'discord.prefix'
    )}${commandName} edit <event-name> <event-type: ${Object.values(
        EventType
    ).join(', ')}> <type schema>`
)} editting existing (already approved dkp will not be affected by this change) dkp event, schema for ${
        EventType.Plain
    } is number value and for ${
        EventType.Extended
    } is json with following pattern: ${Formatters.inlineCode(
        `{value:number,levels:{name:string,value:number}[],modifiers:{name:string,value:number}[]}`
    )}
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} list`
)} shows list of dkp events.
`,
    async execute(msg: Message, args: string[]) {
        prohibitDms(msg);

        if (args[0] === 'add') {
            await checkIfSufficientPermissions(msg, Permissions.EventManager);
            return msg.channel.send(await registerEvent(msg, args));
        }

        if (args[0] === 'delete') {
            await checkIfSufficientPermissions(msg, Permissions.EventManager);
            return msg.channel.send(await removeEvent(msg, args));
        }

        if (args[0] === 'edit') {
            await checkIfSufficientPermissions(msg, Permissions.EventManager);
            return msg.channel.send(await editEvent(msg, args));
        }

        if (args[0] === 'list') {
            return await listEvents(msg);
        }

        throw new InvalidUsageError(
            'Invalid command, send `!help` for list of available commands.'
        );
    },
};
