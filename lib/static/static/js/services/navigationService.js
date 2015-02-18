(function() {
  'use strict'

  angular
    .module('huburn')
    .factory('navigationService', navigationService);

    function navigationService() {
      return {
        update: update,
        clear: clear
      };

    function update (repo) {
      this.repo = repo;
    }

    function clear () {
      this.repo = "";
    }
  }
}()); 
