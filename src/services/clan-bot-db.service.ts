import { DkpCollections } from '../models/dkp-collections';
import { dbPoolService } from './db-pool.service';

async function getClanBotDb() {
    return (await dbPoolService.getInstance()).db('clan-bot');
}

async function getCollection(collection: DkpCollections) {
    return (await getClanBotDb()).collection(collection);
}

export const clanBotDbService = {
    getClanBotDb,
    getCollection,
};
