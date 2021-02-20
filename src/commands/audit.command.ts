import config from 'config';
import * as AsciiTable from 'ascii-table';
import {
    Channel,
    Collection,
    Formatters,
    Guild,
    GuildMember,
    Message,
    Snowflake,
    User,
    Util,
} from 'discord.js';
import { dkpEarnedService } from '../services/dkp-earned.service';

import { Command } from '../models/command.type';
import { InvalidUsageError } from '../models/invalid-ussage-error.model';
import { dkpUserService } from '../services/dkp-users.service';
import { DkpCollections } from '../models/dkp-collections';
import { DkpEarned } from '../models/dkp-earned.type';
import { format, utcToZonedTime } from 'date-fns-tz';
import { prohibitDms } from '../guards/dm.guard';
import { sendCodeBlocks } from '../helpers/send-long-msg';
import { dkpGroupConfigService } from '../services/dkp-group-config.service';

interface UserEventAggregation {
    earnedDkp: number;
    approverId: Snowflake;
    receiverId: Snowflake;
    createdAt: Date;
    eventDetails: { eventName: string; active: boolean };
    fullEventCommand: string;
    eventDate: Date;
}
const commandName = 'audit';

export const auditCommand: Command = {
    name: commandName,
    description: `Command group for auditing dkp entries and scores. 
${Formatters.inlineCode(
    `${config.get('discord.prefix')}${commandName} list`
)} sends current DKP of all guild users that were participating in events.
${Formatters.inlineCode(
    `${config.get(
        'discord.prefix'
    )}${commandName} events @username1 .. @usernameN`
)} sends on dm dkp that was earned by mentioned users with event details.
`,
    async execute(
        msg: Message,
        args: string[]
    ): Promise<Message | Message[] | null> {
        prohibitDms(msg);
        const { author, guild } = <{ author: User; guild: Guild }>msg;

        if (args[0] === 'list') {
            console.time('check-group');
            if (msg.mentions.roles.size > 1) {
                throw new InvalidUsageError('You can mention only 1 role.');
            }
            const mentionedRole = msg.mentions.roles.first();
            const registeredGroupCursor =
                await await dkpGroupConfigService.findGroupConfig({
                    guildId: guild.id,
                    ...(mentionedRole ? { groupId: mentionedRole.id } : {}),
                });
            const registeredGroup = await registeredGroupCursor.limit(1).next();
            registeredGroupCursor.close();

            if (!registeredGroup) {
                throw new InvalidUsageError('Group is not registered.');
            }
            console.timeEnd('check-group');

            console.time('check-users');
            const usersCursor = (
                await dkpUserService.findDkpUsers({
                    discordGuildId: guild.id,
                    active: true,
                })
            ).sort({ dkpValue: -1 });
            const users = await usersCursor.toArray();
            await usersCursor.close();

            await (msg.guild as Guild).members.fetch();
            await (msg.guild as Guild).roles.fetch(registeredGroup.groupId);

            const rows = users
                .map((user) => ({
                    member: (msg.guild as Guild).members.cache.get(
                        user.discordUserId
                    ),
                    dkp: user.dkpValue,
                }))
                .filter(
                    ({ member }) =>
                        member &&
                        member.roles.cache.has(registeredGroup.groupId)
                )
                .map(({ member, dkp }) => [
                    (member as GuildMember).displayName,
                    dkp,
                ]);

            console.timeEnd('check-users');

            const table = AsciiTable.factory({
                heading: ['Member', 'Dkp'],
                rows,
            });

            return sendCodeBlocks(table.toString(), (partialMessage) =>
                msg.channel.send(partialMessage)
            );
        }

        if (args[0] === 'events') {
            const batchSize = 50;
            const users =
                msg.mentions.users.size === 0
                    ? [author.id]
                    : msg.mentions.users.map(({ id }) => id);
            const earnedDkpCursor = (
                await dkpEarnedService.getEarnedDkpCollection()
            )
                .aggregate<DkpEarned>([
                    { $sort: { _id: -1 } },
                    {
                        $match: {
                            guildId: guild.id,
                            receiverId: { $in: users },
                        },
                    },
                    {
                        $lookup: {
                            from: DkpCollections.Events,
                            localField: 'dkpEventId',
                            foreignField: '_id',
                            as: 'eventDetails',
                        },
                    },
                    {
                        $lookup: {
                            from: DkpCollections.Messages,
                            localField: 'dkpMessageId',
                            foreignField: '_id',
                            as: 'messageDetails',
                        },
                    },
                    {
                        $project: {
                            earnedDkp: 1,
                            approverId: 1,
                            receiverId: 1,
                            createdAt: 1,
                            eventDetails: {
                                $arrayElemAt: ['$eventDetails', 0],
                            },
                            eventDate: {
                                $arrayElemAt: ['$messageDetails.createdAt', 0],
                            },
                            fullEventCommand: {
                                $arrayElemAt: [
                                    '$messageDetails.fullEventCommand',
                                    0,
                                ],
                            },
                        },
                    },
                    {
                        $unset: [
                            '_id',
                            'eventDetails._id',
                            'eventDetails.author',
                            'eventDetails.createdAt',
                            'eventDetails.guildId',
                            'eventDetails.value',
                            'eventDetails.type',
                        ],
                    },
                ])
                .batchSize(batchSize);

            await msg.reply(
                `checkout DM for event entries of ${users.map(
                    (userId) => `<@${userId}>`
                )}`
            );
            const authorInitiatorMsg = await author.send(
                `Here is list of event entries for ${users.map(
                    (userId) => `<@${userId}>`
                )}:`
            );
            let nextBatch = true;
            const nextIndicator = 'next';
            try {
                while (nextBatch) {
                    const batch: UserEventAggregation[] = [];
                    while (
                        batch.length !== batchSize &&
                        (await earnedDkpCursor.hasNext())
                    ) {
                        batch.push(
                            (await earnedDkpCursor.next()) as UserEventAggregation
                        );
                    }

                    const rows = await Promise.all(
                        batch.map(async (entry) => {
                            console.log(entry);
                            return [
                                formatDate(entry.eventDate),
                                (await guild.members.fetch(entry.receiverId))
                                    .displayName,
                                entry.eventDetails.eventName,
                                entry.earnedDkp,
                                entry.eventDetails.active ? 'yes' : 'no',
                                formatDate(entry.createdAt),
                                (await guild.members.fetch(entry.approverId))
                                    .displayName,
                            ];
                        })
                    );

                    const table = AsciiTable.factory({
                        heading: [
                            'Event Date',
                            'Member',
                            'Event Name',
                            'Dkp Value',
                            'Event Active',
                            'Approve Date',
                            'Approver',
                        ],
                        rows,
                    });

                    await sendCodeBlocks(table.toString(), (partialMessage) =>
                        author.send(partialMessage)
                    );

                    const hasNext = await earnedDkpCursor.hasNext();
                    nextBatch = hasNext;

                    if (hasNext) {
                        await author.send(
                            `Write \`${nextIndicator}\` if you want to see next batch of event entries.`
                        );
                        const shouldNext =
                            await authorInitiatorMsg.channel.awaitMessages({
                                filter: (response: Message) =>
                                    msg.author.id === response.author.id,
                                max: 1,
                                time: 180000,
                                errors: ['time'],
                            });

                        nextBatch =
                            shouldNext.first()?.content === nextIndicator;
                    }
                }
                return await author.send(`That is all I have found for you!`);
            } catch (error) {
                if (error instanceof Collection) {
                    return await author.send(
                        `Time for \`${nextIndicator}\` is up!`
                    );
                }

                throw error;
            }
        }

        throw new InvalidUsageError(
            'Invalid command, send `!help` for list of available commands.'
        );
    },
};

function formatDate(date: Date, timeZone = 'Europe/Warsaw') {
    return format(utcToZonedTime(date, timeZone), 'yyyy/MM/dd HH:mm zzz', {
        timeZone,
    });
}

async function fetchMemberById(
    msg: Message,
    id: Snowflake
): Promise<GuildMember | null> {
    try {
        return await (msg.guild as Guild).members.fetch(id);
    } catch (err) {
        return null;
    }
}
