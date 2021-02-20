import {
    EventType,
    ExtendedDkpEvent,
    PlainDkpEvent,
} from '../../../models/dkp-event.type';
import { InvalidUsageError } from '../../../models/invalid-ussage-error.model';

const EventRegExp =
    /^(?<command>[\w\-\/\\]+)(?::(?:(?<levelsRange>\w+?-\w+?)|(?<list>(?:\w+,?)*?))){0,1}(?:\+(?<modifiers>(?:\w+?,?)*)){0,1}$/i;

export interface MatchedCommand {
    command: string;
    fullCommand: string;
    levelsRange?: [string, string];
    list?: string[];
    modifiers?: string[];
}

export function parseEventCommand(fullCommand: string): MatchedCommand {
    const lowercased = fullCommand ? fullCommand.toLowerCase() : '';
    const match = lowercased.match(EventRegExp);
    if (!match) {
        throw new InvalidUsageError(
            `Event: ${fullCommand} is invalid. Please recheck your message.`
        );
    }

    return {
        command: match.groups?.command as string,
        levelsRange: (match.groups?.levelsRange as string)?.split('-') as [
            string,
            string
        ],
        list: (match.groups?.list as string)?.split(',') as string[],
        modifiers: (match.groups?.modifiers as string)?.split(',') as string[],
        fullCommand,
    };
}

export interface ParsedCommand {
    value: number;
}

export function parseCommandAgainstEventValue(
    command: MatchedCommand,
    eventValue: ExtendedDkpEvent | PlainDkpEvent
): ParsedCommand {
    if (eventValue.type === EventType.Plain) {
        return { value: eventValue.value || 0 };
    }

    if (!(command.levelsRange || command.list || command.modifiers)) {
        return { value: eventValue.value.value || 0 };
    }

    let aggregatedValue: number = eventValue.value.value || 0;
    if (
        Array.isArray(eventValue.value.levels) &&
        (command.list?.length || command.levelsRange?.length)
    ) {
        const levels = eventValue.value.levels || [];
        const levelsSet = new Set(levels.map(({ name }) => name));
        const providedLevels = (command.list ||
            command.levelsRange) as string[];
        const notFoundLevels = providedLevels.filter(
            (levelName) => !levelsSet.has(levelName)
        );
        if (notFoundLevels.length > 0) {
            throw new InvalidUsageError(
                `Event: ${command.command} doesn't have following levels: ${notFoundLevels}.`
            );
        }

        if (command.levelsRange) {
            const [left, right] = command.levelsRange;

            if (left === right) {
                throw new InvalidUsageError(
                    `Levels range [${left}] are identical, range should contain uniq levels.`
                );
            }

            const leftIndex = levels.findIndex((level) => level.name === left);
            const rightIndex = levels.findIndex(
                (level) => level.name === right
            );

            if (leftIndex > rightIndex) {
                throw new InvalidUsageError(
                    `Levels range have incorrect order: [${left}, ${right}].`
                );
            }

            aggregatedValue = levels.reduce(
                (acc, level, index) =>
                    index >= leftIndex && index <= rightIndex
                        ? acc + level.value
                        : acc,
                aggregatedValue
            );
        }

        if (command.list) {
            const providedLevelsSet = new Set(command.list);
            aggregatedValue = levels
                .filter((level) => providedLevelsSet.has(level.name))
                .reduce((acc, level) => acc + level.value, aggregatedValue);
        }
    }

    if (Array.isArray(eventValue.value.modifiers) && command.modifiers) {
        const modifiers = eventValue.value.modifiers || [];
        const modifiersSet = new Set(modifiers.map(({ name }) => name));
        const notFoundModifiers = command.modifiers.filter(
            (modifier) => !modifiersSet.has(modifier)
        );
        if (notFoundModifiers.length > 0) {
            throw new InvalidUsageError(
                `Event: ${command.command} doesn't have following mopdifiers: ${notFoundModifiers}.`
            );
        }

        const providedModifiersSet = new Set(command.modifiers);
        aggregatedValue = modifiers
            .filter((level) => providedModifiersSet.has(level.name))
            .reduce((acc, modifier) => acc + modifier.value, aggregatedValue);
    }

    return { value: aggregatedValue };
}
