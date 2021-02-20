import { Client, Guild, Message, PartialMessage } from 'discord.js';
import { DkpAcceptanceStatus } from '../models/dkp-acceptance-status';
import { dkpMessagesService } from './dkp-messages.service';
import { DkpMessageSource } from '../models/dkp-message.type';
import { cleanUpAfterMessageRemove } from './dkp-message.service';
import { InvalidUsageErrorName } from '../models/invalid-ussage-error.model';

async function init(client: Client) {
    client.on('messageDelete', async (message: Message | PartialMessage) => {
        try {
            await handleRemovedDkpMessage(message);
        } catch (err) {
            if (err.name === InvalidUsageErrorName) {
                void message.reply(err.message);
            } else {
                console.error(err);
                void message.reply('Something went wrong ;(');
            }
        }
    });
}

async function handleRemovedDkpMessage(message: Message | PartialMessage) {
    const { channel } = message;
    if (channel.type === 'DM') {
        return;
    }

    const guild = message.guild as Guild;
    const dkpMessageCursor = (
        await dkpMessagesService.findMessage({
            status: DkpAcceptanceStatus.Pending,
            source: DkpMessageSource.Discord,
            'meta.messageId': message.id,
            'meta.guildId': guild.id,
            'meta.channelId': message.channel.id,
        })
    ).limit(1);

    const dbEntry = await dkpMessageCursor.next();
    await dkpMessageCursor.close();
    if (!dbEntry) {
        return;
    }

    await cleanUpAfterMessageRemove(dbEntry, channel);
}

export const dkpMessageRemovedService = {
    init,
};
