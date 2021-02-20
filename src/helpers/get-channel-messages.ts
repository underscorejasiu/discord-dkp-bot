import { TextChannel, Message } from 'discord.js';

export async function getChannelMessages(
    channel: TextChannel,
    cursor?: string | null
): Promise<Message[]> {
    return Array.from(
        (
            await channel.messages.fetch({
                limit: 50,
                ...(cursor ? { before: cursor } : {}),
            })
        ).values()
    );
}
