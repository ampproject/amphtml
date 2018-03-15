# Events
All event listeners on Connext are defined as callback functions on Init method. Every event returns event argument with an event specific data. To subscribe on event using callbacks a specific code should go under appropriate callback function. See example:
<pre>
	var mg2Connext = Connext.init({
		siteCode: 'XX',
		configCode: 'CFG1',
		onActionShown: function(e){
			// listener’s code goes here
		},
		onActionClosed: function(e){
			// listener’s code goes here
		}
	});                        
</pre>
Connext is firing same events through HTML document object. A consumer can chose either option to listen Connext events, what is more preferable. To subscribe on event using document object a specific code should go under appropriate `document.addEventListener() `function. See the example:
<pre>
	document.addEventListener("Connext_event_name",function(e){ 
	   // listener’s code goes here
	})
</pre>
Each callback function of the events get event object with parameters:

	{
		AuthSystem: AUTHSYSTEM, //mg2, auth0, janrain
		AuthProfile: object or null, (3-patry auth system profile)
		MG2AccountData: object or null, (response from Account services)
		CampaignId: 555,
		CampaignName: "Campaign name",
		Config: object (local config),
		Conversation: object (current conversation),
		EventData: determinate for each event type,
		MeterLevelId: 2,
		MeterLevel: "Metered"
	} 

See below full list of events fired on Connext:

## onInit 
version added: 1.0

Fired after Plugin was initialized successfully 

@ EventData
* Null - No event arguments
You can either listen to this event either by adding some custom code to the event call back on Init finction


## onMeterLevelSet 
version added: 1.0

This event fires either in case of success or fail of Dynamic Meter Level determining

@ EventData
* method: unique identifier for this action
* level: type of action shown

@ EventData example:

		{
			"method": "Default", // Values: default | dynamic
			"level": 2      	// Values: 1 | 2 | 3; (1 - free, 2 - metered, 3 - premium)
		}


## onDynamicMeterFound
 version added: 1.0

Fired after the Dynamic meter was found locally or received from the server

@ EventData
* Current dynamic meter name

@ EventData example


		EventData: “QA_DynamicMeter”   	// dynamic meter name

## onCampaignFound 
version added: 1.0

Fired after the Campaign configuration is found locally or received from the server

@ EventData
* Current Campaign id and name and conversations array per meter level

@ EventData example:

		{
		    "id": 101234,     		// Campaign id  
		    "Name": "Prod Campaign", // Campaign name  
		    "Conversations": {
		                     "Free":[{…}],
		                     "Metered":[{…}],
		                     "Premium":[{…}]
		     }
		}       

## onConversationDetermined 
version added: 1.0

Fired after the 'handleArticleView' function inside 'processConversation' function because this even will update our Demo Debug details 'view' html

@ EventData
* Current Conversation data object

@ EventData example

		{
		    "id": 103492,	// Conversation id
		    "Name": "5 articles desktop, 10 mobile", // Conversation name
		    "MeterLevelId": 2,	// Values: 1 | 2 | 3;  (1 - free, 2 - metered, 3 - premium)
		    "CampaignId": 101234,
		    "Order": 1,
		    "Actions": [
		        {
		            "id": 106927,
		            "Name": "Register Prompt",
		            "Description": "",
		            "ActionTypeId": 6,
		            "ConversationId": 103492,
		            "Order": 1,
		            "Who": {
		                "Views": [
		                    {
		                        "Qualifier": "==",
		                        "Val": "1"
		                    }
		                ]
		            },
		            "What": {
		                "SavedHtmlName": "Small_notif_mng_saved",
		                "Type": "6",
		                "Html": ''// Action html
		            },
		            "When": {
		                "Time": {
		                    "Delay": "00"
		                }
		            }
		        },
		    ],
		    "Options": {
		        "Expirations": {
		            "Time": {
		                "val": "1",
		                "key": "M",
		                "nextConversation": "103492"
		            }
		        }
		    },
		    "Props": {
		        "views": 3,
		        "paywallLimit": "10",
		        "isExpired": false,
		        "expiredReason": null,
		        "Date": {
		            "started": "2017-06-30T18:09:41+03:00",
		            "ended": null,
		            "expiration": "2017-07-30T18:09:41+03:00"
		        }
		    }
		}

## onCriticalError 
version added: 1.0

Fired in case of authorisation error (unknown AUTH_TYPE) or error during Campaign processing

## onActionShown 
version added: 1.0

Fired every time the modal/banner/inline/paywall appears on the screen

@ EventData
* Current Action data object

@ EventData example

		{
		    id: 106964 //action ai
		    ActionTypeId: 1,   	// Values: 1 | 2 | 3 | 4 | 6 | 11   
		    // 1 – banner, 2 – modal, 3 –paywall, 4 – inline, 6 – infobox, 11 - newsletter
		    ArticlesLeft: 1,
		    ArticlesViewed: 1,
		    CalculatedZipCode: "M6G",
		    ConversationId: 103492,
		    Description: "",
		    Name: "DESKTOP - HALWAY WARNING",	// Action name
		    Order: 2,				// Action order on a list of actions to show
		    UserDefinedData    :    "TestData", //Data defined by user in action settings
		    What: {		// Action what section data
		        Html: '', // action HTML
		        CSS: '', // action CSS
		        Location: "top",  	// applicable only for banners (actionType: 1). 
		        // Values: top | bottom
		        SavedHtmlName: "Popup-centered_b_saved",
		        Stickyness: "sticky", 	// applicable only for banners (actionType: 1). 
		        // Values:  sticky | fluid
		        Type: "1", 		// Values: 1 | 2 | 3 | 4 | 6 | 11; 
		        // 1 – banner, 2 – modal, 3 –paywall, 4 – inline, 6 – infobox, 11 - newsletter
		        UserDefinedData: "DimaTestData", //Data defined by user in action settings
		    },
		    When: {
		        Time: {
		            Delay: "5001",
		            Repeatable: "1",
		            RepeatableConv: "1"
		        }
		    }, 
		    Who: {
		        ScreenSizeCriteria: [
		            {
		                Qualifier: "==",
		                Value: "Desktop"
		            }
		        ],
		        UserStateCriteria: [
		            {
		                Value: "Logged Out"
		            }
		        ],
		        ViewsCriteria: [
		            {
		                Qualifier: "=="
		                Val: "3"
		            }
		        ]
		    },
		    	actionDom: object,	// jquery dom element
		}

## onActionClosed 
version added: 1.0

Fired every time user close modal/banner/infobox by clicking Close button (x) or dark overlay zone for modals

@ EventData
* Current Action data object

@ EventData example

		{
		    id: 106964  //action id
		    ActionTypeId: 1,   	// Values: 1 | 2 | 3 | 4 | 6 | 11   
		    // 1 – banner, 2 – modal, 3 –paywall, 4 – inline, 6 – infobox, 11 - newsletter
		    ArticlesLeft: 1,
		    ArticlesViewed: 1,
		    CalculatedZipCode: "M6G",
		    ConversationId: 103492,
		    Description: "",
		    Name: "DESKTOP - HALWAY WARNING",	// Action name
		    Order: 2,				// Action order on a list of actions to show
		    UserDefinedData    :    "TestData", //Data defined by user in action settings
		    What: {		// Action what section data
		        Html: '', // action HTML
		        CSS: '', // action CSS
		        Location: "top",  	// applicable only for banners (actionType: 1). 
		        // Values: top | bottom
		        SavedHtmlName: "Popup-centered_b_saved",
		        Stickyness: "sticky", 	// applicable only for banners (actionType: 1). 
		        // Values:  sticky | fluid
		        Type: "1", 		// Values: 1 | 2 | 3 | 4 | 6 | 11; 
		        // 1 – banner, 2 – modal, 3 –paywall, 4 – inline, 6 – infobox, 11 - newsletter
		        UserDefinedData: "DimaTestData", //Data defined by user in action settings
		    },
		    When: {
		        Time: {
		            Delay: "5001",
		            Repeatable: "1",
		            RepeatableConv: "1"
		        }
		    }, 
		    Who: {
		        ScreenSizeCriteria: [
		            {
		                Qualifier: "==",
		                Value: "Desktop"
		            }
		        ],
		        UserStateCriteria: [
		            {
		                Value: "Logged Out"
		            }
		        ],
		        ViewsCriteria: [
		            {
		                Qualifier: "==",
		                Val: "3"
		            }
		        ]
		    },
		    actionDom: object,	// jquery dom element
		    closeEvent: 'closeButton',	// Values: closeButton | closeSpan | clickOutside | escButton. 
		    // CloseSpan – link inside template like ‘No, thanks’
		}

## onButtonClick
 version added: 1.1

Fired every time user click on any element that has an attribute `'data-mg2-action=click'`. By default all buttons and links on ConneXt's templates have this attribute.
For track these events we can add data-connext-userdefined attribute to elements in action settings, and then check property `UserDefinedDataAttr` in event object.

@ EventData
* ArticlesLeft – articles left to the paywall
* ArticlesViewed – articles viewed in the conversation
* ButtonHTML – HTML of clicked element
* CalculatedZipCode – User’s calculated ZIP
* DOM event – DOM event object
* UserDefinedDataAttr – custom data defined on UserDefinedDataAttr attribute

@ EventData example

		{
		    ArticlesLeft: 0,
		    ArticlesViewed: 4,
		    ButtonHTML: '', //button HTML
		    CalculatedZipCode: 'M6G',
		    DOMEvent: object, //DOM event object
		    UserDefinedDataAttr: 'Attr data' // data from userdefined-data attribute
		}

## onNotAuthorized | onAuthorized | onHasAccess 
version added: 1.0

Fired every time when access is been checked (either on Init event or on Log in, Log out)

@ EventData

* AuthSystem with information about currently used Authentication system
* MG2AccountData with mg2 user account information
* AuthProfile with 3rd party account service user profile data (for different 3rd party account service we will be having here different objects)

@ EventData example

		{
		    AuthSystem: AUTHSYSTEM, //mg2, auth0, janrain
		    AuthProfile: object, // 3rd party Account service User profile
		    MG2AccountData: object // MG2 Account service User profile
		}

## onHasAccessNotEntitled | onHasNoActiveSubscription 
version added: 1.8

Fired every time when access is being checked (either on Init event or on Log in, Log out)

@ EventData

* AuthSystem with information about currently used Authentication system
* MG2AccountData with mg2 user account information
* AuthProfile with 3rd party account service user profile data (for different 3rd party account service we will be having here different objects)

@ EventData example

		{
		    AuthSystem: AUTHSYSTEM, //mg2, auth0, janrain
		    AuthProfile: object, // 3rd party Account service User profile
		    MG2AccountData: object // MG2 Account service User profile
		}

## onLoggedIn 
version added: 1.7

Fired every time when access has been checked and verified that user is logged in (no matter whether he has access or not)

@ EventData
* AuthSystem with information about currently used Authentication system
* MG2AccountData with mg2 user account information
* AuthProfile with 3rd party account service user profile data (for different 3rd party account service we will be having here different objects)

@ EventData example

		{
		    AuthSystem: 'Auth0',
		    MG2AccountData: {
		        "MasterId": "auth0|59943428409f1615164f93d0", // customer registration Id
		        "IgmRegID": null,	// encoded customer registrationId
		        "IgmContent": null,
		        "Subscriptions": [  	// array of linked subscriptions to a registration
		            {
		                "AccountId": "13457043204",
		                "SubscriberMasterId": -1,
		                "SubscriberStatus": "1	",	// 
		                "StartDate": "8/16/2017",
		                "ExpirationDate": "8/19/2017 5:29:45 AM",
		                "PaperCode": "150",
		                "ProductDescription": "",
		                "PublicationName": "",
		                "EzPayFlag": "",
		                "FirstName": "Kat",
		                "LastName": "Mia",
		                "EmailAddress": "xtest221@mailinator.com",
		                "PhoneNumber": "6334456634",
		                "Address1": "740 MEETINGHOUSE RD",
		                "Address2": "",
		                "City": "Elkins Park",
		                "State": "PA",
		                "PostalCode": "19027",
		                "SmartOfferSegment": null,	// calculated segment that allows to define list of upgrade / downgrade offers for a specific subscription
		                "SubscriptionLevel": 1,
		                "SubscriptionLevelHousehold": 1,	// household level
		                "PlanDescription": null
		            }
		        ],
		        "DigitalAccess": {
		            "IsAuthorized": true,
		            "ProductURL": null,
		            "AccessLevel": {
		                "AccessLevelId": 1,
		                "AccessLevelCode": "Premium",
		                "AccessLevelDescription": "Premium",
		                "IsPremium": true,
		                "IsUpgrade": false,
		                "IsPurchase": false
		            },
		            "Success": true,
		            "SuccessCode": null,
		            "Errors": null
		        },
		        "UserToken": null
		    },
		    AuthProfile: { 	// this is an example of Auth0UserProfile. For different 3rd party account service 		we will be having here different objects
		        "email": "xtest221@mailinator.com",
		        "user_metadata": {
		            " MG2AccountData ": {
		                "mg2": {
		                    "account_id": "PHL57043204",
		                    "active": false,
		                    "ez_pay": false,
		                    "level": "1",
		                    "hh": "1",
		                    "has_subscription": true
		                }
		            },
		            "picture": "https://s.gravatar.com/avatar/de8cf671e6d752dd1891b51c63fad452?		s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fxt.png",
		            "nickname": "xtest221",
		            "name": "xtest221@mailinator.com",
		            "email_verified": true,
		            "user_id": "auth0|59943428409f1615164f93d0",
		            "clientID": "qaM1sDGqd4HYHfXoaRtb7wNHL0Y6lqb8",
		            "identities": [
		                {
		                    "user_id": "59943428409f1615164f93d0",
		                    "provider": "auth0",
		                    "connection": "Username-Password-Authentication",
		                    "isSocial": false
		                }
		            ],
		            "updated_at": "2017-08-18T11:56:37.025Z",
		            "created_at": "2017-08-16T12:01:44.654Z",
		            "sub": "auth0|59943428409f1615164f93d0"
		        }
		    }
		}

## onAccessTemplateShown 
version added: 1.9

This event fires every time when user opens an access template.

@ EventData
* UserIP - Current User IP, 
* WhitelistSets – all available allowed IPs sets, 
* FoundInWhithelistSet - allowed IP set where User’s IP was found

@ EventData example

		{
		    WhitelistSets: [],  // all whitelist sets,
		    FoundInWhithelistSet: object, //where was found IP
		    UserIP: USER_IP, // calculated user IP,
		}

## onAccessTemplateClosed 
version added: 1.9

This event fires every time when user closes an access template.

@ EventData
* UserIP - Current User IP, 
* WhitelistSets – all available allowed IPs sets, 
* FoundInWhithelistSet - allowed IP set where User’s IP was found
* closeEvent- determines the way how AccessTemplate was closed

@ EventData example

		{
		    WhitelistSets: [],  // all whitelist sets,
		    FoundInWhithelistSet: object, //where was found IP
		    UserIP: USER_IP, // calculated user IP,
		    closeEvent: 'closeButton',	// Values: closeButton | closeSpan | clickOutside | escButton. 
		}

## onAccessGranted 
version added: 1.9

This event fires every time when user gets access.

@ EventData
* Success message and status code

@ EventData example

		{
		    message: ‘Success! Now you have full access’,  // success message,
		    status: 200, //status code
		}

## onAccessDenied 
version added: 1.9

This event fires every time when user doesn’t get access.

@ EventData
* Error message and status code

@ EventData example

		{
		    message: ‘Any error message’,  // error message,
		    status: 400, //status code
		}

## onActivationFormShown 
version added: 1.11

Fired after activation form will be shown. 

@EventData
* ActivationSettings

@EventData example

		{
		    ActivationSettings: {
		        ActivationFormHtml: ‘’,         // Activation form html
		        ActivationFormName: ‘Activate’, // Activation form name
		        IsActivationOnly: true          // Type of configuration
		    }
		}

## onActivationLoginStepShown 
version added: 1.11

Fired, when we are in login/register modal. 

@EventData
* ActivationSettings

@EventData example

		{
		    ActivationSettings: {
		        ActivationFormHtml: ‘’,         // Activation form html
		        ActivationFormName: ‘Activate’, // Activation form name
		        IsActivationOnly: true          // Type of configuration
		    }
		}

## onActivationLoginStepClosed 
version added: 1.11

This event fires every time when user closes an activation template on the ‘Authenticate’ step.

@EventData
* ActivationSettings
* closeEvent

@EventData example

		{
		    ActivationSettings: {
		        ActivationFormHtml: ‘’,         // Activation form html
		        ActivationFormName: ‘Activate’, // Activation form name
		        IsActivationOnly: true          // Type of configuration
		    },
		    closeEvent: 'closeButton',	// Values: closeButton | clickOutside | escButton. 
		}                

## onActivationLinkStepShown 
version added: 1.11

Fired, when we are in link workflow. 

@EventData
* ActivationSettings

@EventData example

		{
		    ActivationSettings: {
		        ActivationFormHtml: ‘’,         // Activation form html
		        ActivationFormName: ‘Activate’, // Activation form name
		        IsActivationOnly: true          // Type of configuration
		    }
		}

## onActivationLinkStepClosed 
version added: 1.11

This event fires every time when user closes an activation template on the ‘Activate’ step.

@EventData
* ActivationSettings
* closeEvent

@EventData example

		{
		    ActivationSettings: {
		        ActivationFormHtml: ‘’,         // Activation form html
		        ActivationFormName: ‘Activate’, // Activation form name
		        IsActivationOnly: true          // Type of configuration
		    },
		     closeEvent: 'closeButton',	// Values: closeButton | clickOutside | escButton. 
		}

## onActivationLinkStepSubmitted
vrsion added: 1.11

Fired when verification of an account started.

@EventData
* ActivateBy,
* ActivationSettings
* Payload

@EventData example

		{
		    ActivateBy: ‘ActivateByAccountNumber’
		    ActivationSettings: {
		        ActivationFormHtml: ‘’,         // Activation form html
		        ActivationFormName: ‘Activate’, // Activation form name
		        IsActivationOnly: true          // Type of configuration
		    },
		    Payload: {
		        AccountNumber: ‘1111’,
		        LastName: ‘Name’,
		        SearchOption: ‘ActivateByAccountNumber’,
		        customRegId: ‘1234’
		    }
		}

## onActivationLinkSuccessStepShown
version added: 1.11

Fired when verification of an account was completed successfully.

@EventData
* ActivateBy,
* ActivationSettings,
* Response

@EventData example

		{
		    ActivateBy: ‘ActivateByAccountNumber’
		    ActivationSettings: {
		        ActivationFormHtml: ‘’,         // Activation form html
		        ActivationFormName: ‘Activate’, // Activation form name
		        IsActivationOnly: true          // Type of configuration
		    },
		    Response: {}                        // Ressponse from the server
		}

## onActivationLinkSuccessStepClosed 
version added: 1.11

This event fires every time when user closes an activation template on the ‘Success’ step.

@EventData
* ActivationSettings
* CloseEvent
* ActivateStatus

@EventData example

		{
		    ActivationSettings: {
		        ActivationFormHtml: ‘’,         // Activation form html
		        ActivationFormName: ‘Activate’, // Activation form name
		        IsActivationOnly: true          // Type of configuration
		    },
		     closeEvent: 'closeButton',	// Values: closeButton | clickOutside | escButton. 
		     ActivateStatus: 'success'
		}

## onActivationLinkErrorStepShown 
version added: 1.11

Fired when verification of an account was completed with errors.

@EventData
* ActivateBy
* ActivationSettings
* Response

@EventData example
              
		{
		    ActivateBy: ‘ActivateByAccountNumber’
		    ActivationSettings: {
		        ActivationFormHtml: ‘’,         // Activation form html
		        ActivationFormName: ‘Activate’, // Activation form name
		        IsActivationOnly: true          // Type of configuration
		    },
		    Response: {}                        // Response from the server
		}

## onActivationLinkErrorStepClosed 
version added: 1.11

This event fires every time when user closes an activation template on the ‘Fail’ step.

@EventData
* ActivationSettings
* CloseEvent
* ActivateStatus

@EventData example
                
		{
		    ActivationSettings: {
		        ActivationFormHtml: ‘’,         // Activation form html
		        ActivationFormName: ‘Activate’, // Activation form name
		        IsActivationOnly: true          // Type of configuration
		    },
		     closeEvent: 'closeButton',	// Values: closeButton | clickOutside | escButton. 
		     ActivateStatus: 'error'
		}

## OnActivationFormClosed 
version added: 1.11

This event fires every time when user closes an activation template.

@EventData
* ActivationSettings
* closeEvent

@EventData example
              
		{
		    ActivationSettings: {
		        ActivationFormHtml: ‘’,         // Activation form html
		        ActivationFormName: ‘Activate’, // Activation form name
		        IsActivationOnly: true          // Type of configuration
		    },
		     closeEvent: 'closeButton',	// Values: closeButton | clickOutside | escButton. 
		}


## onFlittzPaywallShown 
version added: 1.3

This event fires every time when Flittz  appears on the screen
@ EventData
* Current Action data object

@ EventData example

		{
		    id: 106964 //action ai
		    ActionTypeId: 1,   	// Values: 1 | 2 | 3 | 4 | 6 | 11   
		    // 1 – banner, 2 – modal, 3 –paywall, 4 – inline, 6 – infobox, 11 - newsletter
		    ArticlesLeft: 1,
		    ArticlesViewed: 1,
		    CalculatedZipCode: "M6G",
		    ConversationId: 103492,
		    conversation: object, 	// Current conversation
		    viewCount: 1,
		    hasFlittz: true, // ConneXt option ‘integrateFlittz’
		    Description: "",
		    Name: "DESKTOP - HALWAY WARNING",	// Action name
		    Order: 2,				// Action order on a list of actions to show
		    UserDefinedData    :    "TestData", //Data defined by user in action settings
		    What: {		// Action what section data
		        Html: '', // action HTML
		        CSS: '', // action CSS
		        Location: "top",  	// applicable only for banners (actionType: 1). 
		        // Values: top | bottom
		        SavedHtmlName: "Popup-centered_b_saved",
		        Stickyness: "sticky", 	// applicable only for banners (actionType: 1). 
		        // Values:  sticky | fluid
		        Type: "1", 		// Values: 1 | 2 | 3 | 4 | 6 | 11; 
		        // 1 – banner, 2 – modal, 3 –paywall, 4 – inline, 6 – infobox, 11 - newsletter
		        UserDefinedData: "DimaTestData", //Data defined by user in action settings
		    },
		    When: {
		        Time: {
		            Delay: "5001",
		            Repeatable: "1",
		            RepeatableConv: "1"
		        }
		    }, 
		    Who: {
		        ScreenSizeCriteria: [
		            {
		                Qualifier: "==",
		                Value: "Desktop"
		            }
		        ],
		        UserStateCriteria: [
		            {
		                Value: "Logged Out"
		            }
		        ],
		        ViewsCriteria: [
		            {
		                Qualifier: "=="
		                Val: "3"
		            }
		        ]
		    },
		    	actionDom: object,	// jquery dom element
		}

## onFlittzPaywallClosed
version added: 1.7

This event fires every time when user closes Flittz by clicking Close button (x) or dark overlay zone for modals

@ EventData
* Conversation - Current Conversation data object
* viewCount – Article View Count
* hasFlittz- an option whether we are integrated with Flittz
* Current Action DOM

@ EventData example

		{
		    conversation: object, 	// Current conversation
		    viewCount: 1,
		    hasFlittz: true, // ConneXt option ‘integrateFlittz’
		    actionDom: object,	// jquery dom element
		}

## onFlittzButtonClick 
version added: 1.1

This event fires every time when user clicks on a Flittz button

@ EventData
* Current Action data object

@ EventData example

		{
		    id: 106964 //action ai
		    ActionTypeId: 1,   	// Values: 1 | 2 | 3 | 4 | 6 | 11   
		    // 1 – banner, 2 – modal, 3 –paywall, 4 – inline, 6 – infobox, 11 - newsletter
		    ArticlesLeft: 1,
		    ArticlesViewed: 1,
		    CalculatedZipCode: "M6G",
		    ConversationId: 103492,
		    Conversation: object, 	// Current conversation
		    viewCount: 1,
		    hasFlittz: true, // ConneXt option ‘integrateFlittz’
		    Description: "",
		    Name: "DESKTOP - HALWAY WARNING",	// Action name
		    Order: 2,				// Action order on a list of actions to show
		    UserDefinedData    :    "TestData", //Data defined by user in action settings
		    What: {		// Action what section data
		        Html: '', // action HTML
		        CSS: '', // action CSS
		        Location: "top",  	// applicable only for banners (actionType: 1). 
		        // Values: top | bottom
		        SavedHtmlName: "Popup-centered_b_saved",
		        Stickyness: "sticky", 	// applicable only for banners (actionType: 1). 
		        // Values:  sticky | fluid
		        Type: "1", 		// Values: 1 | 2 | 3 | 4 | 6 | 11; 
		        // 1 – banner, 2 – modal, 3 –paywall, 4 – inline, 6 – infobox, 11 - newsletter
		        UserDefinedData: "DimaTestData", //Data defined by user in action settings
		    },
		    When: {
		        Time: {
		            Delay: "5001",
		            Repeatable: "1",
		            RepeatableConv: "1"
		        }
		    }, 
		    Who: {
		        ScreenSizeCriteria: [
		            {
		                Qualifier: "==",
		                Value: "Desktop"
		            }
		        ],
		        UserStateCriteria: [
		            {
		                Value: "Logged Out"
		            }
		        ],
		        ViewsCriteria: [
		            {
		                Qualifier: "=="
		                Val: "3"
		            }
		        ]
		    },
		    ButtonArgs: obj, // dom event
		    ActionDom: object, // jquery dom element
		}

## onRun 
version added: 1.10

This event fires every time when function Connext.Run() is called

@ EventData – empty

## onFinish 
version added: 1.10

This event fires when Connext finished work 

@ EventData – empty


## onLoginShown 
version added: 1.14

This event fires every time when Login modal appears on the screen

@ EventData
* LoginModalHtml - HTML of login modal
* LoginModalId – ID of login modal
* LoginModalName – Name of login modal
* jQueryElement – jQuery element

@ EventData example
   
		{
		    LoginModalHtml: "", // modal html
		    LoginModalId: 1173, // modal id
		    LoginModalName: "Login-form_d", // modal name
		    jQueryElement: obj // jQuery element
		}

## onLoginClosed 
version added: 1.14

This event fires every time when user closes login modal 

@ EventData
* LoginModalHtml - HTML of login modal
* LoginModalId – ID of login modal
* LoginModalName – Name of login modal
* jQueryElement – jQuery element
* closeEvent – reason of the closing

@ EventData example

		{
		    LoginModalHtml: "", // modal html
		    LoginModalId: 1173, // modal id
		    LoginModalName: "Login-form_d", // modal name
		    jQueryElement: obj, // jQuery element
		    closeEvent: 'closeButton', // Values: closeButton | clickOutside | escButton. 
		}

## onLoginSuccess 
version added: 1.14

Fired when login was completed successfully.

@ EventData
* AuthSystem with information about currently used Authentication system
* MG2AccountData with mg2 user account information
* AuthProfile with 3rd party account service user profile data (for different 3rd party account service we will be having here different objects)

@ EventData example

		{
		    AuthSystem: AUTHSYSTEM, //mg2, auth0, janrain
		    AuthProfile: object, // 3rd party Account service User profile
		    MG2AccountData: object // MG2 Account service User profile
		}

## onLoginError 
version added: 1.14

Fired when login was failed.

@ EventData
* ErrorMessage - A message about error

@ EventData example

		{
		    ErrorMessage: ‘string’, //error message
		}
