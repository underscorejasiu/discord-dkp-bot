import { Snowflake } from 'discord.js';
import { PrivilegedRole } from './privileged-role.type';

export interface Config {
    PrivilegedRoles: PrivilegedRole[];
}

export interface DkpGroupConfig {
    guildId: Snowflake;
    groupId: Snowflake;
    registrantId: Snowflake;
    createdAt: Date;
    active?: boolean;
    config?: Config;
}
