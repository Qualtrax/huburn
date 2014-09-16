(function() {
  var milestonesInVelocity = 6;

  angular.module('huburn')
    .directive('huburnVelocityMetrics', ['d3', '$window', function(d3, $window) {
      return {
        restrict: 'E',
        scope: {
          data: '='
        },
        link: function(scope, element, attrs) {
          var svg = d3.select(element[0])
            .append('svg')
            .attr({ class: 'velocity metrics' });

          function render(data) {
            var height = 140;
            var width = svg.node().offsetWidth;
            renderBadges(data, 40, 0);
          };

          function renderBadges(data, x, y) {
            svg.select('g.badges').remove();

            var badges = svg.append('g').attr({ class: 'badges', transform: translate(x,y) });

            if (!data.length) return;

            var velocityMilestones = getVelocityMilestones(data);

            var numberMet = velocityMilestones.filter(met).length;
            appendBadge(badges, 0, 0, "Met", numberMet, metClass);

            var velocity = (velocityMilestones.map(points).reduce(sum) / milestonesInVelocity).toFixed(1);
            appendBadge(badges, 100, 0, "Velocity", velocity, noValueClass);

            var averageFreeranges = (velocityMilestones.map(freeranges).reduce(sum) / milestonesInVelocity).toFixed(1);
            appendBadge(badges, 240, 0, "Freerange", averageFreeranges, freerangeClass);

            var numberFirelanes = (velocityMilestones.map(firelanes).reduce(sum) / milestonesInVelocity).toFixed(1);
            appendBadge(badges, 390, 0, "Firelanes", numberFirelanes, firelaneClass);

            var numberEscalation = (velocityMilestones.map(escalations).reduce(sum) / milestonesInVelocity).toFixed(1);
            appendBadge(badges, 530, 0, "Escalations", numberEscalation, escalationClass);
          };

          function translate(x,y) { return 'translate(' + x + ',' + y + ')' };
          function getVelocityMilestones(data) { return data.slice(-milestonesInVelocity); };
          function sum(a,b) { return a+b; };
          function met(m) { return m.metadata.met; };
          function points(m) { return m.metadata.pointsEarned ? m.metadata.pointsEarned : m.metadata.points; };
          function freeranges(m) { return m.metadata.freeranges; };
          function firelanes(m) { return m.metadata.firelanes; };
          function escalations(m) { return m.metadata.escalations; };

          function metClass(value) {
            if (value == 6) return 'super-green';
            else if (value == 5) return 'green';
            else if (value == 4 || value == 3) return 'yellow';
            else return 'red';
          }

          function freerangeClass(value) {
            if (value >= 5) return 'super-green';
            else if (value >= 4) return 'green';
            else if (value >= 3) return 'yellow';
            else return 'red';
          }

          function firelaneClass(value) {
            if (value == 0) return 'super-green';
            else if (value <= 2 / milestonesInVelocity) return 'green';
            else if (value <= 3 / milestonesInVelocity) return 'yellow';
            else return 'red';
          }

          function escalationClass(value) {
            if (value < 1) return 'super-green';
            else if (value < 1.5) return 'green';
            else if (value < 2) return 'yellow';
            else return 'red';
          }

          function noValueClass() {
            return '';
          }

          function appendBadge(parent, x, y, title, value, valueClassFunc) {
            var badge = parent.append('g').attr({ class: "badge", transform: "translate(" + x + "," + y + ")" });
            badge.append('text').attr({ class: "title", x: 0, y: 28 }).text(title);

            if (valueClassFunc)
              badge.append('text').attr({ class: "value " + valueClassFunc(value), x: 0, y: 28 + 48 }).text(value);
            else
                  badge.append('text').attr({ class: "value", x: 0, y: 28 + 48 }).text(value);
              };

          window.onresize = function() {
            scope.$apply();
          };

          scope.$watch(function() {
            return angular.element($window)[0].innerWidth;
          }, function() {
            render(scope.data);
          });

          scope.$watch('data', function(newVals, oldVals) {
            return render(newVals);
          }, true);
        }
      };
    }]);

})();