import { Message } from 'discord.js';

interface CommandCommon {
    name: string;
    description: string;
}

export type CommandWithArgs = {
    execute(msg: Message, args: string[]): Promise<Message | Message[] | null>;
} & CommandCommon;

type CommandWithoutArgs = {
    execute(msg: Message): Promise<Message | Message[]>;
} & CommandCommon;

export type Command = CommandWithArgs | CommandWithoutArgs;
