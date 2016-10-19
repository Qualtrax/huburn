(function () {
    'use strict';

    describe('Date Service', function () {
        var dateService;

        beforeEach(module('huburn'));

        beforeEach(inject(function (_dateService_) {
            dateService = _dateService_;
        }));

        it('toDays returns correct number of days', function () {
            var twoDaysInMilliseconds = 172800000;
            var days = dateService.toDays(twoDaysInMilliseconds);

            expect(days).toBe(2);
        });

        it('toDays rounds to nearest tenth', function () {
            var oneAndAHalfDayInMilliseconds = 129600000;
            var days = dateService.toDays(oneAndAHalfDayInMilliseconds);

            expect(days).toBe(1.5);
        });

        it('toDays rounds to nearest tenth', function () {
            var dateOne = new Date("2016-07-05T19:19:20Z");
            var dateTwo = new Date("2016-07-06T19:19:20Z");
            var difference = dateService.getTimeBetween(dateOne, dateTwo);
            var days = dateService.toDays(difference);

            expect(days).toBe(1);
        });

        it('toHours returns 3 hours for 10800000 milliseconds', function () {
            var threeHoursOfMilliseconds = 10800000;
            var hours = dateService.toHours(10800000);

            expect(hours).toBe(3);
        });
    });
})();