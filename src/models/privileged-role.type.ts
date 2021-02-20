import { Snowflake } from 'discord.js';
import { Permissions } from './dkp-permissions';

export interface PrivilegedRole {
    guildId: Snowflake;
    roleId: Snowflake;
    permissionType: Permissions;
    createdAt: Date;
    active: boolean;
}
