import {
    DkpEvent,
    EventType,
    ExtendedDkpEvent,
    PlainDkpEvent,
} from '../dkp-event.type';

export const isPlainEvent = (event: DkpEvent): event is PlainDkpEvent =>
    event.type === EventType.Plain;
export const isExtendedEvent = (event: DkpEvent): event is ExtendedDkpEvent =>
    event.type === EventType.Extended;
