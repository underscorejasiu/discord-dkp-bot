import { Message } from 'discord.js';
import { Permissions } from '../../../models/dkp-permissions';
import { InvalidUsageError } from '../../../models/invalid-ussage-error.model';
import { dkpRolesService } from '../../../services/dkp-privileged-roles.service';

export const parseApplicableRoles = async (
    permissionType: Permissions,
    msg: Message,
    havePermission = false
) => {
    const roles = msg.mentions.roles.map((role) => role.id);

    if (roles.length === 0) {
        throw new InvalidUsageError(`Need to specify at least 1 role!`);
    }

    const alreadyAppliedRoles = new Set(
        await (
            await dkpRolesService.findRoles({
                roleId: { $in: roles },
                guildId: msg.guild?.id,
                active: true,
                permissionType: permissionType,
            })
        )
            .map((role) => role.roleId)
            .toArray()
    );
    const applicableRoles = roles.filter(
        (role) => alreadyAppliedRoles.has(role) === havePermission
    );

    if (applicableRoles.length === 0) {
        throw new InvalidUsageError(
            `Need to specify at least 1 role that don't have this permission!`
        );
    }

    return applicableRoles;
};
