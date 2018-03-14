# How to

## Show Connext debug panel
To show Connext debug panel you have to pass on Connext Init options debug attribute as true (see <b>bold</b> below)
<pre>
var mg2Connext = Connext.init({
		…
		<b>debug: true, // not required, set to true if you want to show debug panel and enable console logging</b>
		…
});
</pre>

## Delay Connext start
### Manual start 
To delay Connext start manually you have to pass on Connext Init options silentmode attribute as true 

See <b>bold</b> example below

NOTE: this is just a piece of Init function, not a full version
<pre>
var mg2Connext = Connext.init({
		…
		<b>silentmode: true, // not required, define it for a special mode, waiting till someone will manually start Connext with 'Connext.run();'</b>
		…
});
</pre>

After that at any place in the code you can use following command to start Connext.
<pre>
Connext.Run();
</pre>

### Promise based start
* To delay Connext start based on promise you have to define runSettings on Connext Init options 
* You have to pass promise as a runPromise itself based on which resolution Connext will start
* We recommend to define also runOffset value in order to start Connnext even if  promise will not be resolved.
* Whether to define `onRunPromiseResolved `and `onRunPromiseRejected `it’s up to every client, those are just appropriate event callbacks. It make sense to define them if you want to subscribe on those events

See <b>bold</b> example below

NOTE: this is just a piece of Init function, not a full version

<pre>
var mg2Connext = Connext.init({
		…
		<b>runSettings: {	// not required, define it for promise resolve based Connext start
			runPromise: PROMISE_OBJECT,
			runOffset: 0,
			onRunPromiseResolved: function() {
				console.info('Promise resolved')
			},
			onRunPromiseRejected: function() {
				console.info('Promise rejected');
			}
		},</b>
		…
});
</pre>


## Integrate with Flittz
To integrate Connext with Flittz you have to pass on Connext Init options integrateFlittz attribute as true. In this case you may skip defining attribute silentmode (it will be ignored and set internally as true).

See  <b>bold</b>  example below
NOTE: this is just a piece of Init function, not a full version
<pre>
var mg2Connext = Connext.init({
		…
		<b>integrateFlittz: true, // not required, set to true if you want to integrate with Flittz easily</b>
                 …
});
</pre>
Then on a template button/link you should put the following data attribute that will fire Flittz out of a silentmode:
<pre>
[data-fz-btn="smartAuth"]
</pre>

## Integrate with 3rd party Account service
To Integrate ConneXt with 3rd party Account services you have to define two functions inside the authSettings attribute on Connext Init options: CalculateAuthStatusFunc and GetAuthProfileFunc
* CalculateAuthStatusFunc is used to determine current user status. This function should return JQuery Deferred’s promise with user status argument. Supported user statuses are available in CnnXt.Common.USER_STATES object.

<pre>
USER_STATES: {
        NotLoggedIn: "Logged Out",
        LoggedIn: "Logged In",
        NoActiveSubscription: "No Active Subscription",
        SubscribedNotEntitled: "Subscribed Not Entitled",
        Subscribed: "Subscribed"
   }
</pre>
* GetAuthProfileFunc is used to get logged in user’s data. This function should return JQuery Deferred’s promise with user data object argument. This object should have two obligatory properties: MasterId – user’s id and DisplayName.

See Init <b>bold</b> example below:

NOTE: this is just a piece of Init function, not a full version

<pre>
   <b> var CalculateAuthStatusFunc = function () {
        var deferred = $.Deferred();
        if (/*some condition*/) {
            deferred.resolve(CnnXt.Common.USER_STATES.LoggedIn);
        }
        return deferred.promise();
    }

    var GetAuthProfileFunc = function () {
        var deferred = $.Deferred();
        deferred.resolve({
            MasterId: id,
            DisplayName: name
        });
        return deferred.promise();
    }</b>


var mg2Connext = Connext.init({
		…
	<b>	authSettings: {
			CalculateAuthStatusFunc: CalculateAuthStatusFunc,
            		GetAuthProfileFunc: GetAuthProfileFunc
		},</b>
                 …
});

</pre>


## Integrate with Newsletter widget
To integrate Connext with Newsletter widget you can initialize Connext in any available way (there is no specific Init setup for Newsletter integration)

On a template button/link you should put the following data attribute that will fire automatically Newsleter widget if it is available on a page:

<pre>
[data-mg2-action="openNewsletterWidget"] // will fire opening Newsletter Widget if it is available on the page
</pre>

## Setup Activation flow

### Activation in a conversation
To setup Activation flow inside the normal conversations flow you need to define Activation template for each conversation where you want flow to be triggered on user’s demand.

To initialize Connext for this mode you can use any available way (there is no specific Init setup for this mode).

In this mode Activation modal will NOT show until clicking on any link/button with the following data attribute: 
<pre>
[data-mg2-action="activation"] // will fire Activation flow
</pre>

We can set this attribute for any template in the HTML Editor (in action settings).

NOTE: In case if no Activation template is defined for a conversation, nothing will fire even if user will click on the link with “activation” data attribute.

### Activation only configuration

To setup Activation only configuration you need to turn ON this mode on Connext Admin Configurations section. You will need to define as well Activation template and product that will be used for Activation.

**Normal mode**

To initialize Connext for Activation only mode on silentmode you have to pass on Connext Init options silentmode attribute as false (or do not define this attribute since false is default value for it). 

See <b>bold</b> example below

NOTE: this is just a piece of Init function, not a full version
<pre>
var mg2Connext = Connext.init({
		…
		<b>silentmode: false,</b> // not required, define it for a special mode, waiting till someone will manually start Connext with 'Connext.run();'
                 …
});
</pre>

In this mode Activation modal will show immediately after Connext will start. We cannot close modal in this mode.

**Silent mode**

To initialize Connext for Activation only mode on silentmode you have to pass on Connext Init options silentmode attribute as true. 

See <b>bold</b> example below

NOTE: this is just a piece of Init function, not a full version
<pre>
var mg2Connext = Connext.init({
		…
		<b>silentmode: true, </b>// not required, define it for a special mode, waiting till someone will manually start Connext with 'Connext.run();'
                 …
});
</pre>

In this mode Activation modal will NOT show until clicking on any link/button with the following data attribute: 
<pre>
[data-mg2-action="connextRun"]
</pre>

We can set this attribute for any template in the HTML Editor (in action settings).

