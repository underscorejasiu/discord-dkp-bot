import { Channel, Snowflake } from 'discord.js';
import { dkpChannelsService } from '../../../services/dkp-channels.service';
import { InvalidUsageError } from '../../../models/invalid-ussage-error.model';

export async function parseApplicableChannels(
    guildId: Snowflake,
    channeles: Channel[],
    addedChannel = false
) {
    if (channeles.length === 0) {
        throw new InvalidUsageError(
            `Need to specify at least 1 input channel!`
        );
    }

    const channelsIds = channeles.map(({ id }) => id);
    const alreadyAppliedChannels = new Set(
        await (
            await dkpChannelsService.findChannels({
                channelId: { $in: channelsIds },
                guildId,
                active: true,
            })
        )
            .map((channel) => channel.channelId)
            .toArray()
    );
    const applicableChannels = channelsIds.filter(
        (channelId) => alreadyAppliedChannels.has(channelId) === addedChannel
    );

    if (applicableChannels.length === 0) {
        throw new InvalidUsageError(
            `Need to specify at least 1 unregistered input channel!`
        );
    }

    return applicableChannels;
}
