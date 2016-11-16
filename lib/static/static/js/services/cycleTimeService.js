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
            var inProgress = getCycleTimeForColumn(issues, '2 - In Progress');
            var review = getCycleTimeForColumn(issues, '3 - Review');
            var testing = getCycleTimeForColumn(issues, '4 - Testing');
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
                var historicalInProgressCycleTimes = getCycleTimesForColumn(issuesWithLabel, '2 - In Progress')
                    .filter(hasValidCycleTime)
                    .map(getTimeFromCycle);

                if (historicalInProgressCycleTimes.length < 2)
                    continue;

                var currentIssuesWithLabel = issueService.getIssuesWithLabel(currentMilestoneIssues, 'points: ' + pointsLabelsToRetrieve[i]);                
                var currentInProgressTimes = getCycleTimesForColumn(currentIssuesWithLabel, '2 - In Progress')
                    .filter(hasValidCycleTime);

                if (currentInProgressTimes.length > 0) {
                    var mean = jStat.mean(historicalInProgressCycleTimes);
                    var meanInDays = dateService.toDays(mean);
                    var standardDeviation = jStat.stdev(historicalInProgressCycleTimes);
                    maxValues.push(mean + (3 * standardDeviation));

                    statistics.push({
                        pointsLabel: pointsLabelsToRetrieve[i],
                        numberOfHistoricalItems: historicalInProgressCycleTimes.length,
                        dataPoints: currentInProgressTimes,
                        mean: mean,
                        meanInDays: meanInDays,
                        standardDeviation: standardDeviation
                    });
                }
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

        function getCycleTimeForColumn(issues, columnLabel) {
            var cycleTimes = getCycleTimesForColumn(issues, columnLabel);

            if (cycleTimes.length > 0)
                return dateService.toDays(cycleTimes.map(function (timeObject) { return timeObject.time; }).reduce(sum) / cycleTimes.length);
            else
                return 0;
        }

        function getCycleTimesForColumn(issues, columnLabel) {
            var cycleTimes = [];

            function labelEvents(e) { return (e.event === 'labeled' || e.event === 'unlabeled') &&  e.label.name === columnLabel; }

            issues.forEach(function (issue) {
                var timeInColumn = 0;
                var labeledEvents = issue.events.filter(labelEvents);
                var orderedEvents = labeledEvents.sort(ascendingEvents);

                if (labeledEvents.length % 2 === 0) {
                    timeInColumn = getTimeBetweenLabeling(orderedEvents);
                }
                else { 
                    var mostRecentEvent = orderedEvents[orderedEvents.length - 1];
                    if (mostRecentEvent.label.name == columnLabel && mostRecentEvent.event === 'labeled') {
                        var now = new Date(Date.now());
                        var timeBetween = dateService.getTimeBetween(new Date(labeledEvents[0].created_at), now);
                        timeInColumn = timeBetween;
                    }
                }

                cycleTimes.push({ issue: issue, time: timeInColumn });
            });

            return cycleTimes;
        }

        function getCycleTimesForMergeColumn(issues) {
            var cycleTimes = [];

            function labelEvents(e) { return (e.event === 'labeled' || e.event === 'unlabeled') &&  e.label.name === '5 - Merge'; }
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
                inProgress: getWaitTimeForColumn(issues, '2 - In Progress'),
                review: getWaitTimeForColumn(issues, '3 - Review'),
                testing: getWaitTimeForColumn(issues, '4 - Testing'),
                merge: getWaitTimeForColumn(issues, '5 - Merge')
            };
        }

        function getWaitTimeForColumn(issues, columnLabel) {
            var waitTimes = [];

            function addedToColumnFilter(e) { return e.event === 'labeled' &&  e.label.name === columnLabel; }
            function removedFromColumnFilter(e) { return e.event === 'unlabeled' &&  e.label.name === columnLabel; }

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
                if (index % 2 === 0)
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