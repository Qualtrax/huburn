(function() {
    var milestonesInVelocity = 6;

    angular.module('huburn').factory('velocityMetrics', function() {

        return { 
          getMetrics: getMetrics,
          getCurrentSprintMetrics: getCurrentSprintMetrics
        };

        function getMetrics(milestones) {
          
          var metrics = {
            met: { value: 0, class: '' },
            totalPoints: { value: 0, class: '' },
            freeranges: { value: 0, class: '' },
            scopeChanges: { value: 0, class: '' },
            firelanes: { value: 0, class: '' },
            escalations: { value: 0, class: '' },
            zeroDefects: { value: 0, class: '' },
            nearMisses: { value: 0, class: '' },
            categories: []
          };

          if (!milestones.length)
            return metrics;

          var velocityMilestones = milestones.slice (-milestonesInVelocity);

          metrics.met.value = velocityMilestones.filter(met).length;
          metrics.met.class = metClass(metrics.met.value);

          metrics.freeranges.value = velocityMilestones.map(freeranges).reduce(sum) / milestonesInVelocity;

          metrics.firelanes.value = velocityMilestones.map(firelanes).reduce(sum) / milestonesInVelocity;
          metrics.firelanes.class = firelaneClass(metrics.firelanes.value);

          metrics.escalations.value = velocityMilestones.map(escalations).reduce(sum) / milestonesInVelocity;
          metrics.escalations.class = escalationClass(metrics.escalations.value);

          metrics.scopeChanges.value = velocityMilestones.map(scopeChanges).reduce(sum) / milestonesInVelocity;
          metrics.scopeChanges.class = scopeChangesClass(metrics.scopeChanges.value);

          metrics.zeroDefects.value = velocityMilestones.map(zeroDefects).reduce(sum) / milestonesInVelocity;
          
          metrics.nearMisses.value = velocityMilestones.map(nearMisses).reduce(sum) / milestonesInVelocity;
          
          var totalPoints = velocityMilestones.map(totalMilestonePoints).reduce(sum);
          metrics.totalPoints.value = totalPoints / milestonesInVelocity;
          
          metrics.categories.push(getCategoryData("FREERANGES", freerangeCategory, velocityMilestones, totalPoints));
          metrics.categories.push(getCategoryData("FIRELANES", firelaneCategory, velocityMilestones, totalPoints));
          metrics.categories.push(getCategoryData("ESCALATIONS", escalationCategory, velocityMilestones, totalPoints));
          metrics.categories.push(getCategoryData("NEAR MISSES", nearMissCategory, velocityMilestones, totalPoints));
          metrics.categories.push(getCategoryData("BUILD MACHINE", buildCategory, velocityMilestones, totalPoints));
          metrics.categories.push(getCategoryData("ZERO DEFECTS", zeroDefectCategory, velocityMilestones, totalPoints));
          metrics.categories.push(getCategoryData("FEATURES", featureCategory, velocityMilestones, totalPoints));
          metrics.categories.push(getCategoryData("RESEARCH", researchCategory, velocityMilestones, totalPoints));
          metrics.categories.push(getCategoryData("TECHNICAL DEBT", technicalDebtCategory, velocityMilestones, totalPoints));
          
          metrics.categories.sort(descendingCategory);

          return metrics;
        }

        function getCurrentSprintMetrics(currentMilestone) {
          var currentMetrics = {
            zeroDefectBacklog: { value: 0, class: '' },
            nearMissBacklog: { value: 0, class: '' }
          };

          if (!currentMilestone)
            return currentMetrics;

          currentMetrics.zeroDefectBacklog.value = currentMilestone.metadata.zeroDefectBacklog;

          currentMetrics.nearMissBacklog.value = currentMilestone.metadata.nearMissBacklog;

          return currentMetrics;
        }
        
        function getCategoryData(title, categoryFunction, velocityMilestones, totalPoints) {
            var category = {
                title: title,
                count: Math.round(velocityMilestones.map(categoryFunction).reduce(sum) / totalPoints * 100)
            };
            
            return category;
        }

        function getVelocityMilestones(data) { return data.slice(-milestonesInVelocity); };
        function sum(a,b) { return a+b; };
        function descendingCategory(a,b) { return b.count - a.count; };
        function met(m) { return m.metadata.met; };
        function points(m) { return m.metadata.totalPointsWorkedOn };
        function freeranges(m) { return m.metadata.freeranges; };
        function firelanes(m) { return m.metadata.firelanes; };
        function escalations(m) { return m.metadata.escalations; };
        function scopeChanges(m) { return m.metadata.scopeChanges; };
        function zeroDefects(m) { return m.metadata.zeroDefects; };
        function zeroDefectBacklog(m) { return m.metadata.zeroDefectBacklog; };
        function nearMisses(m) { return m.metadata.nearMisses; };
        function nearMissBacklog(m) { return m.metadata.nearMissBacklog; };
        function totalMilestonePoints(m) { return m.metadata.totalPointsWorkedOn; };
        function freerangeCategory(m) { return m.metadata.categories.freerange; }
        function firelaneCategory(m) { return m.metadata.categories.firelane; }
        function escalationCategory(m) { return m.metadata.categories.escalation; }
        function nearMissCategory(m) { return m.metadata.categories.nearMiss; }
        function buildCategory(m) { return m.metadata.categories.build; }
        function zeroDefectCategory(m) { return m.metadata.categories.zeroDefect; }
        function featureCategory(m) { return m.metadata.categories.feature; }
        function researchCategory(m) { return m.metadata.categories.research; }
        function technicalDebtCategory(m) { return m.metadata.categories.technicalDebt; }

        function metClass(value) {
          if (value == 6) return 'super-green';
          else if (value == 5) return 'green';
          else if (value == 4 || value == 3) return 'yellow';
          else return 'red';
        }

        function scopeChangesClass(value) {
          if (value == 0) return 'super-green';
          else if (value <= 3 / milestonesInVelocity) return 'green';
          else if (value <= 5 / milestonesInVelocity) return 'yellow';
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
          else if (value <= 1.5) return 'green';
          else if (value <= 3) return 'yellow';
          else return 'red';
        }

    });
})();