import config from 'config';
import { Formatters, Message } from 'discord.js';

import { Command } from '../models/command.type';
import { addDkpEvent } from '../handlers/dkp/add-dkp-event.handler';
import { prohibitDms } from '../guards/dm.guard';

const commandName = 'dkp';
export const dkpCommand: Command = {
    name: commandName,
    description: `Command for registering new dkp events by members.
${Formatters.inlineCode(
    `${config.get(
        'discord.prefix'
    )}${commandName} <event-name>:<event-lvls>+<event-modifiers> @member1 ... @memberN <additional infomations, image etc.>`
)} Adds new dkp entry for mentioned server members, check ${Formatters.inlineCode(
        `${config.get('discord.prefix')}event list`
    )} for list of all events and modifiers that can be used in server.
`,
    async execute(msg: Message): Promise<Message> {
        prohibitDms(msg);
        return addDkpEvent(msg);
    },
};
