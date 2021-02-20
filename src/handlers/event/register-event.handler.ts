import { Collection, Guild, Message } from 'discord.js';
import { dkpEventsService } from '../../services/dkp-events.service';
import { InvalidUsageError } from '../../models/invalid-ussage-error.model';
import { parseEventNameUniq } from './parsers/parse-event-name';
import { parseScore } from './parsers/parse-event-score';
import {
    DkpEvent,
    EventType,
    ExtendedEventSchema,
} from '../../models/dkp-event.type';
import { parseEventJsonSchema } from './parsers/parse-event-json-schema';
import { parseEventType } from './parsers/parse-event-type';

export async function registerEvent(
    msg: Message,
    args: string[]
): Promise<string> {
    const guildId = (msg.guild as Guild).id;
    const eventDetails: {
        name: string | null;
        type: EventType | null;
        value: number | ExtendedEventSchema | null;
    } = { name: null, type: null, value: null };
    if (args.length >= 4) {
        const [, name, type, ...code] = args;
        eventDetails.name = await parseEventNameUniq(guildId, name);
        eventDetails.type = await parseEventType(type);
        eventDetails.value =
            eventDetails.type === EventType.Plain
                ? parseScore(code[0])
                : parseEventJsonSchema(code.join(' '));
    } else {
        try {
            await msg.reply(`Enter event name:`);
            const collectedName = await msg.channel.awaitMessages({
                filter: (response: Message) =>
                    msg.author.id === response.author.id,
                max: 1,
                time: 30000,
                errors: ['time'],
            });
            eventDetails.name = await parseEventNameUniq(
                guildId,
                (collectedName.first() as Message).content
            );

            await msg.reply(`Enter event type (${Object.values(EventType)}):`);
            const collectedType = await msg.channel.awaitMessages({
                filter: (response: Message) =>
                    msg.author.id === response.author.id,
                max: 1,
                time: 30000,
                errors: ['time'],
            });
            eventDetails.type = parseEventType(
                (collectedType.first() as Message).content
            );

            await msg.reply(
                `Please enter score for ${eventDetails.name} event:`
            );
            const collectedValue = await msg.channel.awaitMessages({
                filter: (response: Message) =>
                    msg.author.id === response.author.id,
                max: 1,
                time: 30000,
                errors: ['time'],
            });
            const eventValue = (collectedValue.first() as Message).content;
            eventDetails.value =
                eventDetails.type === EventType.Plain
                    ? parseScore(eventValue)
                    : parseEventJsonSchema(eventValue);
        } catch (error) {
            if (error instanceof Collection) {
                throw new InvalidUsageError('Got no response. Aborting.');
            }

            throw error;
        }
    }

    await dkpEventsService.addEvent({
        eventName: eventDetails.name,
        value: eventDetails.value,
        type: eventDetails.type,
        author: msg.author.id,
        createdAt: msg.createdAt,
        active: true,
        guildId,
    } as DkpEvent);
    0;
    return `Registered event named: ${eventDetails.name} to ${
        eventDetails.type
    } with value: \`${JSON.stringify(eventDetails.value)}\``;
}
