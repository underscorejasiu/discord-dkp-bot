import config from 'config';

import { InvalidUsageErrorName } from './src/models/invalid-ussage-error.model';
import { handleCommand } from './src/commands/commands.handler';
import { dkpAcceptanceWatcher } from './src/services/discord-ss-watcher.service';
import { dbPoolService } from './src/services/db-pool.service';
import { Client, Intents, Message } from 'discord.js';
import { dkpMessageRemovedService } from './src/services/discord-removed-messages.service';
import { dkpMessageEditedService } from './src/services/discord-edited-messages.service';

dbPoolService.initPool();

const client = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
});
client.login(config.get('discord.token'));

client.on('ready', async () => {
    await dkpAcceptanceWatcher.init(client);
    await dkpMessageRemovedService.init(client);
    await dkpMessageEditedService.init(client);
});

client.on('messageCreate', async (msg: Message) => {
    if (msg.author.bot) {
        return;
    }

    if (msg.content.startsWith(config.get('discord.prefix'))) {
        try {
            await handleCommand(msg);
        } catch (err) {
            if (err.name === InvalidUsageErrorName) {
                void msg.reply(err.message);
            } else {
                console.error(err);
                void msg.reply('Something went wrong ;(');
            }
        }
    }
});
