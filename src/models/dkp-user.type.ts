import { Snowflake } from 'discord.js';

export interface DkpUser {
    dkpValue: number;
    discordGuildId: Snowflake;
    discordUserId: Snowflake;
    active: boolean;
    createdAt: Date;
    modifiedAt: Date;
}
