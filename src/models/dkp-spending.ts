import { Snowflake } from 'discord.js';
import { ObjectId } from 'mongodb';

export interface DkpSpending {
    id?: ObjectId;
    name: string;
    value: number;
    spenderId: Snowflake;
    reporterId: Snowflake;
    guildId: Snowflake;
    channelId: Snowflake;
    messageId: Snowflake;
    createdAt: Date;
    modifiedAt?: Date;
    reverted?: boolean;
}
