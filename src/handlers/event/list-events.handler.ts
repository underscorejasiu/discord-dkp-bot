import * as AsciiTable from 'ascii-table';
import { Guild, Message } from 'discord.js';
import {
    isExtendedEvent,
    isPlainEvent,
} from '../../models/type-guards/event.type-guard';
import { ExtendedDkpEvent, PlainDkpEvent } from '../../models/dkp-event.type';
import { dkpEventsService } from '../../services/dkp-events.service';
import { sendCodeBlocks } from '../../helpers/send-long-msg';

export async function listEvents(msg: Message): Promise<Message | Message[]> {
    const guildId = (msg.guild as Guild).id;
    const eventsCursor = await dkpEventsService.findEvents({
        active: true,
        guildId,
    });

    if ((await eventsCursor.count()) === 0) {
        return msg.reply(`No events registered.`);
    }

    const events = await eventsCursor.toArray();

    const flattenedEvents = events.reduce<(string | number | null)[][]>(
        (acc, event) => {
            if (isPlainEvent(event)) {
                const { eventName, value } = event as PlainDkpEvent;
                acc.push([eventName, null, value]);
            }

            if (isExtendedEvent(event)) {
                const { eventName, value: schema } = event as ExtendedDkpEvent;

                const modifiers = schema.modifiers
                    ? schema.modifiers
                          .map(({ name, value }) => `"+${name}" (${value} dkp)`)
                          .join(' ')
                    : null;
                acc.push([eventName, null, schema.value || 0, modifiers]);

                if (schema.levels) {
                    acc.push(
                        ...schema.levels.map(({ value, name }) => [
                            null,
                            `":${name}"`,
                            value,
                        ])
                    );
                }
            }

            return acc;
        },
        []
    );

    const table = AsciiTable.factory({
        title: 'Events',
        heading: ['Name', 'Level', 'Dkp Score', 'Modifiers'],
        rows: flattenedEvents,
    });
    return sendCodeBlocks(table.toString(), (partialMessage) =>
        msg.channel.send(partialMessage)
    );
}
