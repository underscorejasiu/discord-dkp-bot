import { Channel, Guild, Message } from 'discord.js';
import { dkpChannelsService } from '../../services/dkp-channels.service';
import { parseApplicableChannels } from './parsers/parse-applicable-channeles';

export async function unregisterChannel(msg: Message): Promise<string> {
    const guildId = (msg.guild as Guild).id;
    let channels: Channel[] = [];
    if (msg.mentions.channels.size) {
        channels = Array.from(msg.mentions.channels.values());
    } else {
        await msg.reply(`Enter event channels to unregister:`);
        const collectedName = await msg.channel.awaitMessages({
            filter: (response: Message) => msg.author.id === response.author.id,
            max: 1,
            time: 30000,
            errors: ['time'],
        });
        channels = Array.from(
            (collectedName.first() as Message).mentions.channels.values()
        );
    }

    const applicableChannels = await parseApplicableChannels(
        guildId,
        channels,
        true
    );
    await dkpChannelsService.editChannels(
        {
            channelId: { $in: applicableChannels },
            guildId,
        },
        {
            $set: { active: false },
        }
    );

    return `Unregistered DKP Input channels: ${applicableChannels
        .map((id) => `<#${id}>`)
        .join(' ')}.`;
}
