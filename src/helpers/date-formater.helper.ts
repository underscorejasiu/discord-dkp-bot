import { format, utcToZonedTime } from 'date-fns-tz';
import { Duration, formatDuration } from 'date-fns';

export function formatDate(date: Date, timeZone = 'Europe/Warsaw'): string {
    return format(utcToZonedTime(date, timeZone), 'yyyy-MM-dd HH:mm:ssXXX', {
        timeZone,
    });
}

export function formatTime(duration: Duration): string {
    return formatDuration(duration, { format: ['hours', 'minutes'] });
}
