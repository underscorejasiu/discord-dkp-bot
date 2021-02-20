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
import { PrivilegedRole } from '../models/privileged-role.type';

async function getChannelsCollection() {
    return (await clanBotDbService.getClanBotDb()).collection<PrivilegedRole>(
        DkpCollections.Roles
    );
}

type FoundRole = PrivilegedRole & WithId;
async function findRole(
    params: Filter<PrivilegedRole>
): Promise<FoundRole | undefined> {
    return await (await getChannelsCollection()).findOne<FoundRole>(params);
}

async function findRoles(
    props: Filter<PrivilegedRole>
): Promise<FindCursor<PrivilegedRole>> {
    return await (await getChannelsCollection()).find<FoundRole>(props);
}

async function addRole(
    props: Exclude<PrivilegedRole, 'active'>
): Promise<InsertOneResult<PrivilegedRole>> {
    return await (await getChannelsCollection()).insertOne({
        ...props,
        active: true,
    });
}

async function addRoles(
    privilegedRoles: Omit<PrivilegedRole, 'active'>[]
): Promise<InsertManyResult<PrivilegedRole>> {
    return await (await getChannelsCollection()).insertMany(
        privilegedRoles.map((privilegedRole) => ({
            ...privilegedRole,
            active: true,
        }))
    );
}

async function editRoles(
    filter: Filter<PrivilegedRole>,
    update: UpdateFilter<PrivilegedRole>
): Promise<UpdateResult | Document> {
    return await (await getChannelsCollection()).updateMany(filter, update);
}

export const dkpRolesService = {
    findRole,
    findRoles,
    addRole,
    addRoles,
    editRoles,
};
