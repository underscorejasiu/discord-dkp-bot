import { Formatters, Guild, Message, User } from 'discord.js';
import { DkpSpending } from '../../models/dkp-spending';
import { InvalidUsageError } from '../../models/invalid-ussage-error.model';
import { parseScore } from '../event/parsers/parse-event-score';
import { parseSpenders } from './parsers/parse-spenders';
import { parseSpendingName } from './parsers/parse-spending-name';
import { dkpSpendingsService } from '../../services/dkp-spendings.service';
import { dkpUserService } from '../../services/dkp-users.service';
import { AnyBulkWriteOperation } from 'mongodb';
import { DkpUser } from '../../models/dkp-user.type';

const SpendingNameRegexp = /^.+`(?<spendingName>.+)` (?<dkpSpent>\d+)$/;
const CodeBlockRegexp = /^`(?<code>.+)`$/;

export async function addSpending(msg: Message): Promise<string> {
    const guildId = (msg.guild as Guild).id;
    const spendingDetails: {
        spendingName: string | null;
        dkpSpent: number | null;
        spenders: User[] | null;
    } = { spendingName: null, dkpSpent: null, spenders: null };
    if (msg.mentions.users.size) {
        const matchedMessage = msg.content.match(SpendingNameRegexp);
        if (!matchedMessage) {
            throw new InvalidUsageError(
                `Command is invalid. Please recheck your message.`
            );
        }

        spendingDetails.spenders = parseSpenders(
            Array.from(msg.mentions.users.values())
        );
        spendingDetails.spendingName = parseSpendingName(
            matchedMessage.groups?.spendingName
        );
        spendingDetails.dkpSpent = parseScore(matchedMessage.groups?.dkpSpent);
    } else {
        await msg.reply(`Mention spenders:`);
        const collectedNames = await msg.channel.awaitMessages({
            filter: (response: Message) => msg.author.id === response.author.id,
            max: 1,
            time: 30000,
            errors: ['time'],
        });
        spendingDetails.spenders = parseSpenders(
            Array.from(
                (collectedNames.first() as Message).mentions.users.values()
            )
        );

        await msg.reply(`Mention name in code block (ex. \`Sword +10\`):`);
        const collectedSpendingName = await msg.channel.awaitMessages({
            filter: (response: Message) => msg.author.id === response.author.id,
            max: 1,
            time: 30000,
            errors: ['time'],
        });
        spendingDetails.spendingName = parseSpendingName(
            (collectedSpendingName.first() as Message).content.match(
                CodeBlockRegexp
            )?.groups?.code
        );

        await msg.reply(`Provide dkp spent:`);
        const collectedDkpSpent = await msg.channel.awaitMessages({
            filter: (response: Message) => msg.author.id === response.author.id,
            max: 1,
            time: 30000,
            errors: ['time'],
        });
        spendingDetails.dkpSpent = parseScore(
            (collectedDkpSpent.first() as Message).content
        );
    }

    const spendDate = new Date();
    const spendings: DkpSpending[] = spendingDetails.spenders.map(
        (spender: User) => ({
            createdAt: spendDate,
            messageId: msg.id,
            channelId: msg.channelId,
            reporterId: msg.author.id,
            spenderId: spender.id,
            value: spendingDetails.dkpSpent as number,
            name: spendingDetails.spendingName as string,
            guildId,
            reverted: false,
        })
    );
    const addedSpendings = await dkpSpendingsService.addSpendings(spendings);
    await dkpUserService.bulkWriteDkpUsers(
        spendings.map(
            (spending): AnyBulkWriteOperation<DkpUser> => ({
                updateOne: {
                    filter: {
                        discordGuildId: guildId,
                        discordUserId: spending.spenderId,
                    },
                    update: {
                        $inc: { dkpValue: -Math.abs(spending.value) },
                        $set: { modifiedAt: spendDate },
                        $setOnInsert: {
                            active: true,
                            createdAt: spendDate,
                        },
                    },
                    upsert: true,
                },
            })
        )
    );

    return `Registered spending named: ${Formatters.inlineCode(
        spendingDetails.spendingName
    )} with value ${Formatters.inlineCode(
        spendingDetails.dkpSpent.toString()
    )} for:\n${spendings
        .map(
            (spending, index) =>
                `${Formatters.userMention(
                    spending.spenderId
                )}, spending id: ${Formatters.inlineCode(
                    addedSpendings.insertedIds[index].toHexString()
                )}`
        )
        .join('\n')}`;
}
