import { EventType } from '../../../models/dkp-event.type';
import { InvalidUsageError } from '../../../models/invalid-ussage-error.model';

export const parseEventType = (eventType: string | EventType): EventType => {
    if (!Object.values(EventType).includes(eventType as EventType)) {
        throw new InvalidUsageError(`Incortect event type`);
    }

    return eventType as EventType;
};
