import { Snowflake } from 'discord.js';
import { getStatusName } from './get-acceptance-status-name';
import { DkpAcceptanceStatus } from '../models/dkp-acceptance-status';

export function createResponseContent({
    authorId,
    attendantsIds,
    eventName,
    eventScore,
    hasAttachment,
    status,
}: {
    authorId: Snowflake;
    attendantsIds: Snowflake[];
    eventName: string;
    eventScore: number;
    hasAttachment: number;
    status: DkpAcceptanceStatus;
}): string {
    return `
Author: <@${authorId}>
Attendants: ${attendantsIds.map((attendatId) => `<@${attendatId}>`)}
Event: ${eventName}
Event Value: ${eventScore}
Attachments: ${hasAttachment}
Status: ${getStatusName(status)}`;
}
