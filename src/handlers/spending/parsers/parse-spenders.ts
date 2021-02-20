import { User } from 'discord.js';
import { InvalidUsageError } from '../../../models/invalid-ussage-error.model';

export function parseSpenders(users: User[]): User[] {
    if (users.length === 0) {
        throw new InvalidUsageError(`Need to specify at least 1 user!`);
    }

    return users;
}
