import config from 'config';
import { MongoClient, MongoClientOptions } from 'mongodb';

const dbUri = config.get('db.uri');
const option: MongoClientOptions = {
    minPoolSize: 5,
    maxPoolSize: 50,
    socketTimeoutMS: 500,
    retryReads: true,
    retryWrites: true,
};

let dbInstance: MongoClient;

async function initPool(): Promise<void> {
    dbInstance = await MongoClient.connect(dbUri, option);
}

async function getInstance(): Promise<MongoClient> {
    if (!dbInstance) {
        await initPool();
    }

    return dbInstance;
}

export const dbPoolService = {
    initPool,
    getInstance,
};
