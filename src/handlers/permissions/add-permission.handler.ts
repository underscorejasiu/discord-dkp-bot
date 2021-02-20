import { Collection, Guild, Message, Snowflake } from 'discord.js';
import { InvalidUsageError } from '../../models/invalid-ussage-error.model';
import { parsePermissionType } from './parsers/parse-permission-type';
import { parseApplicableRoles } from './parsers/parse-applicable-roles';
import { dkpRolesService } from '../../services/dkp-privileged-roles.service';
import { Permissions } from '../../models/dkp-permissions';

export async function addPermission(msg: Message, args): Promise<string> {
    const guildId = (msg.guild as Guild).id;
    const permissionsDetails: {
        type: Permissions | null;
        roles: Snowflake[];
    } = {
        type: null,
        roles: [],
    };
    if (args.length > 1) {
        permissionsDetails.type = parsePermissionType(args[1]);
        permissionsDetails.roles = await parseApplicableRoles(
            permissionsDetails.type,
            msg
        );
    } else {
        try {
            await msg.reply(
                `Please permission name (${Object.values(Permissions)}):`
            );
            const collectedName = await msg.channel.awaitMessages({
                filter: (response: Message) =>
                    msg.author.id === response.author.id,
                max: 1,
                time: 30000,
                errors: ['time'],
            });

            permissionsDetails.type = await parsePermissionType(
                (collectedName.first() as Message).content
            );

            await msg.reply(
                `Please mention roles that should be granted with ${permissionsDetails.type} permission:`
            );
            const collectedRoles = await msg.channel.awaitMessages({
                filter: (response: Message) =>
                    msg.author.id === response.author.id,
                max: 1,
                time: 30000,
                errors: ['time'],
            });
            permissionsDetails.roles = await parseApplicableRoles(
                permissionsDetails.type,
                collectedRoles.first() as Message
            );
        } catch (error) {
            if (error instanceof Collection) {
                throw new InvalidUsageError('Got no response. Aborting.');
            }

            throw error;
        }
    }

    await dkpRolesService.addRoles(
        permissionsDetails.roles.map((roleId) => ({
            permissionType: permissionsDetails.type as Permissions,
            createdAt: msg.createdAt,
            roleId,
            guildId,
        }))
    );

    return `Given permission to ${
        permissionsDetails.type
    } for roles: ${permissionsDetails.roles.map((roleId) => `<@&${roleId}>`)}.`;
}
