function TestIssuesService()
{
    this.buildAcrossTheBoardIssue = function buildAcrossTheBoardIssue(inProgressDuration, points) {
        var labeledInProgressAt = new Date("2016-05-22T14:01:32Z");
        var unlabeledInProgressAt = new Date("2016-05-22T14:01:32Z");
        unlabeledInProgressAt.setDate(unlabeledInProgressAt.getDate() + inProgressDuration);

        return {
            "title":"normal story going across the board",
            "created_at":"2016-05-21T14:47:25Z",
            "closed_at":"2016-05-31T14:47:25Z",
            "labels":[  
                {  
                    "name":"6 - Done"
                },
                {  
                    "name":"feature"
                },
                {  
                    "name":"points: " + points
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
                    "created_at":labeledInProgressAt.toString(),
                    "label":{  
                        "name":"2 - In Progress"
                    }
                },
                {  
                    "event":"unlabeled",
                    "created_at":unlabeledInProgressAt.toString(),
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
        };
    }

    this.buildInProgressIssue = function buildInProgressIssue(inProgressDuration, points) {
        var labeledInProgressAt = new Date(Date.now());
        labeledInProgressAt.setDate(labeledInProgressAt.getDate() - inProgressDuration);

        return {
            "title":"normal story going across the board",
            "created_at":"2016-05-21T14:47:25Z",
            "closed_at":"2016-05-31T14:47:25Z",
            "labels":[  
                {  
                    "name":"2 - In Progress"
                },
                {  
                    "name":"feature"
                },
                {  
                    "name":"points: " + points
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
                    "created_at":labeledInProgressAt.toString(),
                    "label":{  
                        "name":"2 - In Progress"
                    }
                }
            ]
        };
    }
}