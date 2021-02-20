import { Permissions } from '../../../models/dkp-permissions';
import { InvalidUsageError } from '../../../models/invalid-ussage-error.model';

export const parsePermissionType = (type: any): Permissions => {
    if (!Object.values(Permissions).includes(type)) {
        throw new InvalidUsageError(
            'Unknown permissions. Consult specification for avaiable permissions.'
        );
    }

    return type;
};
