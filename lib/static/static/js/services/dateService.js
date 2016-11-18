(function() {

  angular
    .module('huburn')
    .factory('dateService', dateService);

    function dateService() {
        var hoursInADay = 24;
        var minutesInAnHour = 60;
        var secondsInAMinute = 60;
        var millisecondsInASecond = 1000;

        return {
            daysToMinutes: daysToMinutes,
            daysToHours: daysToHours,
            getTimeBetween: getTimeBetween,
            toHours: toHours,
            toDays: toDays,
            toDaysNotRounded: toDaysNotRounded
        };

        function getTimeBetween(firstDate, secondDate) {
            return secondDate.getTime() - firstDate.getTime();
        }

        function toDays(timeInMilliseconds) {
            var millisecondsInADay = hoursInADay * getMillisecondsInAnHour();
            return round(timeInMilliseconds / millisecondsInADay);
        }

        function toDaysNotRounded(timeInMilliseconds) {
            var millisecondsInADay = hoursInADay * getMillisecondsInAnHour();
            return timeInMilliseconds / millisecondsInADay;
        }

        function toHours(timeInMilliseconds) {
            var millisecondsInAnHour = minutesInAnHour * secondsInAMinute * millisecondsInASecond;
            return round(timeInMilliseconds / millisecondsInAnHour);
        }

        function daysToMinutes(timeInDays) {
            return timeInDays * hoursInADay * minutesInAnHour;
        }

        function daysToHours(timeInDays) {
            return timeInDays * hoursInADay;
        }

        function getMillisecondsInAnHour() {
            return minutesInAnHour * secondsInAMinute * millisecondsInASecond;
        }

        function round(value) {
           return Number(Math.round(value + 'e1') + 'e-1');
        }
    }
}());  