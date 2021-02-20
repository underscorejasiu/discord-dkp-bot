import { DkpCollections } from '../models/dkp-collections';
import { clanBotDbService } from './clan-bot-db.service';
import { WithId } from '../models/with-id.type';
import { DkpRegisteredChannel } from '../models/dkp-registered-channel.type';
import {
    Document,
    Filter,
    FindCursor,
    InsertManyResult,
    InsertOneResult,
    UpdateFilter,
    UpdateResult,
} from 'mongodb';

async function getChannelsCollection() {
    return (await clanBotDbService.getClanBotDb()).collection<
        DkpRegisteredChannel
    >(DkpCollections.Channels);
}

async function findChannel(
    filter: Filter<DkpRegisteredChannel>
): Promise<(DkpRegisteredChannel & WithId) | undefined> {
    return await (await getChannelsCollection()).findOne<DkpRegisteredChannel>(
        filter
    );
}

async function findChannels(
    filter: Filter<DkpRegisteredChannel>
): Promise<FindCursor<DkpRegisteredChannel>> {
    return await (await getChannelsCollection()).find(filter);
}

async function addChannel(
    props: Exclude<DkpRegisteredChannel, 'active'>
): Promise<InsertOneResult<DkpRegisteredChannel>> {
    return await (await getChannelsCollection()).insertOne({
        active: true,
        ...props,
    });
}

async function addChannels(
    channelsDetails: Exclude<DkpRegisteredChannel, 'active'>[]
): Promise<InsertManyResult<DkpRegisteredChannel>> {
    return await (await getChannelsCollection()).insertMany(
        channelsDetails.map((props) => ({ active: true, ...props }))
    );
}

async function editChannels(
    filter: Filter<DkpRegisteredChannel>,
    update: UpdateFilter<DkpRegisteredChannel>
): Promise<UpdateResult | Document> {
    return await (await getChannelsCollection()).updateMany(filter, update);
}

export const dkpChannelsService = {
    findChannel,
    findChannels,
    addChannel,
    addChannels,
    editChannels,
};
