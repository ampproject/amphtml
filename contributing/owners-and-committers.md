# Owners and Committers

Contributions to the AMP Project require approval from an [Owner](#owners) of the affected code/document/etc. in addition to a [Core Committer](#core-committers).

This system allows us to maintain security and consistent application of the [design principles](../DESIGN_PRINCIPLES.md) while also allowing for a stronger sense of ownership by the people who are most familiar with a given part of the AMP Project.

## OWNERS

* Changes to the AMP repository require approval from an Owner of the affected code.  Owners are specified by directory via the [OWNERS.yaml](https://github.com/ampproject/amphtml/search?utf8=%E2%9C%93&q=filename%3AOWNERS.yaml&type=Code) file.
* The creator(s) of a particular component, extension, plugin or sub system should typically name themselves as an Owner.  They are free to delegate ownership to other GitHub users or teams of the [AMP Project GitHub Project](https://github.com/ampproject).
* Ownership of a sub system is **given out liberally** to whomever seems most knowledgeable about a piece of code. Typically the creator of a component/etc. should designate themselves as Owner.
* There is no formal process for ownership removal, but the project reserves the right to remove owner privileges for Owners that have not responded to multiple GitHub @-mention notifications over multiple weeks.
* Owners of higher level directories automatically have ownership (approval rights) for sub directories.  A higher-level OWNER could, for example, approve the creation of a new component.
* The AMP Project uses the [github-owners-bot](https://github.com/google/github-owners-bot) to check ownership approval.

## Core Committers

* In addition to approval from an Owner of affected code, each pull request requires review and approval from an AMP Project [Core Committer](../GOVERNANCE.md#core-committers).
* These additional reviews primarily ensure the security of the project and ensure uniform application of the [design principles](../DESIGN_PRINCIPLES.md).
* Note that it is possible for a person to be both a Core Committer and an Owner for code in a given PR in which case the approval from that reviewer will suffice unless that reviewer indicates otherwise.
