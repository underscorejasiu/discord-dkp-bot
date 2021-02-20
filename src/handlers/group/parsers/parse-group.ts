import { Collection, Role, Snowflake, User } from 'discord.js';
import { InvalidUsageError } from '../../../models/invalid-ussage-error.model';

export function parseGroup(roles: Collection<Snowflake, Role>): Role {
    if (roles.size !== 1) {
        throw new InvalidUsageError(`Need to specify exactly 1 role!`);
    }

    return roles.first() as Role;
}
