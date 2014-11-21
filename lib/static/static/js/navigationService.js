(function() {

  angular.module('huburn').factory('navigationService', function() {
      var listeners = [];

      var service = {
        addListener: addListener,
        update: update,
        clear: clear
      };

      return service;

      function addListener (listener) {
        listeners.push(listener);
      }

      function update (route, repo, title) {
        for(var i = 0; i < listeners.length; i++) {
          listeners[i](route, repo, title);
        }
      }

      function clear () {
        for(var i = 0; i < listeners.length; i++) {
          listeners[i]('', '', '');
        }
      }
    });
}());  
