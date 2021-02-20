import { InvalidUsageError } from '../../../models/invalid-ussage-error.model';

export const parseScore = (score: any) => {
    const parsedScore = Number(score);
    if (!Number.isInteger(parsedScore)) {
        throw new InvalidUsageError('Score must be natural whole number.');
    }

    if (parsedScore <= 0) {
        throw new InvalidUsageError('Score must be biger than 0.');
    }

    return parsedScore;
};
