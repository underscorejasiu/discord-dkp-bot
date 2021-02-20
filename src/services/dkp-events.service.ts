import { DkpEvent } from '../models/dkp-event.type';
import { DkpCollections } from '../models/dkp-collections';
import { clanBotDbService } from './clan-bot-db.service';
import { WithId } from '../models/with-id.type';
import {
    Document,
    Filter,
    FindCursor,
    InsertOneResult,
    UpdateFilter,
    UpdateResult,
} from 'mongodb';

type FoundEvent = DkpEvent & WithId;

async function getEventsCollection() {
    return (await clanBotDbService.getClanBotDb()).collection<DkpEvent>(
        DkpCollections.Events
    );
}

async function findEvent(
    params: Filter<DkpEvent>
): Promise<FoundEvent | undefined> {
    return (await getEventsCollection()).findOne(params);
}

async function findEvents(
    params: Filter<DkpEvent>
): Promise<FindCursor<DkpEvent>> {
    return (await getEventsCollection()).find(params);
}

async function addEvent(props: DkpEvent): Promise<InsertOneResult<FoundEvent>> {
    return (await getEventsCollection()).insertOne(props);
}

async function editEvent(
    filter: Filter<DkpEvent>,
    update: UpdateFilter<DkpEvent>
): Promise<UpdateResult | Document> {
    return (await getEventsCollection()).updateOne(filter, update);
}

export const dkpEventsService = {
    findEvent,
    findEvents,
    addEvent,
    editEvent,
};
