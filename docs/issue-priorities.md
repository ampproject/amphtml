<!---
Copyright 2015 The AMP HTML Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS-IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

## AMP GitHub Issue Priorities

The AMP team is using the below priorities and guidelines to make it easier to order issues by the level of attention they need.
These guidelines can give you also a good overview of when to expect updates or closure of issues.

If you would like to give a hint regarding the priority of the issue you can add the appropriate priority [GitHub label](https://github.com/ampproject/amphtml/labels). Note that the priority may be changed as the issue is triaged based on the project's roadmap and backlog.

### Priorities & Guidelines

| Priority            | What it means                                                                                                                                                        | Guidelines for Bugs                                                                                                                                                                                                                                                                                   | Guidelines for FRs                                                                                                                                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P0: Drop Everything | <ul><li>Outage</li><li>Critical production issue</li></ul>                                                                                                           | <ul><li>Drop everything until this is fixed</li><li>Should be assigned and accepted within 24 hours of filing</li><li>Provide regular bug update on status and ETA of the fix, once every day after acceptance</li><li>Fixed in 7 days (next release or patch release, whichever is sooner)</li></ul> | <ul><li>We do not use P0 for FRs</li></ul>                                                                                                                                                                                                                       |
| P1: High Priority   | <ul><li>Breakage of a critical feature or user journey</li><li>Highly significant feature</li></ul>                                                                  | <ul><li>Should be assigned and accepted within 48 hours of filing</li><li>Should be updated by the team once every week after acceptance</li><li>Fixed within 30 days or updated with explanation and timeline</li></ul>                                                                              | <ul><li>Implementation guidelines: 2 weeks</li><li>Feature requests are not P1, unless a situation develops where the lack of the feature is significant user problem (e.g. lack of the feature may block a significant number of AMP implementations)</li></ul> |
| P2: Soon            | <ul><li>Breakage of a non-critical feature or user journey</li><li>Major usability problem (users frequently do the wrong thing)</li><li>Important feature</li></ul> | <ul><li>Best effort</li><li>Fixed in a quarter</li></ul>                                                                                                                                                                                                                                              | <ul><li>Implementation guidelines: 1 Quarter</li><li>Generally higher priority feature requests</li><li>These are mostly features that have been specifically scheduled to meet our roadmap</li</ul>                                                             |
| P3: When Possible   | <ul><li>Minor usability problem</li><li>Polish</li><li>Minor features</li></ul>                                                                                      | <ul><li>Best effort</li></ul>                                                                                                                                                                                                                                                                         | <ul><li>When possible</li></ul>                                                                                                                                                                                                                                  |
