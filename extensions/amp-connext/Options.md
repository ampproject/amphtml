# Options
On the example below you could see that to the Connext Init method should be passed an object (Options object), it should be comma-separated as a JS-object. Options object has the following properties:
## siteCode 
Version added: 1.0

This is your siteCode and will be provided by your Project Manager. This is required, if this is not included or if it is invalid Connext will not initialize.
## configCode 
Version added: 1.0

This is the configuration code that will be used to get all your settings from the Admin. You can get a list of your configCodes by logging into the Admin and clicking on ‘Configurations’ in the navigation.
## silentmode 
Version added: 1.0

Not required. Default: false. If Silent Mode is true Connext will not be initialized until you run method "Connext.Run()"
## environment 
Version added: 1.0

Not required. Default: prod. This option set current environment. If these options aren't set plugin try to find environment in Site URL. If not found - set default 'stage'. Environment determines current DB and admin site. Environments:
* `'dev'` (site - dev-admin.mg2connext.com)
* `'test'` (site - test-admin.mg2connext.com)
* `'demo'` (site - demo-admin.mg2connext.com)
* `'stage'` (site - stage-admin.mg2connext.com)
## attr 
Version added: 1.3

Not required. This option sets up current attributeSet. If you have one configuration for a number of sites, you can set dynamic variables (attributes) in your templates. This code indicates which value should be used for the attribute on a particular site. If the parameter is not specified, ConneXt will use a default attribute value.
## settingsKey 
Version added: 1.3

Not required. This option indicates a specific system settings for a particular site. (In case if you use only one siteCode to set up a number of other sites and these sites use different system settings (ex. different account services), this parameter determines which settings should be used
## authSettings 
Version added: 1.7

Not required. This option is required only if we want to use 3rd party Account service to manage Authentication/Authorization on Connext (for example Auth0)
We are setting here 2 parameters:
* `auth0Lock `– Instance of Auth0Lock component. Will provide the ability to trigger from Connext initialized on a page customized lock component.
* `auth0 `– Instance of Auth0 object. Will provide the ability to support SSO

**Important!** In order to support Auth0 SSO and Lock component both auth0Lock and auth0 parameters must be passed.
First, you need to include the following link to your website, referencing to the Auth0 lock component (this is a predefined login modal)

`<script src="https://cdn.auth0.com/js/lock/10.19/lock.min.js"></script> `

The following piece of code you need to add before Connext.Init(), Here you are defining Lock component on you website. Below is an example of lock component initialize. (please note highlighted part).

	var auth0ClientId = "rjkrzBNwdigE0nJ6toKdjGQZ5t7rbIOH";
	var auth0InstanceDomain = "mg2-sandbox-dev.auth0.com";
	var lock = new Auth0Lock(auth0ClientId, auth0InstanceDomain, {
		auth: {
        		redirect: false,
	       		sso: true,
			params: {
                		scope: "openid email"
			},
		},
		autoclose: true
	});

Important here to understand that Lock component has 2 working modes: 
* Redirect mode – highlighted part in the code should be set in following way: 

`	redirect = true; `

`	redirecturl='http://someurl.html'`

* Popup mode – highlighted part in the code should be set in following way:

`	redirect = false;`

Redirect mode is supposed to be used only for cases where you have 1 standard page to redirect (e.g. profile editing). In case if there is no such page, you are supposed to use Popup mode.


## runSettings 
Version added: 1.10

Not required. This option exposes specific settings to run the plugin. 
We are setting here 4 parameters:
* `runPromise `–  third-party Promise object, based on which Resolve/Reject Connext should start.
Is supposed to be used if we want Connext to start after some initial process finished;
* `onRunPromiseResolved `–  callback, which is called after runPromise was Resolved (by default internally Connext.Run() is executed).
* `onRunPromiseRejected `– callback, which is called after runPromise was Rejected;
* `runOffset `- time offset in milliseconds after which Connext will run in any case (in case if Promise for some reason did not finish it’s work);

NOTE: default runOffset is equal to 5000 ms.

NOTE: In case if Connext was already initialized based of runPromise Resolved (before runOffset happened), and then we try to initialize it after runOffset, Connext will NOT be initialized twice.

NOTE: in case if we have runOffset we will call to function Connext.Run even if we don't have runPromise.

## integrateFlittz
Version added: 1.10

Not required. This option will allow to do the easy integration with Flittz. 

## debug
Version added: 1.0

This will enable or disable debugging to the console. This should only be turned on if there are any issues, since writing to the console can decrease performance. 

NOTE: This is only for debug messages, all errors and exceptions are written to the console regardless of this setting.

## List of callbacks
A list of Connext event callbacks 

NOTE: This is not a separate Options object property, this is just a list of Connext event callbacks that can be present on Options object. See more details on Events section.
