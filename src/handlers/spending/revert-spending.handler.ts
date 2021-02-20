// import { Guild, Message } from 'discord.js';
// import { sendText } from '../../helpers/send-long-msg';
// import { dkpChannelsService } from '../../services/dkp-channels.service';

// export async function listChannels(msg: Message): Promise<Message | Message[]> {
//     const guildId = (msg.guild as Guild).id;
//     const channelCursor = await dkpChannelsService.findChannels({
//         guildId,
//         active: true,
//     });

//     if ((await channelCursor.count()) === 0) {
//         return msg.channel.send(`No events registered.`);
//     }

//     const channels = await channelCursor
//         .map(({ channelId }) => `<#${channelId}>`)
//         .toArray();
//     return sendText(
//         `Registered channels:\n${channels.join('\n')}`,
//         (partialMessage) => msg.channel.send(partialMessage)
//     );
// }
