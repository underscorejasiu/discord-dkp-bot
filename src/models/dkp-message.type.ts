import { Snowflake } from 'discord.js';
import { DkpAcceptanceStatus } from './dkp-acceptance-status';

export enum DkpMessageSource {
    Discord = 'DISCORD',
}

export interface DiscordMeta {
    messageId: Snowflake;
    replyId: Snowflake;
    guildId: Snowflake;
    channelId: Snowflake;
    approverId?: Snowflake;
    content: string;
    fullEventCommand: string;
    authorId: Snowflake;
    embeds: string[];
    attachments: string[];
    mentionedUsersIds: Snowflake[];
}

export interface DkpMessage {
    source: DkpMessageSource;
    status: DkpAcceptanceStatus;
    eventId: string;
    eventScore: number;
    createdAt: Date;
    modifiedAt?: Date;
}

export interface DiscordDkpMessage extends DkpMessage {
    source: DkpMessageSource.Discord;
    meta: DiscordMeta;
}
