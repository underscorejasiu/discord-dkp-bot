import { DkpCollections } from '../models/dkp-collections';
import { clanBotDbService } from './clan-bot-db.service';
import {
    Document,
    Filter,
    FindCursor,
    InsertOneResult,
    UpdateFilter,
    UpdateResult,
} from 'mongodb';
import { DkpGroupConfig } from '../models/dkp-group-config.type';

async function getConfigCollection() {
    return (await clanBotDbService.getClanBotDb()).collection<DkpGroupConfig>(
        DkpCollections.Configs
    );
}

async function findGroupConfig(
    filter: Filter<DkpGroupConfig>
): Promise<FindCursor<DkpGroupConfig>> {
    return await (await getConfigCollection()).find(filter);
}

async function addGroupConfig(
    props: Exclude<DkpGroupConfig, 'active'>
): Promise<InsertOneResult<DkpGroupConfig>> {
    return await (
        await getConfigCollection()
    ).insertOne({
        active: true,
        ...props,
    });
}

async function editGroupConfig(
    filter: Filter<DkpGroupConfig>,
    update: UpdateFilter<DkpGroupConfig>
): Promise<UpdateResult | Document> {
    return await (await getConfigCollection()).updateMany(filter, update);
}

export const dkpGroupConfigService = {
    findGroupConfig,
    addGroupConfig,
    editGroupConfig,
};
