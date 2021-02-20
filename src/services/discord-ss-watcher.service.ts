import {
    Client,
    Guild,
    GuildMember,
    MessageReaction,
    PartialUser,
    User,
} from 'discord.js';
import { DkpAcceptanceStatus } from '../models/dkp-acceptance-status';
import { dkpMessagesService } from './dkp-messages.service';
import { DkpMessageSource } from '../models/dkp-message.type';
import { dkpRolesService } from './dkp-privileged-roles.service';
import { Permissions } from '../models/dkp-permissions';
import { StatusesMap } from '../models/reaction-status-map';
import { createResponseContent } from '../helpers/create-response-content';
import { dkpEventsService } from './dkp-events.service';
import { dkpEarnedService } from './dkp-earned.service';
import { dkpUserService } from './dkp-users.service';
import { DkpUser } from '../models/dkp-user.type';
import { AnyBulkWriteOperation } from 'mongodb';
import { InvalidUsageErrorName } from '../models/invalid-ussage-error.model';

async function init(client: Client) {
    client.on(
        'messageReactionAdd',
        async (reaction: MessageReaction, user: User | PartialUser) => {
            try {
                await handleDkpAcceptance(reaction, user);
            } catch (err) {
                if (err.name === InvalidUsageErrorName) {
                    void reaction.message.reply(err.message);
                } else {
                    console.error(err);
                    void reaction.message.reply('Something went wrong ;(');
                }
            }
        }
    );
}

async function handleDkpAcceptance(
    reaction: MessageReaction,
    user: User | PartialUser
) {
    if (user.bot || reaction.message.channel.type === 'DM') {
        return;
    }

    const reactionMessage = await reaction.message.fetch();
    const guild = reactionMessage.guild as Guild;
    const dkpMessageCursor = (
        await dkpMessagesService.findMessage({
            status: DkpAcceptanceStatus.Pending,
            source: DkpMessageSource.Discord,
            'meta.messageId': reactionMessage.id,
            'meta.guildId': guild.id,
            'meta.channelId': reactionMessage.channel.id,
        })
    ).limit(1);
    const dbEntry = await dkpMessageCursor.next();
    await dkpMessageCursor.close();
    if (!dbEntry) {
        return;
    }

    const completeReaction = reaction.partial
        ? await reaction.fetch()
        : reaction;

    const reactionName = completeReaction.emoji.name as string;
    if (!StatusesMap.has(reactionName)) {
        return;
    }

    if (user.partial) {
        await user.fetch();
    }

    const reactionGiver = user as User;
    const rolsCursor = await dkpRolesService.findRoles({
        guildId: guild.id,
        permissionType: Permissions.Approver,
        active: true,
    });
    const privilegedRoles = await rolsCursor
        .map(({ roleId }) => roleId)
        .toArray();
    await rolsCursor.close();
    const roles = (
        await (guild.members.cache.get(reactionGiver.id) as GuildMember).fetch()
    ).roles.cache;
    if (!privilegedRoles.some((roleId) => roles.has(roleId))) {
        await completeReaction.users.remove(reactionGiver);
        return;
    }

    const newStatus = StatusesMap.get(reactionName) as
        | DkpAcceptanceStatus.Accepted
        | DkpAcceptanceStatus.Rejected;
    const event = await dkpEventsService.findEvent({
        _id: dbEntry.eventId,
    });

    if (!event) {
        throw new Error(`Event: ${dbEntry.eventId} not found`);
    }

    const eventDate = new Date();
    if (newStatus === DkpAcceptanceStatus.Accepted) {
        await dkpEarnedService.addDkpEntries(
            dbEntry.meta.mentionedUsersIds.map((mentionedUserId) => ({
                dkpMessageId: dbEntry._id,
                dkpEventId: event._id,
                earnedDkp: dbEntry.eventScore,
                guildId: guild.id,
                approverId: reactionGiver.id,
                receiverId: mentionedUserId,
                createdAt: eventDate,
            }))
        );
        await dkpUserService.bulkWriteDkpUsers(
            dbEntry.meta.mentionedUsersIds.map(
                (mentionedUserId): AnyBulkWriteOperation<DkpUser> => ({
                    updateOne: {
                        filter: {
                            discordGuildId: guild.id,
                            discordUserId: mentionedUserId,
                        },
                        update: {
                            $inc: { dkpValue: dbEntry.eventScore },
                            $set: { modifiedAt: eventDate },
                            $setOnInsert: {
                                active: true,
                                createdAt: eventDate,
                            },
                        },
                        upsert: true,
                    },
                })
            )
        );
    }
    await dkpMessagesService.editMessage(
        { _id: dbEntry._id },
        {
            $set: {
                status: newStatus,
                approverId: reactionGiver.id,
                modifiedAt: eventDate,
            },
        }
    );
    const replyMsg = await reactionMessage.channel.messages.fetch(
        dbEntry.meta.replyId
    );
    await replyMsg.edit(
        createResponseContent({
            authorId: dbEntry.meta.authorId,
            attendantsIds: dbEntry.meta.mentionedUsersIds,
            eventName: dbEntry.meta.fullEventCommand,
            eventScore: dbEntry.eventScore,
            hasAttachment:
                dbEntry.meta.embeds.length + dbEntry.meta.attachments.length,
            status: newStatus,
        })
    );
}

export const dkpAcceptanceWatcher = {
    init,
};
