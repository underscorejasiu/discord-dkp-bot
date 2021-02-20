import { Snowflake } from 'discord.js';
import { ObjectId } from 'mongodb';

export interface DkpEarned {
    dkpMessageId: ObjectId;
    dkpEventId: ObjectId;
    earnedDkp: number;
    approverId: Snowflake;
    receiverId: Snowflake;
    guildId: Snowflake;
    createdAt: Date;
}
