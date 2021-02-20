import { DkpAcceptanceStatus } from './dkp-acceptance-status';

export const StatusesMap = new Map([
    ['❌', DkpAcceptanceStatus.Rejected],
    ['✅', DkpAcceptanceStatus.Accepted],
]);
