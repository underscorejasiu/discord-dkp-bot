import { DkpCollections } from '../models/dkp-collections';
import { clanBotDbService } from './clan-bot-db.service';
import { WithId } from '../models/with-id.type';
import {
    Document,
    Filter,
    FindCursor,
    InsertManyResult,
    InsertOneResult,
    UpdateFilter,
    UpdateResult,
} from 'mongodb';
import { DkpEarned } from '../models/dkp-earned.type';

type FoundDkpEarned = DkpEarned & WithId;

async function getEarnedDkpCollection() {
    return (await clanBotDbService.getClanBotDb()).collection<DkpEarned>(
        DkpCollections.EarnedDkp
    );
}

async function findEarnedDkp(
    params: Filter<DkpEarned>
): Promise<FoundDkpEarned | undefined> {
    return (await getEarnedDkpCollection()).findOne(params);
}

async function findEearnedDkps(
    params: Filter<DkpEarned>
): Promise<FindCursor<DkpEarned>> {
    return (await getEarnedDkpCollection()).find(params);
}

async function addDkpEntry(
    props: DkpEarned
): Promise<InsertOneResult<DkpEarned>> {
    return (await getEarnedDkpCollection()).insertOne(props);
}

async function addDkpEntries(
    props: DkpEarned[]
): Promise<InsertManyResult<DkpEarned>> {
    return (await getEarnedDkpCollection()).insertMany(props);
}

async function editEarnedDkp(
    filter: Filter<DkpEarned>,
    update: UpdateFilter<DkpEarned>
): Promise<UpdateResult | Document> {
    return (await getEarnedDkpCollection()).updateOne(filter, update);
}

export const dkpEarnedService = {
    getEarnedDkpCollection,
    findEarnedDkp,
    findEearnedDkps,
    addDkpEntry,
    editEarnedDkp,
    addDkpEntries,
};
