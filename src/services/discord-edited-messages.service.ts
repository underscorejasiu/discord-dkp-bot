import { Client, Message, PartialMessage } from 'discord.js';
import { DkpAcceptanceStatus } from '../models/dkp-acceptance-status';
import { dkpMessagesService } from './dkp-messages.service';
import { DkpMessageSource } from '../models/dkp-message.type';
import { isPartialMessage } from '../models/type-guards/partial-message.type-guard';
import { isDkpEntryMessage } from '../helpers/is-dkp-entry-message';
import {
    addDkpMessage,
    cleanUpAfterMessageRemove,
    editExistingDkpMessage,
} from './dkp-message.service';
import {
    InvalidUsageError,
    InvalidUsageErrorName,
} from '../models/invalid-ussage-error.model';
import { getStatusName } from '../helpers/get-acceptance-status-name';

async function init(client: Client) {
    client.on(
        'messageUpdate',
        async (
            oldMessage: Message | PartialMessage,
            newMessage: Message | PartialMessage
        ) => {
            try {
                await handleEditedDkpMessage(oldMessage, newMessage);
            } catch (err) {
                if (err.name === InvalidUsageErrorName) {
                    void newMessage.reply(err.message);
                } else {
                    console.error(err);
                    void newMessage.reply('Something went wrong ;(');
                }
            }
        }
    );
}

async function handleEditedDkpMessage(
    oldMessage: Message | PartialMessage,
    newMessage: Message | PartialMessage
) {
    const { channel } = oldMessage;
    if (channel.type === 'DM') {
        return;
    }

    let fullNewMessage: Message;
    if (isPartialMessage(newMessage)) {
        fullNewMessage = await newMessage.fetch();
    } else {
        fullNewMessage = newMessage;
    }

    const dkpMessageCursor = (
        await dkpMessagesService.findMessage({
            source: DkpMessageSource.Discord,
            'meta.messageId': fullNewMessage.id,
            'meta.guildId': fullNewMessage.guildId,
            'meta.channelId': fullNewMessage.channelId,
        })
    ).limit(1);

    const dbEntry = await dkpMessageCursor.next();
    await dkpMessageCursor.close();

    if (isDkpEntryMessage(fullNewMessage) && !dbEntry) {
        await addDkpMessage(fullNewMessage);
    } else if (!isDkpEntryMessage(fullNewMessage) && dbEntry) {
        await cleanUpAfterMessageRemove(dbEntry, fullNewMessage.channel);
        await fullNewMessage.reactions.removeAll();
    } else if (isDkpEntryMessage(fullNewMessage) && dbEntry) {
        const replyId = dbEntry.meta.replyId;
        if (dbEntry.status !== DkpAcceptanceStatus.Pending || !replyId) {
            throw new InvalidUsageError(
                `You are edditing already ${getStatusName(
                    dbEntry.status
                )} message`
            );
        }

        await editExistingDkpMessage(fullNewMessage, dbEntry);
    }
}

export const dkpMessageEditedService = {
    init,
};
