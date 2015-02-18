(function() {

  angular
    .module('huburn')
    .factory('availabilityService', availabilityService);

    function availabilityService () {
      return {
        getAvailability: getAvailability,
        getRecommendedPoints: getRecommendedPoints
      };

    function getAvailability (daysInIteration, companyDaysOff, teamMembers) {
      var totalDays = (daysInIteration - companyDaysOff) * teamMembers.length;

      var totalDaysOff = teamMembers.map(function(teamMember) { 
        return teamMember.daysOff
      }).reduce(function(total, daysOff) {
        return total + daysOff;
      }, 0);

      return totalDays - totalDaysOff;
    }

    function getRecommendedPoints (milestones, availabilityInDays) {
      var totalPointsPerDay = milestones.map(function(milestone) {
        return milestone.metadata.pointsEarned / milestone.metadata.availabilityInDays;
      }).reduce(function(total, pointsPerDay) {
        return total + pointsPerDay;
      }, 0);

      var averagePointsPerDay = totalPointsPerDay / milestones.length;
      return averagePointsPerDay * availabilityInDays;
    }
  }
}());  
