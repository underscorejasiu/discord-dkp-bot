import { Message, Snowflake, TextBasedChannels, User } from 'discord.js';
import { parseCommandArgs } from '../helpers/parse-command';
import { createResponseContent } from '../helpers/create-response-content';
import { DkpAcceptanceStatus } from '../models/dkp-acceptance-status';
import { DiscordDkpMessage } from '../models/dkp-message.type';
import { WithId } from '../models/with-id.type';
import { dkpMessagesService } from './dkp-messages.service';
import {
    MatchedCommand,
    parseCommandAgainstEventValue,
    parseEventCommand,
} from '../handlers/dkp/parsers/parse-event-command';
import { dkpEventsService } from './dkp-events.service';
import { InvalidUsageError } from '../models/invalid-ussage-error.model';
import { dkpChannelsService } from './dkp-channels.service';
import { StatusesMap } from '../models/reaction-status-map';

export async function cleanUpAfterMessageRemove(
    dbEntry: DiscordDkpMessage & WithId,
    textChannel: TextBasedChannels
) {
    const replyId = dbEntry.meta.replyId;
    if (dbEntry.status !== DkpAcceptanceStatus.Pending || !replyId) {
        return;
    }

    const deleteResult = await dkpMessagesService.deleteMessage({
        _id: dbEntry._id,
    });

    if (deleteResult.deletedCount === 0) {
        throw new Error(
            `Something went wrong deleting message: ${dbEntry._id}, channel: ${dbEntry.meta.channelId}, guild: ${dbEntry.meta.guildId}.`
        );
    }

    await textChannel.messages.delete(replyId);

    return null;
}

export async function addDkpMessage(msg: Message): Promise<Message> {
    const args = parseCommandArgs(msg);
    if (args.length === 0) {
        throw new InvalidUsageError('Dkp entry needs to have provided event!');
    }

    const event: MatchedCommand = parseEventCommand(args[0]);
    const guildId: Snowflake = msg.guildId as Snowflake;
    const eventName = event.command;
    const eventDetails = await dkpEventsService.findEvent({
        active: true,
        guildId,
        eventName,
    });
    if (!eventDetails) {
        throw new InvalidUsageError(
            `Event: ${eventName} is not registered! Ask server administrator to add it.`
        );
    }
    const { value: eventScore } = parseCommandAgainstEventValue(
        event,
        eventDetails
    );

    const channelDetails = await dkpChannelsService.findChannel({
        guildId,
        channelId: msg.channel.id,
    });
    if (!channelDetails) {
        throw new InvalidUsageError(
            `This channel: <#${msg.channel.id}> is not registered as event input channel! Ask server administrator to add it.`
        );
    }

    const mentionedUsers: User[] = Array.from(msg.mentions.users.values());
    const authorId: Snowflake = msg.author.id;
    const attendantsIds: Snowflake[] = mentionedUsers.length
        ? mentionedUsers.map((user) => user.id)
        : [authorId];
    const status = DkpAcceptanceStatus.Pending;

    const replyContent = createResponseContent({
        hasAttachment: msg.attachments.size + msg.embeds.length,
        eventName: event.fullCommand,
        authorId,
        attendantsIds,
        eventScore,
        status,
    });
    const reply: Message = await msg.reply(replyContent);
    await Promise.all(
        Array.from(StatusesMap.keys()).map((reaction) => msg.react(reaction))
    );

    await dkpMessagesService.addMessage({
        eventId: eventDetails._id,
        createdAt: msg.createdAt,
        eventScore,
        status,
        meta: {
            messageId: msg.id,
            replyId: reply.id,
            channelId: msg.channel.id,
            content: msg.content,
            fullEventCommand: event.fullCommand,
            mentionedUsersIds: attendantsIds,
            embeds: msg.embeds.map((embed) => JSON.stringify(embed.toJSON())),
            attachments: msg.attachments.map((attachment) =>
                JSON.stringify(attachment.toJSON())
            ),
            guildId,
            authorId,
        },
    });

    return reply;
}

export async function editExistingDkpMessage(
    msg: Message,
    dbEntry: DiscordDkpMessage & WithId
): Promise<Message> {
    const args = parseCommandArgs(msg);
    const event: MatchedCommand = parseEventCommand(args[0]);
    const guildId: Snowflake = msg.guildId as Snowflake;
    const eventName = event.command;
    const eventDetails = await dkpEventsService.findEvent({
        active: true,
        guildId,
        eventName,
    });
    if (!eventDetails) {
        await cleanUpAfterMessageRemove(dbEntry, msg.channel);
        await msg.reactions.removeAll();
        throw new InvalidUsageError(
            `Event: ${eventName} is not registered! Removing dkp entry!`
        );
    }

    const { value: eventScore } = parseCommandAgainstEventValue(
        event,
        eventDetails
    );

    const mentionedUsers: User[] = Array.from(msg.mentions.users.values());
    const authorId: Snowflake = msg.author.id;
    const attendantsIds: Snowflake[] = mentionedUsers.length
        ? mentionedUsers.map((user) => user.id)
        : [authorId];
    const status = DkpAcceptanceStatus.Pending;

    const replyContent = createResponseContent({
        hasAttachment: msg.attachments.size + msg.embeds.length,
        eventName: event.fullCommand,
        authorId,
        attendantsIds,
        eventScore,
        status,
    });
    const replyMsg = await msg.channel.messages.fetch(dbEntry.meta.replyId);
    await Promise.all(
        Array.from(StatusesMap.keys()).map((reaction) => msg.react(reaction))
    );

    await dkpMessagesService.editMessage(
        { _id: dbEntry._id },
        {
            $set: {
                eventId: eventDetails._id,
                modifiedAt: new Date(),
                eventScore,
                status,
                'meta.content': msg.content,
                'meta.fullEventCommand': event.fullCommand,
                'meta.mentionedUsersIds': attendantsIds,
                'meta.embeds': msg.embeds.map((embed) =>
                    JSON.stringify(embed.toJSON())
                ),
                'meta.attachments': msg.attachments.map((attachment) =>
                    JSON.stringify(attachment.toJSON())
                ),
            },
        }
    );
    return await replyMsg.edit(replyContent);
}
