import {
    DiscordDkpMessage,
    DkpMessageSource,
} from '../models/dkp-message.type';
import { DkpCollections } from '../models/dkp-collections';
import { clanBotDbService } from './clan-bot-db.service';
import {
    DeleteResult,
    Document,
    Filter,
    FindCursor,
    InsertOneResult,
    UpdateFilter,
    UpdateResult,
} from 'mongodb';
import { WithId } from '../models/with-id.type';

async function getMessagesCollection() {
    return (
        await clanBotDbService.getClanBotDb()
    ).collection<DiscordDkpMessage>(DkpCollections.Messages);
}

async function addMessage(
    messageProps: Omit<DiscordDkpMessage, 'source'>
): Promise<InsertOneResult<DiscordDkpMessage>> {
    return await (
        await getMessagesCollection()
    ).insertOne({
        source: DkpMessageSource.Discord,
        ...messageProps,
    });
}

async function deleteMessage(
    messageProps: Filter<DiscordDkpMessage>
): Promise<DeleteResult> {
    return await (
        await getMessagesCollection()
    ).deleteOne({
        source: DkpMessageSource.Discord,
        ...messageProps,
    });
}

async function editMessage(
    filter: Filter<DiscordDkpMessage>,
    update: UpdateFilter<DiscordDkpMessage>
): Promise<UpdateResult | Document> {
    return await (await getMessagesCollection()).updateOne(filter, update);
}

async function findMessage(
    filter: Filter<DiscordDkpMessage>
): Promise<FindCursor<DiscordDkpMessage & WithId>> {
    return (await getMessagesCollection()).find(filter);
}

export const dkpMessagesService = {
    addMessage,
    findMessage,
    editMessage,
    deleteMessage,
};
