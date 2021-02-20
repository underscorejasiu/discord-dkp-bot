import { DkpCollections } from '../models/dkp-collections';
import { clanBotDbService } from './clan-bot-db.service';
import {
    Document,
    Filter,
    FindCursor,
    InsertManyResult,
    UpdateFilter,
    UpdateResult,
} from 'mongodb';
import { DkpSpending } from '../models/dkp-spending';

async function getDkpSpendingsCollection() {
    return (await clanBotDbService.getClanBotDb()).collection<DkpSpending>(
        DkpCollections.Spendings
    );
}

async function findSpending(
    params: Filter<DkpSpending>
): Promise<FindCursor<DkpSpending>> {
    return (await getDkpSpendingsCollection()).find(params);
}

async function addSpendings(
    props: DkpSpending[]
): Promise<InsertManyResult<DkpSpending>> {
    return (await getDkpSpendingsCollection()).insertMany(props);
}

async function editSpending(
    filter: Filter<DkpSpending>,
    update: UpdateFilter<DkpSpending>
): Promise<UpdateResult | Document> {
    return (await getDkpSpendingsCollection()).updateOne(filter, update);
}

export const dkpSpendingsService = {
    findSpending,
    addSpendings,
    editSpending,
};
