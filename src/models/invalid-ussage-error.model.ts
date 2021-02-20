export const InvalidUsageErrorName = 'InvalidUsageError';

export class InvalidUsageError extends Error {
    name = InvalidUsageErrorName;

    constructor(message) {
        super(message);
    }
}
