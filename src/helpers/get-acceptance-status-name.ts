import { DkpAcceptanceStatus } from '../models/dkp-acceptance-status';

const statusNames = {
    [DkpAcceptanceStatus.Pending]: 'Pending',
    [DkpAcceptanceStatus.Accepted]: 'Accepted',
    [DkpAcceptanceStatus.Rejected]: 'Rejected',
};

export const getStatusName = (status: DkpAcceptanceStatus) =>
    statusNames[status];
