import { Snowflake } from 'discord.js';

export interface DkpRegisteredChannel {
    guildId: Snowflake;
    channelId: Snowflake;
    registrantId: Snowflake;
    createdAt: Date;
    active?: boolean;
}
