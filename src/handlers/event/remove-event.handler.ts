import { Collection, Guild, Message } from 'discord.js';
import { dkpEventsService } from '../../services/dkp-events.service';
import { InvalidUsageError } from '../../models/invalid-ussage-error.model';
import { parseEventNameActive } from './parsers/parse-event-name';

export async function removeEvent(
    msg: Message,
    args: string[]
): Promise<string> {
    const guildId = (msg.guild as Guild).id;
    const eventDetails: { name: string | null } = { name: null };
    if (args.length === 2) {
        eventDetails.name = await parseEventNameActive(guildId, args[1]);
    } else {
        try {
            await msg.reply(`Please event name:`);
            const collectedName = await msg.channel.awaitMessages({
                filter: (response: Message) =>
                    msg.author.id === response.author.id,
                max: 1,
                time: 30000,
                errors: ['time'],
            });

            eventDetails.name = await parseEventNameActive(
                guildId,
                (collectedName.first() as Message).content
            );
        } catch (error) {
            if (error instanceof Collection) {
                throw new InvalidUsageError('Got no response. Aborting.');
            }

            throw error;
        }
    }

    await dkpEventsService.editEvent(
        { active: true, eventName: eventDetails.name, guildId },
        { $set: { active: false } }
    );

    return `Removed event named: ${eventDetails.name}.`;
}
