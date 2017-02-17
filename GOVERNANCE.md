# AMP Project open source governance

This document describes the governance model for the AMP open source project, and in particular the [AMP HTML GitHub project](https://github.com/ampproject/amphtml).

Our governance model is as follows:

* Changes to the AMP repository have to be approved by the `OWNERS` of the code. Owners are specified by directory via the [OWNERS.yaml](https://github.com/ampproject/amphtml/search?utf8=%E2%9C%93&q=filename%3AOWNERS.yaml&type=Code) file.
* The creator(s) of a particular component, extensions, plugin or sub system should typically name themselves as owners and they are free to delegate ownership to other GitHub users or teams of the [AMP Project GitHub Project](https://github.com/ampproject).
* Just to rephrase: Ownership of a sub system is **given out liberally** to whoever seems most knowledgeable about a piece of code. Typically the creator should designate themselves.
* Owners of higher level directories automatically have ownership (approval rights) for sub directories.
* These higher level owners would, for example, approve the creation of a new component.
* On top of owners approval, each pull request additionally requires review and approval from an AMP Project core committer.
* These additional reviews primarily ensure the security of the project and ensure uniform application of the [design principles](./DESIGN_PRINCIPLES.md).
* There is a single [Tech Lead](#core-committers), who will have the final say on all decisions regarding technical direction.
* The Tech Lead directs the [Core Committers](#core-committers), whose members include the Tech Lead and those who have been appointed by the Tech Lead as Core Committers.
* In the event the Tech Lead is unable to perform his or her duties, or abdicates, the Core Committers can select a new Tech Lead from amongst themselves.
* In the unlikely event that there are no more Core Committers, Google Inc. will appoint a new Tech Lead.
* Significant feature development and changes to AMP require following the ["Intent to implement"](./CONTRIBUTING.md#feature-development) process including approval from the Tech Lead and one Core Committer.

## Core Committers:

* **Tech Lead: Malte Ubl (@cramforce)**
* Ali Ghassemi (@aghassemi)
* Avi Mehta (@avimehta). Specialty: Analytics
* Barb Paduch (@bpaduch). Specialty: Docs
* Sriram Krishnan (@camelburrito)
* Chen Shay (@chenshay)
* William Chou (@choumx)
* Dima Voytenko (@dvoytenko)
* Erwin Mombay (@erwinmombay)
* Greg Grothaus (@Gregable)
* David Sedano (@honeybadgerdontcare)
* Justin Ridgewell (@jridgewell)
* Hongfei Ding (@lannka)
* Yuxi Chen (@muxin)
* Johannes Henkel (@powdercloud)
* Yuxuan Zhou (@zhouyx)
