(function () {
    'use strict';

    describe('Cycle Time Service', function () {
        var cycleTimeService;

        beforeEach(module('huburn'));

        beforeEach(inject(function (_cycleTimeService_) {
            cycleTimeService = _cycleTimeService_;
        }));

        var issues = [
            {
                "title":"Escalation of a major issue",
                "created_at":"2016-09-26T14:01:32Z",
                "closed_at":"2016-09-29T16:47:25Z",
                "labels":[  
                    {  
                        "name":"6 - Done"
                    },
                    {  
                        "name":"escalation"
                    },
                    {  
                        "name":"points: 1",
                    }
                ],
                "events":[  
                    {  
                        "event":"milestoned",
                        "created_at":"2016-09-26T14:01:32Z",
                        "milestone":{  
                            "title":"Iteration XYZ"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-09-26T14:01:32Z",
                        "label":{  
                            "name":"0 - Needs Planning",
                            "color":"CCCCCC"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-09-26T14:01:32Z",
                        "label":{  
                            "name":"escalation",
                            "color":"5319e7"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-09-26T14:02:03Z",
                        "label":{  
                            "name":"0 - Needs Planning",
                            "color":"CCCCCC"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-09-26T14:02:03Z",
                        "label":{  
                            "name":"1 - Ready",
                            "color":"CCCCCC"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-09-28T12:50:37Z",
                        "label":{  
                            "name":"1 - Ready",
                            "color":"CCCCCC"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-09-28T12:50:37Z",
                        "label":{  
                            "name":"2 - In Progress",
                            "color":"CCCCCC"
                        }
                    },
                    {  
                        "event":"assigned",
                        "created_at":"2016-09-28T12:50:40Z",
                    },
                    {  
                        "event":"assigned",
                        "created_at":"2016-09-28T20:54:42Z",
                    },
                    {  
                        "event":"mentioned",
                        "created_at":"2016-09-28T21:26:42Z"
                    },
                    {  
                        "event":"subscribed",
                        "created_at":"2016-09-28T21:26:42Z"
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-09-29T16:47:16Z",
                        "label":{  
                            "name":"2 - In Progress",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-09-29T16:47:16Z",
                        "label":{  
                            "name":"6 - Done",
                        }
                    }
                ]
            },
            {
                "title":"Escalation of a major issue",
                "created_at":"2016-09-24T14:01:32Z",
                "closed_at":"2016-09-29T16:47:25Z",
                "labels":[  
                    {  
                        "name":"6 - Done"
                    },
                    {  
                        "name":"escalation"
                    },
                    {  
                        "name":"points: 1"
                    }
                ]
            },
            {
                "title":"firelane of a major issue",
                "created_at":"2016-09-28T14:01:32Z",
                "closed_at":"2016-09-29T14:47:25Z",
                "labels":[  
                    {  
                        "name":"6 - Done"
                    },
                    {  
                        "name":"firelane"
                    },
                    {  
                        "name":"points: 1"
                    }
                ]
            },
            {
                "title":"normal story going across the board",
                "created_at":"2016-05-21T14:01:32Z",
                "closed_at":"2016-05-31T14:47:25Z",
                "labels":[  
                    {  
                        "name":"6 - Done"
                    },
                    {  
                        "name":"feature"
                    },
                    {  
                        "name":"points: 2"
                    }
                ],
                "events":[  
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-21T15:39:08Z",
                        "label":{  
                            "name":"0 - Needs Planning"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-21T15:40:43Z",
                        "label":{  
                            "name":"0 - Needs Planning"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-22T15:04:43Z",
                        "label":{  
                            "name":"1 - Ready"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-22T15:05:43Z",
                        "label":{  
                            "name":"1 - Ready"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-23T15:04:43Z",
                        "label":{  
                            "name":"2 - In Progress"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-27T15:04:43Z",
                        "label":{  
                            "name":"2 - In Progress"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-27T15:05:08Z",
                        "label":{  
                            "name":"3 - Review"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-28T15:07:43Z",
                        "label":{  
                            "name":"3 - Review"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-28T15:08:43Z",
                        "label":{  
                            "name":"4 - Testing"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-30T15:04:43Z",
                        "label":{  
                            "name":"4 - Testing"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-30T15:05:43Z",
                        "label":{  
                            "name":"5 - Merge"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-31T15:04:43Z",
                        "label":{  
                            "name":"5 - Merge"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-31T15:04:43Z",
                        "label":{  
                            "name":"6 - Done"
                        }
                    },
                    {  
                        "event":"closed",
                        "created_at":"2016-05-31T14:47:25Z"
                    }
                ]
            }
        ];

        it('escalation cycle times is undefined when no escalations', function () {
            var escalationCycleTimes = cycleTimeService.getEscalationCycleTimes([]);
            expect(escalationCycleTimes).toBe(undefined);
        });

        it('escalations have a cycle time of 4.1', function () {
            var escalationCycleTimes = cycleTimeService.getEscalationCycleTimes(issues);
            expect(escalationCycleTimes).toBe(4.1);
        });

        it('firelane cycle times is undefined when no firelanes', function () {
            var firelaneCycleTimes = cycleTimeService.getFirelaneCycleTimes([]);
            expect(firelaneCycleTimes).toBe(undefined);
        });

        it('firelanes have a cycle time of 1', function () {
            var firelaneCycleTimes = cycleTimeService.getFirelaneCycleTimes(issues);
            expect(firelaneCycleTimes).toBe(1);
        });

        it('cycle times is undefined when no valid stories are found', function () {
            var cycleTimes = cycleTimeService.getFirelaneCycleTimes([]);
            expect(cycleTimes).toBe(undefined);
        });

        it('normal cycle times are correct', function () {
            var cycleTimes = cycleTimeService.getCycleTimes(issues);
            expect(cycleTimes.stories).toBe(8);
            expect(cycleTimes.inProgress.acrossTheBoard).toBe(4);
            expect(cycleTimes.review.acrossTheBoard).toBe(1);
            expect(cycleTimes.testing.acrossTheBoard).toBe(2);
            expect(cycleTimes.merge.acrossTheBoard).toBe(1);
        });

        it('issue sent back from review', function () {

            var issue = {
                "title":"issue sent back from review",
                "created_at":"2016-05-21T14:01:32Z",
                "closed_at":"2016-06-02T15:08:25Z",
                "labels":[  
                    {  
                        "name":"6 - Done"
                    },
                    {  
                        "name":"feature"
                    },
                    {  
                        "name":"points: 2"
                    }
                ],
                "events":[  
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-23T15:04:43Z",
                        "label":{  
                            "name":"2 - In Progress"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-27T15:04:43Z",
                        "label":{  
                            "name":"2 - In Progress"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-27T15:05:08Z",
                        "label":{  
                            "name":"3 - Review"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-28T15:07:43Z",
                        "label":{  
                            "name":"3 - Review"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-28T15:04:43Z",
                        "label":{  
                            "name":"2 - In Progress"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-30T15:04:43Z",
                        "label":{  
                            "name":"2 - In Progress"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-30T15:05:08Z",
                        "label":{  
                            "name":"3 - Review"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-30T15:07:43Z",
                        "label":{  
                            "name":"3 - Review"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-30T15:08:43Z",
                        "label":{  
                            "name":"4 - Testing"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-06-02T15:04:43Z",
                        "label":{  
                            "name":"4 - Testing"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-06-02T15:05:43Z",
                        "label":{  
                            "name":"5 - Merge"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-06-02T15:06:43Z",
                        "label":{  
                            "name":"5 - Merge"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-06-31T15:07:43Z",
                        "label":{  
                            "name":"6 - Done"
                        }
                    },
                    {  
                        "event":"closed",
                        "created_at":"2016-06-02T15:08:25Z"
                    }
                ]
            };

            var cycleTimes = cycleTimeService.getCycleTimes([issue]);

            expect(cycleTimes.stories).toBe(10);
            expect(cycleTimes.inProgress.acrossTheBoard).toBe(6);
            expect(cycleTimes.review.acrossTheBoard).toBe(1);
            expect(cycleTimes.testing.acrossTheBoard).toBe(3);
            expect(cycleTimes.merge.acrossTheBoard).toBe(0);
        });

        it('calculate merge cycle time on close date when merge label was never removed', function () {

            var issue = {
                "title":"issue with lingering merge label",
                "created_at":"2016-05-21T14:01:32Z",
                "closed_at":"2016-06-02T14:47:25Z",
                "labels":[  
                    {  
                        "name":"5 - Merge"
                    },
                    {  
                        "name":"feature"
                    },
                    {  
                        "name":"points: 2"
                    }
                ],
                "events":[  
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-21T15:39:08Z",
                        "label":{  
                            "name":"0 - Needs Planning"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-21T15:40:43Z",
                        "label":{  
                            "name":"0 - Needs Planning"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-22T15:04:43Z",
                        "label":{  
                            "name":"1 - Ready"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-22T15:05:43Z",
                        "label":{  
                            "name":"1 - Ready"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-23T15:04:43Z",
                        "label":{  
                            "name":"2 - In Progress"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-27T15:04:43Z",
                        "label":{  
                            "name":"2 - In Progress"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-27T15:05:08Z",
                        "label":{  
                            "name":"3 - Review"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-28T15:07:43Z",
                        "label":{  
                            "name":"3 - Review"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-28T15:08:43Z",
                        "label":{  
                            "name":"4 - Testing"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-30T15:04:43Z",
                        "label":{  
                            "name":"4 - Testing"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-30T14:05:43Z",
                        "label":{  
                            "name":"5 - Merge"
                        }
                    },
                    {  
                        "event":"closed",
                        "created_at":"2016-06-02T14:47:25Z"
                    }
                ]
            };

            var cycleTimes = cycleTimeService.getCycleTimes([issue]);
            expect(cycleTimes.merge.acrossTheBoard).toBe(3);
        });

        it('calculate merge cycle time on close date when merge label was removed after issue closed', function () {

            var issue = {
                "title":"issue with removed merge label after issue was closed",
                "created_at":"2016-05-21T14:01:32Z",
                "closed_at":"2016-06-02T14:47:25Z",
                "labels":[  
                    {  
                        "name":"5 - Merge"
                    },
                    {  
                        "name":"feature"
                    },
                    {  
                        "name":"points: 2"
                    }
                ],
                "events":[  
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-21T15:39:08Z",
                        "label":{  
                            "name":"0 - Needs Planning"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-21T15:40:43Z",
                        "label":{  
                            "name":"0 - Needs Planning"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-22T15:04:43Z",
                        "label":{  
                            "name":"1 - Ready"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-22T15:05:43Z",
                        "label":{  
                            "name":"1 - Ready"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-23T15:04:43Z",
                        "label":{  
                            "name":"2 - In Progress"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-27T15:04:43Z",
                        "label":{  
                            "name":"2 - In Progress"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-27T15:05:08Z",
                        "label":{  
                            "name":"3 - Review"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-28T15:07:43Z",
                        "label":{  
                            "name":"3 - Review"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-28T15:08:43Z",
                        "label":{  
                            "name":"4 - Testing"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-30T15:04:43Z",
                        "label":{  
                            "name":"4 - Testing"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-30T14:05:43Z",
                        "label":{  
                            "name":"5 - Merge"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-06-30T14:05:43Z",
                        "label":{  
                            "name":"5 - Merge"
                        }
                    },
                    {  
                        "event":"closed",
                        "created_at":"2016-06-02T14:47:25Z"
                    }
                ]
            };

            var cycleTimes = cycleTimeService.getCycleTimes([issue]);
            expect(cycleTimes.merge.acrossTheBoard).toBe(3);
        });

        it('calculate merge cycle time on latest close date when merge label was removed after issue closed multiple times', function () {

            var issue = {
                "title":"issue with removed merge label after issue was closed",
                "created_at":"2016-05-21T14:01:32Z",
                "closed_at":"2016-06-10T14:47:25Z",
                "labels":[  
                    {  
                        "name":"6 - Done"
                    },
                    {  
                        "name":"feature"
                    },
                    {  
                        "name":"points: 2"
                    }
                ],
                "events":[  
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-21T15:39:08Z",
                        "label":{  
                            "name":"0 - Needs Planning"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-21T15:40:43Z",
                        "label":{  
                            "name":"0 - Needs Planning"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-22T15:04:43Z",
                        "label":{  
                            "name":"1 - Ready"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-22T15:05:43Z",
                        "label":{  
                            "name":"1 - Ready"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-23T15:04:43Z",
                        "label":{  
                            "name":"2 - In Progress"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-27T15:04:43Z",
                        "label":{  
                            "name":"2 - In Progress"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-27T15:05:08Z",
                        "label":{  
                            "name":"3 - Review"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-28T15:07:43Z",
                        "label":{  
                            "name":"3 - Review"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-28T15:08:43Z",
                        "label":{  
                            "name":"4 - Testing"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-05-30T15:04:43Z",
                        "label":{  
                            "name":"4 - Testing"
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-05-30T14:05:43Z",
                        "label":{  
                            "name":"5 - Merge"
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-06-30T14:05:43Z",
                        "label":{  
                            "name":"5 - Merge"
                        }
                    },
                    {  
                        "event":"closed",
                        "created_at":"2016-06-04T14:47:25Z"
                    },
                    {  
                        "event":"closed",
                        "created_at":"2016-06-10T14:47:25Z"
                    }
                ]
            };

            var cycleTimes = cycleTimeService.getCycleTimes([issue]);
            expect(cycleTimes.merge.acrossTheBoard).toBe(11);
        });

        it('skipped columns result in a 0 for that column', function () {

            var issues = [
                {
                "title":"issue that went all columns",
                "created_at":"2016-05-21T14:01:32Z",
                "closed_at":"2016-06-10T14:47:25Z",
                "labels":[  
                    {  
                        "name":"6 - Done"
                    },
                    {  
                        "name":"feature"
                    },
                    {  
                        "name":"points: 2"
                    }
                ],
                "events":[  
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-26T19:19:20Z",
                        "label":{  
                            "name":"2 - In Progress",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-27T19:19:20Z",
                        "label":{  
                            "name":"zero-defect",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-27T19:57:40Z",
                        "label":{  
                            "name":"2 - In Progress",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-27T19:58:40Z",
                        "label":{  
                            "name":"3 - Review",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-28T19:58:40Z",
                        "label":{  
                            "name":"3 - Review",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-28T19:59:40Z",
                        "label":{  
                            "name":"4 - Testing",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-29T19:59:40Z",
                        "label":{  
                            "name":"4 - Testing",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-29T20:01:40Z",
                        "label":{  
                            "name":"5 - Merge",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-30T20:02:40Z",
                        "label":{  
                            "name":"5 - Merge",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-30T20:03:40Z",
                        "label":{  
                            "name":"6 - Done",
                        }
                    },
                    {  
                        "event":"closed",
                        "created_at":"2016-07-31T14:47:25Z"
                    }
                ]
            }, 
            {
            "title":"issue for testing skipped columns",
                "created_at":"2016-05-21T14:01:32Z",
                "closed_at":"2016-06-10T14:47:25Z",
                "labels":[  
                    {  
                        "name":"6 - Done"
                    },
                    {  
                        "name":"feature"
                    },
                    {  
                        "name":"points: 2"
                    }
                ],
                "events":[  
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-26T19:19:20Z",
                        "label":{  
                            "name":"2 - In Progress",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-27T19:19:20Z",
                        "label":{  
                            "name":"zero-defect",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-27T19:57:40Z",
                        "label":{  
                            "name":"2 - In Progress",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-29T20:01:40Z",
                        "label":{  
                            "name":"5 - Merge",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-30T20:02:40Z",
                        "label":{  
                            "name":"5 - Merge",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-30T20:03:40Z",
                        "label":{  
                            "name":"6 - Done",
                        }
                    },
                    {  
                        "event":"closed",
                        "created_at":"2016-07-31T14:47:25Z"
                    }
                ]
            }];

            var cycleTimes = cycleTimeService.getCycleTimes(issues);
            expect(cycleTimes.inProgress.acrossTheBoard).toBe(1);
            expect(cycleTimes.review.acrossTheBoard).toBe(.5);
            expect(cycleTimes.testing.acrossTheBoard).toBe(.5);
            expect(cycleTimes.merge.acrossTheBoard).toBe(1);
        });

        it('wait times for single issue are correct', function () {
            var issue = {
                "title":"issue that went all columns with ready labels",
                "created_at":"2016-05-21T14:01:32Z",
                "closed_at":"2016-06-10T14:47:25Z",
                "labels":[  
                    {  
                        "name":"6 - Done"
                    },
                    {  
                        "name":"feature"
                    },
                    {  
                        "name":"points: 2"
                    }
                ],
                "events":[  
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-01T19:19:20Z",
                        "label":{  
                            "name":"2 - In Progress",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-27T19:19:20Z",
                        "label":{  
                            "name":"zero-defect",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-02T19:19:20Z",
                        "label":{  
                            "name":"ready",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-04T19:19:20Z",
                        "label":{  
                            "name":"ready",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-04T19:20:40Z",
                        "label":{  
                            "name":"2 - In Progress",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-04T19:21:40Z",
                        "label":{  
                            "name":"3 - Review",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-05T19:19:20Z",
                        "label":{  
                            "name":"ready",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-06T19:19:20Z",
                        "label":{  
                            "name":"ready",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-06T19:20:40Z",
                        "label":{  
                            "name":"3 - Review",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-06T19:21:40Z",
                        "label":{  
                            "name":"4 - Testing",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-06T19:22:20Z",
                        "label":{  
                            "name":"ready",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-06T21:23:20Z",
                        "label":{  
                            "name":"ready",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-07T21:20:40Z",
                        "label":{  
                            "name":"4 - Testing",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-07T21:21:40Z",
                        "label":{  
                            "name":"5 - Merge",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-08T19:19:20Z",
                        "label":{  
                            "name":"ready",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-08T19:39:20Z",
                        "label":{  
                            "name":"ready",
                        }
                    },
                    {  
                        "event":"unlabeled",
                        "created_at":"2016-07-08T20:02:40Z",
                        "label":{  
                            "name":"5 - Merge",
                        }
                    },
                    {  
                        "event":"labeled",
                        "created_at":"2016-07-08T20:03:40Z",
                        "label":{  
                            "name":"6 - Done",
                        }
                    },
                    {  
                        "event":"closed",
                        "created_at":"2016-07-31T14:47:25Z"
                    }
                ]
            };

            var cycleTimes = cycleTimeService.getCycleTimes([issue]);
            expect(cycleTimes.inProgress.waitTime).toBe(48);
            expect(cycleTimes.review.waitTime).toBe(24);
            expect(cycleTimes.testing.waitTime).toBe(2);
            expect(cycleTimes.merge.waitTime).toBe(0.3);
        });
    });
})();