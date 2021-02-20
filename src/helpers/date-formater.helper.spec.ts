import { expect } from 'chai';
import { formatDate, formatTime } from './date-formater.helper';

describe('date formatted helpers', () => {
    describe('formatDate should return', () => {
        it('timezone +02:00', () => {
            const date = new Date('2020-05-31T06:32+02:00');
            expect(formatDate(date)).to.eq('2020-05-31 06:32:00+02:00');
        });

        it('timezone +04:00', () => {
            const date = new Date('2020-05-31T06:32+02:00');
            expect(formatDate(date, '+04:00')).to.eq(
                '2020-05-31 08:32:00+04:00'
            );
        });
    });

    describe('formatTime should return', () => {
        it('5 min distance', () => {
            const duration: Duration = { minutes: 5 };
            expect(formatTime(duration)).to.eq('5 minutes');
        });

        it('4 h and 5 min distance', () => {
            const duration: Duration = { hours: 4, minutes: 5 };
            expect(formatTime(duration)).to.eq('4 hours 5 minutes');
        });

        it('ignore days', () => {
            const duration: Duration = { days: 13, hours: 4, minutes: 5 };
            expect(formatTime(duration)).to.eq('4 hours 5 minutes');
        });
    });
});
