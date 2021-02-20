import { InvalidUsageError } from '../../../models/invalid-ussage-error.model';

export function parseSpendingName(spendingName: any): string {
    if (
        !spendingName ||
        typeof spendingName !== 'string' ||
        spendingName === ''
    ) {
        throw new InvalidUsageError(`Need to specify spending name!`);
    }

    return spendingName;
}
