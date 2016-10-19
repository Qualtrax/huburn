(function() {

  angular
    .module('huburn')
    .factory('dateService', dateService);

    function dateService() {
        
        return {
            getTimeBetween: getTimeBetween,
            toDays: toDays
        };

        function getTimeBetween(firstDate, secondDate) {
            return secondDate.getTime() - firstDate.getTime();
        }

        function toDays(timeInMilliseconds) {
            var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
            return round(timeInMilliseconds/oneDay);
        }

        function round(value) {
           return Number(Math.round(value + 'e1') + 'e-1');
        }
    }
}());  