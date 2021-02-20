import { mapSeries } from 'async';
import { Formatters, Message, Util } from 'discord.js';

export async function sendCodeBlocks(
    message: string,
    sendMethod: (partialMessage: string) => Promise<Message>
): Promise<Message[]> {
    return await mapSeries<string, Message>(
        Util.splitMessage(Formatters.codeBlock('\n' + message), {
            prepend: '```\n',
            append: '```',
        }),
        async (data) => await sendMethod(data)
    );
}

export function sendText(
    message: string,
    sendMethod: (partialMessage: string) => Promise<Message>
): Promise<Message[]> {
    return mapSeries(
        Util.splitMessage(message),
        async (data) => await sendMethod(data)
    );
}
