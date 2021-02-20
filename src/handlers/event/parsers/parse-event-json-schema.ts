import Ajv2019 from 'ajv';
import { InvalidUsageError } from '../../../models/invalid-ussage-error.model';
import { ExtendedEventSchema } from '../../../models/dkp-event.type';

const ajv = new Ajv2019();
const extendedEventSchema = {
    type: 'object',
    properties: {
        value: { type: 'integer' },
        modifiers: {
            type: 'array',
            uniqueItems: true,
            minItems: 1,
            items: { $ref: '#/$defs/simpleEvent' },
        },
        levels: {
            type: 'array',
            uniqueItems: true,
            minItems: 1,
            items: { $ref: '#/$defs/simpleEvent' },
        },
    },
    additionalProperties: false,
    anyOf: [
        { required: ['value'] },
        { required: ['modifiers'] },
        { required: ['levels'] },
    ],
    $defs: {
        simpleEvent: {
            type: 'object',
            required: ['name', 'value'],
            properties: {
                name: { type: 'string' },
                value: { type: 'integer' },
            },
        },
    },
};

const validate = ajv.compile<ExtendedEventSchema>(extendedEventSchema);

export const parseEventJsonSchema = (
    jsonValue: string
): ExtendedEventSchema => {
    let parsedInput: ExtendedEventSchema;
    try {
        parsedInput = JSON.parse(jsonValue);
    } catch (err) {
        throw new InvalidUsageError(
            `Incorrect json provided, consult spec for more info.`
        );
    }

    validate(parsedInput);
    if (validate.errors) {
        throw new InvalidUsageError(
            `Incorrect json provided, consult spec for more info.`
        );
    }

    if (
        ['levels', 'modifiers'].some(
            (property) =>
                parsedInput[property] &&
                new Set(parsedInput[property].map(({ name }) => name)).size !==
                    parsedInput[property].length
        )
    ) {
        throw new InvalidUsageError(
            `Levels and modifiers names needs to be uniq.`
        );
    }

    return parsedInput;
};
