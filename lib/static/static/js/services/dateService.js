(function() {

  angular
    .module('huburn')
    .factory('dateService', dateService);

    function dateService() {
        
        return {
            getTimeBetween: getTimeBetween,
            toHours: toHours,
            toDays: toDays
        };

        function getTimeBetween(firstDate, secondDate) {
            return secondDate.getTime() - firstDate.getTime();
        }

        function toDays(timeInMilliseconds) {
            var oneDay = 24*60*60*1000; // days*minutes*seconds*milliseconds
            return round(timeInMilliseconds/oneDay);
        }

        function toHours(timeInMilliseconds) {
            var oneHour = 60*60*1000; // hours*minutes*seconds*milliseconds
            return round(timeInMilliseconds/oneHour);
        }

        function round(value) {
           return Number(Math.round(value + 'e1') + 'e-1');
        }
    }
}());  