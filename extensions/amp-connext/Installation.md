# Installation
## Including Files
To use Connext you will need to reference one JS and one base CSS file on your site.
## Requirements
Connext requires jQuery in order to function.
## jQuery
You will need to include jQuery before you include the Connext JS file. A minimum jQuery version 1.7 is required. If you are currently using a version less than 1.7 and relying on deprecated methods (such as .live) please contact your Project Manager so we can determine the best course of action.
## Files
Include Core Connext CSS file (please replace <b>[BOLD]</b> text with the client name we have given you):
<pre>
< link rel="stylesheet" type="text/css" href="https://cdn.mg2connext.com/prod/<b>[ID]</b>/Connext.min.css" />
</pre>
Include Connext javascript plugin (please replace <b>[BOLD]</b> with the client name we have given you):
<pre>
< script type="text/javascript" src="https://cdn.mg2connext.com/prod/<b>[ID]</b>/Connext.min.js"></script>
</pre>
## Initializing
The initialization code should be executed in a jQuery document ready function. Below is full example of Init function.

 
NOTE: Not all parameters are required, read Options section for more details


 	$(document).ready(function () {
		var mg2Connext = Connext.init({
			siteCode: SITECODE,
			configCode: CONFIGCODE,
			environment: ENVIRONMENT,
			attr: ATTR, // not required, verify with MG2 whether need to define it
			settingsKey: KEY, // not required, verify with MG2 whether need to define it
			debug: false, // not required, set to true if you want to show debug panel and enable console 	logging
			integrateFlittz: false, // not required, set to true if you want to integrate with Flittz easily
			silentmode: false, // not required, define it for a special mode, waiting till someone will manually start Connext with 'Connext.run();'
			authSettings: {	// not required, define it for 3rd party account services, see more details under authSettings description below
			auth0Lock: AUTH0_LOCK_OBJECT,
			auth0: AUTH0_OBJECT
			},
			runSettings: {	// not required, define it for promise resolve based Connext start
				runPromise: PROMISE_OBJECT,
				runOffset: 0,
				onRunPromiseResolved: function() {
					console.info('Promise resolved')
				},
				onRunPromiseRejected: function() {
					console.info('Promise rejected');
				}
			},	
			//below section of callbacks is not required, you can leave any of that callback
			onInit: function (e) { },
			onMeterLevelSet: function (e) {
				console.info('onMeterLevelSet.Callback', e);
			},
			onDynamicMeterFound: function (e) {
				console.info('onDynamicMeterFound.Callback', e);
			},
			onCampaignFound: function (e) {
				console.info('onCampaignFound.Callback', e);
			},
			onConversationDetermined: function (e) {
				console.info('onConversationDetermined.Callback', e);
			},
			onActionShown: function (e) {
				console.info('onActionShown.Callback', e);
			},
			onActionClosed: function (e) {
				console.info('onActionClosed.Callback', e);
			},
			onButtonClick: function (e) {
				console.info('onButtonClick.Callback', e);
			},
			onNotAuthorized: function (e) {
				console.info('onNotAuthorized.Callback', e);
			}, 
			onAuthorized: function (e) {
				console.info('onAuthorized.Callback', e);
			},
			onHasAccess: function (e) {
				console.info('onHasAccess.Callback', e);
			},
			onHasAccessNotEntitled: function (e) {
				console.info('onHasAccessNotEntitled.Callback', e);
			},
			onHasNoActiveSubscription: function (e) {
				console.info('onHasNoActiveSubscription.Callback', e);
			},
			onLoggedIn: function (e) {
				console.info('onLoggedIn.Callback', e);
			},
			onAccessTemplateShown: function (e) {
				console.info('onAccessTemplateShown.Callback', e);
			},
			onAccessTemplateClosed: function (e) {
				console.info('onAccessTemplateClosed.Callback', e);
			},
			onCriticalError: function (e) {
				console.info('onCriticalError.Callback', e);
			},
			onFlittzButtonClick: function (e) {
				console.info('onFlittzButtonClick', e);
			},
		});
	}); 