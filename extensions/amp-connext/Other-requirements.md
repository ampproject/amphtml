# Other requirements

## HTML Templates Requirements

In order to ensure consistency, you should follow some important requirements for your HTML/CSS code.
There are 7 types of templates available for Connext:
* Modal
* Inline
* Paywall
* Small info box
* Banner
* Newsletter
* Activation

Every type has unique behavior and generic html container.

**For Modal use:**
<pre>
 &lt;div data-display-type="modal" tabindex="-1" data-width="" class="Mg2-connext modal fade in"&gt;
	 &lt;div class="modal-body"&gt;
		 &lt;a href="#" class="fa fa-times closebtn" data-dismiss="modal" aria-label="Close" aria-hidden="true"&gt; &lt;/a&gt;
			//your code here
	 &lt;/div&gt;
 &lt;/div&gt;                           
</pre>                       

**For Inline use:**
<pre>
 &lt;div data-display-type="inline" class="Mg2-connext"&gt;
	 &lt;div class="inline-body"&gt;
		//your code here	
	 &lt;/div&gt;
 &lt;/div&gt;                          
</pre> 

Inline templates can be appended to any html container, according to 'Content Selector' defined at Action setup section of 'Campaigns' page. In order to make Inlines more flexible, use specific classes like 'Mg2-inline-scale-400' that represents parent container width is between 400px and 500px. Connext plugin adds these classes automatically during action execution, so if you want inline template to look well at 300px, prepare appropriate styles for CSS class 'Mg2-inline-scale-300' and so on for any other container width. For example, if parent container width is 480px, the 'Mg2-inline-scale-400' class will be added to inline template container, and so on.

There are 2 modifications for Paywall – ‘Modal Paywall’ and ‘Inline Paywall’. Just use the same templates as for ‘Modal’ or ‘Inline’ and add class ‘.paywall’.

**For Small Info Box use:**
<pre>
 &lt;div data-display-type="info-box" data-width="" tabindex="-1" class="Mg2-connext info-box bottom hide"&gt;	
   	 &lt;div class="info-box-body"&gt;
		 &lt;a href="#" class="fa fa-times closebtn" data-dismiss="modal" aria-label="Close" aria-hidden="true"&gt; &lt;/a&gt;
		 &lt;div class="contener"&gt;
			//your code here
		 &lt;/div&gt;
	 &lt;/div&gt;
  &lt;/div&gt;                             
</pre> 
          

**For Banner use:**
<pre>
  &lt;div data-display-type="banner" tabindex="-1" class="Mg2-connext banner fullwidth bottom hide"&gt;	
	 &lt;div class="banner-body row"&gt;
		 &lt;a href="#" class="fa fa-times closebtn" data-dismiss="info-box" aria-label="Close" aria-hidden="true"&gt; &lt;/a&gt;
		 &lt;div class="contener container-fluid"&gt;
			//your code here
		 &lt;/div&gt;
	 &lt;/div&gt;
 &lt;/div&gt;                            
</pre> 


To avoid CSS-conflicts all of your CSS styles should be wrapped with ‘body .Mg2-connext’ prefix. For example, if all links on the page have CSS style 'a{color: green}', so without any isolation all links at Connext templates will also have green color. Main prefix class 'body Mg2-connext' helps to prevent it. The best practice is to use any preprocessor to wrap all the styles.

To avoid CSS-conflicts, use namespace prefix ‘Mg2-‘ for your general CSS-classes (e.g ‘.Mg2-center’ instead of ‘.center’).

You can use Bootstrap grid system and its typography – lite custom version of Bootstrap is included.

In order to hook custom callback (during Plugin initialization) for click-events on any button, add attribute 'data-mg2-action="click"'.

There are also some helpful classes you can use as well:
<pre>
.p-0{padding: 0;} //Set zero paddings for the element
.m-0{margin:0;} //Set zero margins for the element
.p-b-2{padding-bottom:20px;} //Set bottom padding to 20px for the element
.m-b-1{margin-bottom:10px;} //Set bottom margin to 10px for the element
.m-t-1{margin-top:10px;} //Set top margin to 10px for the element
.m-r-1{margin-right:10px;} //Set right margin to 10px for the element
.m-l-1{margin-left:10px;}  //Set left margin to 10px for the element
	
.m-b-15{margin-bottom:15px;} //Set bottom margin to 15px for the element
.m-t-15{margin-top:15px;} //Set top margin to 15px for the element
.m-r-15{margin-right:15px;} //Set right margin to 15px for the element
.m-l-15{margin-left:15px;} //Set left margin to 15px for the element

.m-b-2{margin-bottom:20px;} //Set bottom margin to 20px for the element
.m-t-2{margin-top:20px;} //Set top margin to 20px for the element
.m-r-2{margin-right:20px;} //Set right margin to 20px for the element
.m-l-2{margin-left:20px;} //Set left margin to 20px for the element

.Mg2-text-center{text-align: center;} //Set text alignment to center
.Mg2-font-italic{font-style: italic;} // Set font style to italic

.Mg2-align-left{text-align:left;} //Set text alignment to left
.Mg2-align-right{text-align:right;} //Set text alignment to right
</pre> 


### Predefined template attributes
There are 4 pre-defined attributes you can set for any action template. To use it, just include it to action template on Campaigns page:
* **{{ArticleLeft}}**
Use this attribute to show amount of articles left before paywall appear.
* **{{CurrentViewCount}}**
Indicates current article view
* **{{ExpireTimeLeft}}**
Represents time before current conversation expiration	
* **{{UserFullName}}**
Use this attribute for output registered user name. User should be logged in.

### Buttons requirements
Closing button should be a <a > link element. It requires ‘closebtn’ class, which describes its appearance. Closing button also must contain [data-dismiss="modal"] attribute, which provides default closing behavior. The ‘href’ attribute may be ‘#’ or some real web address. In first case button has default behavior and just closes the template. If ‘href’ attribute is an external link, clicking the closing button will redirect user to new page using this link.
There is a list of pre-defined data-attributes, which add appropriate behavior to any button/link. Only one [data-mg2-action] attribute per element allowed.

<pre>
[data-mg2-action="click"] // will fire 'onButtonClick' Connext event. Clicking on element fire this event without any other specific behavior. All other attributes include 'onButtonClick' firing by default.
[data-mg2-action="login"] // will fire Connext Login/register modal
[data-mg2-action="submit"] // will fire initiate subscribing process. In this case, Email input with [data-mg2-input="Email"] attribute is required
[data-mg2-action="Zipcode"] // will fire start submitting Zipcode. In this case, Zipcode input with [data-mg2-input="Zipcode"] attribute is required
[data-mg2-action="openNewsletterWidget"] // will fire opening Newsletter Widget if it is available on the page
[data-mg2-action="activation"] // will fire Activation flow
[data-mg2-action="logout"] // will fire logout procedure
[data-mg2-action="connextRun"] // will fire Connext to run 
[data-mg2-submit="login"] // will initiate login process. Email input with [data-mg2-input="Username"] and Password input with [data-mg2-input="Password"] attribute are required
[data-mg2-submit="janrainLogin"] // will open Janrain login modal if it's available
[data-fz-btn="smartAuth"] // will start Flittz flow if it's available
[data-connext-userdefined] // this attribute can carry any user data and transmit it within Connext events "onButtonClick", "onActionShown"and "onActionClosed"
[data-connext-template-step], [data-connext-template-substep] // define template steps and substeps. Each template should consist of at least 1 step and 1 substep inside step. Step and substep names should be unique within one template
</pre>


### Generic containers and Template builder requirements
Every template type has its own predefined container and considered as a non-changeable constant. Parent container element should have general classes ‘Mg2-connext x-editable-text’. Template created with Template builder consists of 2 parts – predefined container and inner content block. Template builder WYSIWYG area represents inner content block. To create template within WYSIWYG Template builder you need to create Bootstrap layout structure first and then add some content.
If you want any custom template (created outside the WYSIWYG Template builder) to be available for editing in the Template builder, following requirements are mandatory:
* Template should have Bootstrap layout based on rows and columns with standard Bootstrap classes.
* Template should have generic wrapper (modal, banner, inline or info-box) as it was described above.
* Every template should have step-based structure and consist at least one step and one substep inside step. Each step is represented by Bootstrap row element (div with class ‘row’) with [data-connext-template-step] attribute and inner wrapper Bootstrap column element (div with class ’col-md-12’). Each step may consist of at least 1 substep which is represented by Bootstrap row element with attribute
`[data-connext-template-substep]`
* Steps and substeps should have unique attribute values 
`[data-connext-template-step] `
`[data-connext-template-substep] `
to provide correct switching between steps and substeps
* Step’s and substep’s attribute values are using in JS to provide correct work of the whole flow, so its strongly recommended not to change them for existing Activation templates. Error message block should have attribute
`[data-mg2-dynamic-content="LoginFormError"] `
Steps and substeps that are hidden by default should have attributes 
`[data-step-display=’none’] `
First step and first substep should be always visible by default. Although within WYSIWYG Template builder all substeps are initially visible and ready for editing.
* To make any content block editable within Template builder, wrap it with HTML comments 
`<!--gm-editable-region--><any content block here><!--/gm-editable-region-->`


## Pictures size requirements
Here are the perfect minimal sizes for the pictures to place into different templates. You can, of course, slightly change them, but then pay attention to the proportions.

Here you can generate pictures of the sizes you need: http://dummyimage.com/

**Banners:**

Wide_pic expanded - minimum 350 x 260 px, aspect ratio - (4:3).

Wide_pic input_expanded - minimum 350 x 260 px, (4:3).

Stripe wide banner - minimum 60 x 40 px, (4:3).

Banner_type1_mng, Banner_type2_mng - minimum 2560 x 400 px, aspect ratio - (32:5) or any small repeatable texture.

**Modals:**

Popup_a, Popup_b - minimum 730 x 480 px, (3:2).

Popup-bottom-gradient, Popup-bottom-overlay, Popup-center_simple - minimum 825 x 540 px, (3:2)

Popup_centered_a, Popup_centered_b – minimum 1064 x 538 px, (2:1).

**Paywalls:**

Inline_b: minimum 900 x 200 px, (9:2).

**Small info box:**

Small squared_pic – minimum 231 x 88 px, (8:3).