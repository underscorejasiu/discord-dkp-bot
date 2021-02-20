import { Snowflake } from 'discord.js';
import { InvalidUsageError } from '../../../models/invalid-ussage-error.model';
import { dkpEventsService } from '../../../services/dkp-events.service';

export const parseEventNameUniq = async (
    guildId: Snowflake,
    eventName: string
): Promise<string> => {
    const foundEvent = await dkpEventsService.findEvent({
        active: true,
        guildId,
        eventName,
    });

    if (foundEvent) {
        throw new InvalidUsageError(
            `Event already registered by <@${
                foundEvent.author
            }> with value: \`${JSON.stringify(foundEvent.value)}\``
        );
    }

    return eventName;
};

export const parseEventNameActive = async (
    guildId: Snowflake,
    eventName: string
): Promise<string> => {
    const foundEvent = await dkpEventsService.findEvent({
        active: true,
        guildId,
        eventName,
    });

    if (!foundEvent) {
        throw new InvalidUsageError(
            `Event name: ${eventName} hasn't been found.`
        );
    }

    return eventName;
};
