import { Guild, Message, Snowflake } from 'discord.js';
import { dkpRolesService } from '../../services/dkp-privileged-roles.service';
import { Permissions } from '../../models/dkp-permissions';
import { sendText } from '../../helpers/send-long-msg';

export async function listPermissions(
    msg: Message
): Promise<Message | Message[]> {
    const guildId = (msg.guild as Guild).id;
    const rolesCursor = await dkpRolesService.findRoles({
        guildId,
        active: true,
    });

    if ((await rolesCursor.count()) === 0) {
        return msg.channel.send(`No privileged roles registered.`);
    }

    const roles = await rolesCursor
        .map(({ roleId, permissionType }) => ({ roleId, permissionType }))
        .toArray();
    const groupedRoles = Object.entries(
        roles.reduce((acc, role) => {
            if (!acc[role.permissionType]) {
                acc[role.permissionType] = [];
            }
            acc[role.permissionType].push(role.roleId);

            return acc;
        }, {})
    ).map(
        ([permissionType, roles]: [Permissions, Snowflake[]]) =>
            `${permissionType}: ${roles.map((role) => `<@&${role}>`).join(' ')}`
    );

    return sendText(
        `Registered roles:\n${groupedRoles.join('\n')}`,
        (partialMessage) => msg.channel.send(partialMessage)
    );
}
