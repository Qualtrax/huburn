(function() {

  angular
    .module('huburn')
    .factory('cycleTimeService', cycleTimeService);

    cycleTimeService.$inject = ['dateService', 'issueService'];

    function cycleTimeService(dateService, issueService) {
        return {
            getEscalationCycleTimes: getEscalationCycleTimes,
            getFirelaneCycleTimes: getFirelaneCycleTimes,
            getCycleTimes: getCycleTimes,
            getStandardDeviationSummary: getStandardDeviationSummary
        };

        function getEscalationCycleTimes(issues) {
            var escalations = issues.filter(function (issue) {
                return hasLabel(issue, [/escalation/]);
            });

            if (escalations.length > 0)
                return getCreatedToDoneCycleTimes(escalations);
            
            return undefined;
        }

        function getFirelaneCycleTimes(issues) {
            var firelanes = issues.filter(function (issue) {
                return hasLabel(issue, [/firelane/]);
            });

            if (firelanes.length > 0)
                return getCreatedToDoneCycleTimes(firelanes);

            return undefined;
        }

        function getCycleTimes(issues) {
            var cycleTimes = {};
            var stories = issues.filter(function (issue) {
                return !hasLabel(issue, [/escalation/, /firelane/, /duplicate/]);
            });

            var acrossTheBoard = getStoryCycleTimes(stories);
            var waitingTimes = getWaitTimes(stories);

            cycleTimes.stories = acrossTheBoard.stories;
            cycleTimes.inProgress = {
                acrossTheBoard: acrossTheBoard.inProgress,
                waitTime: waitingTimes.inProgress
            };
            cycleTimes.review = {
                acrossTheBoard: acrossTheBoard.review,
                waitTime: waitingTimes.review
            };
            cycleTimes.testing = {
                acrossTheBoard: acrossTheBoard.testing,
                waitTime: waitingTimes.testing  
            };
            cycleTimes.merge = {
                acrossTheBoard: acrossTheBoard.merge,
                waitTime: waitingTimes.merge
            };

            return cycleTimes;
        }

        function getCreatedToDoneCycleTimes(issues) {
            var cycleTimes = [];
            issues.forEach(function (issue) {
                cycleTimes.push(getTimeFromCreatedToDone(issue));
            });

            if (cycleTimes.length > 0)
                return dateService.toDays(cycleTimes.reduce(sum) / cycleTimes.length);
            else
                return 0;
        }

        function hasLabel(issue, labels) {
            for (var issueLabelIndex = 0; issueLabelIndex < issue.labels.length; issueLabelIndex++) {
                for (var labelIndex = 0; labelIndex < labels.length; labelIndex++) {
                    if(labels[labelIndex].test(issue.labels[issueLabelIndex].name))
                        return true;
                }
            }
                
            return false;
        }

        function getStoryCycleTimes(issues) {
            var inProgress = getCycleTimeForColumn(issues, '. - In Progress');
            var review = getCycleTimeForColumn(issues, '. - Review');
            var testing = getCycleTimeForColumn(issues, '. - Testing');
            var merge = getCycleTimesForMergeColumn(issues);

            var cycleTimes = [inProgress, review, testing, merge];
            var sumOfCycleTimes = cycleTimes.reduce(sum);

            return {
                stories: sumOfCycleTimes,
                inProgress: inProgress,
                review: review,
                testing: testing,
                merge: merge
            };
        }

        function getStandardDeviationSummary(currentMilestoneIssues, historicalIssues) {
            var pointsLabelsToRetrieve = [1, 2, 3, 5, 8, 13, 20];
            var statistics = [];
            var maxValues = [];

            for (var i = 0; i < pointsLabelsToRetrieve.length; i++) {
                var issuesWithLabel = issueService.getIssuesWithLabel(historicalIssues, 'points: ' + pointsLabelsToRetrieve[i]);
                var historicalInProgressCycles = getCycleTimesForColumn(issuesWithLabel, '. - In Progress')
                    .filter(hasValidCycleTime)
                    .map(getCycleInDays)
                    .sort(sortCycles);                    

                if (historicalInProgressCycles.length < 2)
                    continue;

                var currentIssuesWithLabel = issueService.getIssuesWithLabel(currentMilestoneIssues, 'points: ' + pointsLabelsToRetrieve[i]);                
                var currentInProgressTimes = getCycleTimesForColumn(currentIssuesWithLabel, '. - In Progress')
                    .filter(hasValidCycleTime)
                    .map(getCycleInDays);

                var mean = jStat.mean(historicalInProgressCycles.map(getTimeFromCycle));
                var standardDeviation = jStat.stdev(historicalInProgressCycles.map(getTimeFromCycle));
                var maxValue = mean + (3 * standardDeviation);                

                historicalInProgressCycles = removeAnomalies(historicalInProgressCycles, standardDeviation, mean);
                mean = jStat.mean(historicalInProgressCycles.map(getTimeFromCycle));
                standardDeviation = jStat.stdev(historicalInProgressCycles.map(getTimeFromCycle));
                maxValue = mean + (3 * standardDeviation);
                maxValues.push(maxValue);

                statistics.push({
                    pointsLabel: pointsLabelsToRetrieve[i],
                    numberOfHistoricalItems: historicalInProgressCycles.length,
                    shortestDataPoint: historicalInProgressCycles[0],
                    longestDataPoint: historicalInProgressCycles[historicalInProgressCycles.length - 1],
                    dataPoints: currentInProgressTimes,
                    mean: mean,
                    standardDeviation: standardDeviation
                });
            }

            return  {
                statistics,
                collectiveMaxValue: maxValues.length > 0 ? jStat.max(maxValues) : 0
            };
        }

        function hasValidCycleTime(cycleTime) {
            return cycleTime.time > 0;
        }

        function getTimeFromCycle(cycleTime) {
            return cycleTime.time;
        }

        function getCycleInDays(cycleTime) {
            cycleTime.time = dateService.toDaysNotRounded(cycleTime.time);
            return cycleTime;
        }

        function removeAnomalies(cycles, standardDeviation, mean) {
            return cycles.filter(function (cycle) {
                return cycle.time > (mean - (5 * standardDeviation)) &&
                    cycle.time < (mean + (5 * standardDeviation)) &&
                    dateService.daysToMinutes(cycle.time) > 5;
            });
        }
        
        function sortCycles(cycleOne, cycleTwo) {
            return cycleOne.time - cycleTwo.time;
        }

        function getCycleTimeForColumn(issues, columnLabel) {
            var cycleTimes = getCycleTimesForColumn(issues, columnLabel);

            if (cycleTimes.length > 0)
                return dateService.toDays(cycleTimes.map(function (timeObject) { return timeObject.time; }).reduce(sum) / cycleTimes.length);
            else
                return 0;
        }

        function getCycleTimesForColumn(issues, columnLabel) {
            var cycleTimes = [];

            function labelEvents(e) { return (e.event === 'labeled' || e.event === 'unlabeled') && new RegExp(columnLabel).test(e.label.name); }

            issues.forEach(function (issue) {
                var labeledEvents = issue.events.filter(labelEvents);
                var orderedEvents = labeledEvents.sort(ascendingEvents);
                var timeInColumn = getTimeBetweenLabeling(orderedEvents);

                if (labeledEvents.length % 2 !== 0) {
                    var mostRecentEvent = orderedEvents[orderedEvents.length - 1];
                    if (mostRecentEvent.label.name == columnLabel && mostRecentEvent.event === 'labeled') {
                        var now = new Date(Date.now());
                        timeInColumn += dateService.getTimeBetween(new Date(mostRecentEvent.created_at), now);
                    }
                }

                cycleTimes.push({ issue: issue, time: timeInColumn });
            });

            return cycleTimes;
        }

        function getCycleTimesForMergeColumn(issues) {
            var cycleTimes = [];

            function labelEvents(e) { return (e.event === 'labeled' || e.event === 'unlabeled') && new RegExp('. - Merge').test(e.label.name); }
            function closeEvents(e) { return e.event === 'closed'; }

            issues.forEach(function (issue) {
                var daysInColumn = 0;
                var labeledEvents = issue.events.filter(labelEvents);
                var closedEvents = issue.events.filter(closeEvents);
                closedEvents = closedEvents.sort(descendingEvents);
                var closedEvent = closedEvents[0];
                
                if (labeledEvents.length > 0) {
                    if (labeledEvents.length % 2 === 0) {
                        var closedBeforeMergeLabelWasRemoved = new Date(closedEvent.created_at) < new Date(labeledEvents[labeledEvents.length - 1].created_at);
                        if (closedBeforeMergeLabelWasRemoved)
                            labeledEvents[labeledEvents.length - 1] = closedEvent;
                    }
                    else {
                        labeledEvents.push(closedEvent);
                    }

                    var orderedEvents = labeledEvents.sort(ascendingEvents);
                    daysInColumn = getTimeBetweenLabeling(orderedEvents);
                }

                cycleTimes.push(daysInColumn);
            });

            if (cycleTimes.length > 0)
                return dateService.toDays(cycleTimes.reduce(sum) / cycleTimes.length);
            else
                return 0;
        }

        function getWaitTimes(issues) {
            return {
                inProgress: getWaitTimeForColumn(issues, new RegExp('. - In Progress')),
                review: getWaitTimeForColumn(issues, new RegExp('. - Review')),
                testing: getWaitTimeForColumn(issues, new RegExp('. - Testing')),
                merge: getWaitTimeForColumn(issues, new RegExp('. - Merge'))
            };
        }

        function getWaitTimeForColumn(issues, columnLabelRegularExpression) {
            var waitTimes = [];

            function addedToColumnFilter(e) { return e.event === 'labeled' && columnLabelRegularExpression.test(e.label.name); }
            function removedFromColumnFilter(e) { return e.event === 'unlabeled' && columnLabelRegularExpression.test(e.label.name); }

            issues.forEach(function (issue) {
                var addedToColumnEvents = issue.events.filter(addedToColumnFilter).sort(ascendingEvents);
                var removedFromColumnEvents = issue.events.filter(removedFromColumnFilter).sort(ascendingEvents);
                var readyLabelEvents = issue.events.filter(readyLabelEventsFilter).sort(ascendingEvents);
                
                var issueNeverHadAnyReadyLabels = readyLabelEvents.length < 1;
                if (issueNeverHadAnyReadyLabels)
                    waitTimes.push(0);
                else
                    waitTimes.push(getWaitTimeForEachTimeAddedToColumn(addedToColumnEvents, removedFromColumnEvents, readyLabelEvents));
            });

            if (waitTimes.length > 0)
                return dateService.toHours(waitTimes.reduce(sum) / waitTimes.length);
            else
                return 0;
        }

        function getWaitTimeForEachTimeAddedToColumn(addedToColumnEvents, removedFromColumnEvents, readyLabelEvents) {
            var totalWaitTime = 0;

            addedToColumnEvents.forEach(function (addedToColumnEvent, index) {    
                var waitTimeForTimeInColumn = 0;
                var addedToColumnDate = new Date(addedToColumnEvent.created_at);

                if (removedFromColumnEvents[index] !== undefined)
                    var removedFromColumnDate = new Date(removedFromColumnEvents[index].created_at);
                else
                    var removedFromColumnDate = new Date();

                totalWaitTime += getWaitTimeForColumnDuration(addedToColumnDate, removedFromColumnDate, readyLabelEvents);
            });

            return totalWaitTime;
        }

        function getWaitTimeForColumnDuration(addedToColumnDate, removedFromColumnDate, readyLabelEvents) {
            var readyLabelIndex = indexOfFirstLabelAppliedAfterDate(readyLabelEvents, addedToColumnDate);
            var timeInColumnNeverHadAReadyLabel = readyLabelIndex === undefined;
           
            if (timeInColumnNeverHadAReadyLabel)
                return 0;

            var readyLabelAddedDate = new Date(readyLabelEvents[readyLabelIndex].created_at);
            var columnWaitTime = 0;

            while (readyLabelAddedDate < removedFromColumnDate) {
                if (readyLabelEvents[readyLabelIndex + 1] === undefined)
                    break;

                var readyLabelRemovedDate = new Date(readyLabelEvents[readyLabelIndex + 1].created_at);
                columnWaitTime += dateService.getTimeBetween(readyLabelAddedDate, readyLabelRemovedDate);
                readyLabelIndex += 2;
                
                if (readyLabelIndex > readyLabelEvents.length && readyLabelEvents[readyLabelIndex] !== undefined)
                    readyLabelAddedDate = new Date(readyLabelEvents[readyLabelIndex].created_at);
                else
                    break;
            }
            
            return columnWaitTime;
        }

        function getTimeBetweenLabeling(orderedEvents) {
            var timeBetween = 0;

            orderedEvents.forEach(function (event, index) {
                if (index % 2 === 0 && index + 1 < orderedEvents.length)
                    timeBetween += dateService.getTimeBetween(new Date(orderedEvents[index].created_at), new Date(orderedEvents[index + 1].created_at));
            });

            return timeBetween;
        }

        function indexOfFirstLabelAppliedAfterDate(events, date) {
            for (var index = 0; index < events.length; index++)
                if (new Date(events[index].created_at) > date && events[index].event === 'labeled')
                    return index;

            return undefined;
        }

        function sum(a,b) { return a+b; }
        function ascendingEvents(a,b) { return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); }
        function descendingEvents(a,b) { return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); }
        function getTimeFromCreatedToDone(issue) { return dateService.getTimeBetween(new Date(issue.created_at), new Date(issue.closed_at)); }
        function readyLabelEventsFilter(e) { return (e.event === 'labeled' || e.event === 'unlabeled') &&  e.label.name === 'ready'; }
    }
}());  