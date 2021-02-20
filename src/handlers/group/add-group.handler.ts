import { Formatters, Guild, Message } from 'discord.js';
import { parseGroup } from './parsers/parse-group';
import { dkpGroupConfigService } from '../../services/dkp-group-config.service';

export async function addGroup(msg: Message): Promise<string> {
    const guildId = (msg.guild as Guild).id;
    const groupRole = parseGroup(msg.mentions.roles);

    await dkpGroupConfigService.addGroupConfig({
        guildId,
        groupId: groupRole.id,
        registrantId: msg.author.id,
        createdAt: new Date(),
    });

    return `Registered groups for role named: ${Formatters.roleMention(
        groupRole.id
    )}`;
}
