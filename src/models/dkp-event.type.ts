import { Snowflake } from 'discord.js';

export enum EventType {
    Plain = 'plain',
    Extended = 'extended',
}

export interface SimpleExtension {
    name: string;
    value: number;
}

export interface ExtendedEventSchema {
    value?: number;
    modifiers?: SimpleExtension[];
    levels?: SimpleExtension[];
}

export interface DkpEventBase {
    eventName: string;
    type: EventType;
    value: number | ExtendedEventSchema;
    author: Snowflake;
    guildId: Snowflake;
    createdAt: Date;
    active?: boolean;
}

export interface ExtendedDkpEvent extends DkpEventBase {
    type: EventType.Extended;
    value: ExtendedEventSchema;
}

export interface PlainDkpEvent extends DkpEventBase {
    type: EventType.Plain;
    value: number;
}

export type DkpEvent = PlainDkpEvent | ExtendedDkpEvent;
