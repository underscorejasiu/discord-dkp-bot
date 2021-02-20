import { Guild, Message } from 'discord.js';
import { Permissions } from '../models/dkp-permissions';
import { InvalidUsageError } from '../models/invalid-ussage-error.model';
import { dkpRolesService } from '../services/dkp-privileged-roles.service';

export async function checkIfSufficientPermissions(
    msg: Message,
    permissionType: Permissions
): Promise<void> {
    if ((await (msg.guild as Guild).fetchOwner()).id === msg.author.id) {
        return;
    }

    const userRoles = msg.member?.roles.cache.map((role) => role.id);
    if (
        (await (
            await dkpRolesService.findRoles({
                roleId: { $in: userRoles },
                guildId: msg.guild?.id,
                active: true,
                permissionType,
            })
        ).count()) > 0
    ) {
        return;
    }

    throw new InvalidUsageError(
        'You dont have permissions for this operation. Ask channel owner for permisions.'
    );
}
