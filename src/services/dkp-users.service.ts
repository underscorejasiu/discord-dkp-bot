import { DkpCollections } from '../models/dkp-collections';
import { clanBotDbService } from './clan-bot-db.service';
import { WithId } from '../models/with-id.type';
import {
    AnyBulkWriteOperation,
    BulkWriteResult,
    Document,
    Filter,
    FindCursor,
    InsertOneResult,
    UpdateFilter,
    UpdateOptions,
    UpdateResult,
} from 'mongodb';
import { DkpUser } from '../models/dkp-user.type';

type FoundDkpUser = DkpUser & WithId;

async function getDkpUsersCollection() {
    return (await clanBotDbService.getClanBotDb()).collection<DkpUser>(
        DkpCollections.Users
    );
}

async function findDkpUser(
    params: Filter<DkpUser>
): Promise<FoundDkpUser | undefined> {
    return (await getDkpUsersCollection()).findOne(params);
}

async function findDkpUsers(
    params: Filter<DkpUser>
): Promise<FindCursor<DkpUser>> {
    return (await getDkpUsersCollection()).find(params);
}

async function addDkpUser(props: DkpUser): Promise<InsertOneResult<DkpUser>> {
    return (await getDkpUsersCollection()).insertOne(props);
}

async function editDkpUser(
    filter: Filter<DkpUser>,
    update: UpdateFilter<DkpUser>,
    options: UpdateOptions
): Promise<UpdateResult | Document> {
    return (await getDkpUsersCollection()).updateOne(filter, update, options);
}

async function editDkpUsers(
    filter: Filter<DkpUser>,
    update: UpdateFilter<DkpUser>,
    options: UpdateOptions
): Promise<UpdateResult | Document> {
    return (await getDkpUsersCollection()).updateMany(filter, update, options);
}

async function bulkWriteDkpUsers(
    bulkWrite: AnyBulkWriteOperation<DkpUser>[]
): Promise<BulkWriteResult> {
    return (await getDkpUsersCollection()).bulkWrite(bulkWrite);
}

export const dkpUserService = {
    findDkpUser,
    findDkpUsers,
    addDkpUser,
    editDkpUser,
    editDkpUsers,
    bulkWriteDkpUsers,
};
