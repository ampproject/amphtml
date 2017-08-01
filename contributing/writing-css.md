# Writing CSS For AMP Runtime?

- [Who should read this doc?](#who-should-read-this-doc)
- [What is Specificity?](#what-is-specificity)
  - [Example CSS selectors](#example-css-selectors)
  - [How to calculate Specificity](#how-to-calculate-specificity)
- [Writing CSS in AMP Runtime or Extensions](#writing-css-in-amp-runtime-or-extensions)
  - [Creating a new Selector:](#creating-a-new-selector)
  - [Modifying an existing Selector:](#modifying-an-existing-selector)
  - [FOUC](#fouc)
  - [Rule of thumb](#rule-of-thumb)
- [Case Studies](#case-studies)
  - [AMP Selector CSS has high CSS specificity](#amp-selector-css-has-high-css-specificity)
  - [AMP Accordion CSS Changes broke specificity](#amp-accordion-css-changes-broke-specificity)
- [Reading material](#reading-material)

## Who should read this doc?

Are you a contributor to ampproject/amphtml, so you make changes to the runtime or add or
modify amp-extensions? Then you should definitely read this document.

Do you write solutions on top of the amp library (ampstart/ABE), this may be a good read for
you.

## What is Specificity?

Specificity is the means by which browsers decide which CSS property values are the most
relevant to an element and, therefore, will be applied. Specificity is based on the matching rules
which are composed of different sorts of CSS selectors.


A selector is something which can identify/select an element or a group of elements and apply a
list of properties to all the selected elements

### Example CSS selectors

```css
 *
.favorite
ul#summer-drinks li.favorite
html body div#pagewrap ul#summer-drinks li.favorite
html > body div#pagewrap ul#summer-drinks > li.favorite
.ampstart-dropcap:first-letter
#summer-drinks::before
#summer-drinks::after
```
A selector can contain a class, id, pseudo elements, psuedo classes , :not(), and a combination
of any of these and many more(Here is a comprehensive list of all the selectors -
https://developer.mozilla.org/en-US/docs/Web/CSS/Reference#Selectors​).

In general, the order of the CSS selectors do not affect which rules get applied to your CSS,
unless the selectors have the same specificity and apply to at-least one element in common.
A well written CSS will work perfectly well even when the selectors are re-ordered (example
scenario- reordering imports in a css file). In real world it is hard to achieve this , especially
when we import CSS via gulp or 3p css (which can change at any time)

### How to calculate Specificity

This blog explains specificty in very simple terms and helps to understand how it is computed -
https://css-tricks.com/specifics-on-css-specificity/​ (very short and understandable - I promise)

Here is an online calculator that can be used to compute specificity -
https://specificity.keegan.st/

## Writing CSS in AMP Runtime or Extensions

### Creating a new Selector:
```
1. Keep the specificity as low as possible - The Selector Properties should be easily
    overridable (using may be a single id or class-name, without having to repeat a complex
    selector).


2. Try to write selectors using tag-names and attributes (Class names that get added after
    build GET FOUC). FOUC (Flash Of Unstyled Content), is a really bad UX, use caution
    and best effort to STAY AWAY from using elements/classes that are a result of
    BUILDing in the CSS.
       ○ A good example would be amp-selector
       ○ A bad example would be amp-accordion (See the ​Case Study​ below)
3. Keep the Selector as simple as possible (readable)
```

### Modifying an existing Selector:

This is a bit more tricky than creating a new selector (with completely new properties).

AMP is a versioned Library that a lot of websites use. But I am only changing CSS , how can
this break AMP?
Yes you can! All it takes to break backward compatibility is replacing a selector with another
selector that has higher specificity.
```
1. Do not change the specificity of a selector if possible
2. If a new property (like font-size: 12px;) is being added , it is okay to add a new selector
3. If an existing property is being shifted around between existing selectors make sure the
    properties always move from higher specificity to lower specificity
4. DO NOT move properties to a selector with high specificity at any cost - This is a
    BREAKING change
5. Remember there are 2 types of properties
    a. Overridable
    b. Non-overridable - The ones suffixed with !important
       ■ These properties can be shifted around easily. However BE CAUTIOUS
          when you suffix an existing property with !important , this is ALWAYS
          going to BREAK backward compatibility. (But could fix issues)
       ■ Always add !important during the first pass, Plan for it during design or
          early implementation phases.
```

### FOUC

When building extensions always be aware of things that could cause FOUC (Flash Of Unstyled
Content). This happens when (if) the extension is built very late and the extension’s CSS is
dependent on DOM Structure changes (addition of a class or a tag or may be restructuring the
DOM itself) that happens as a result of building the extension.

While it is not completely possible to avoid this, ideally it would be better to write selectors that
are independent of BUILD outcomes. This ensures that there is no repaints (at least in the initial
state).


One way to avoid relayouts after BUILD is to separate out all the CSS properties into `in` and
`out` properties. "In" styles are unlikely to cause a lot of FOUC or any at all. "out" styles may and
we should probably phrase it as "not allowed". A good example is padding vs margin of the
element itself. It's totally fine to change padding during build, but a huge no-no for margin.

### Rule of thumb
```
1. Create low specificity selectors
2. Mostly OK move properties/selectors from HIGHER TO LOWER specificity
3. DON’T move properties/selectors from LOWER TO HIGHER specificity
4. Avoid FOUC by writing CSS on tags and attributes and not depending on BUILD
    outcomes.
```


## Case Studies

### AMP Selector CSS has high CSS specificity

```css
amp-selector​:not​([​disabled​]) [​option​][​selected​]​:not​([​disabled​]) {
​outline​: ​solid​ ​ 1 ​px​ ​rgba​(​ 0 ​,​ 0 ​,​ 0 ​,​0.7​);
}
```
Above is an Example of a super bad selector

1. Super high specificity selector , i.e, very hard to override using a single class name or id
2. No comments and completely not easily readable


The only good part about this is it completely avoids FOUC by targeting tags and attributes and
not depending on the build outcome

Here is how we changed this make it better

```css
amp-selector​ [​option​][​selected​] {
​outline​: ​solid​ ​ 1 ​px​ ​rgba​(​ 0 ​,​ 0 ​,​ 0 ​,​0.7​);
}
amp-selector​ [​selected​][​disabled​],
amp-selector​[​disabled​] [​selected​] {
​outline​: ​none​;
}
```
Fixing PR:
https://github.com/ampproject/amphtml/commit/e12deb125bc0bed16d33481e0c
50

### AMP Accordion CSS Changes broke specificity
```diff
- .i-amphtml-accordion-header​ {
- ​cursor​: ​pointer​;
- ​background-color​: ​#efefef​;
- ​padding-right​: ​ 20 ​px​;
- ​border​: ​solid​ ​ 1 ​px​ ​#dfdfdf​;
- }


+ amp-accordion​ ​>​ ​section​ ​>​ ​:first-child​ {
+ ​cursor​: ​pointer​;
+ ​background-color​: ​#efefef​;
+ ​padding-right​: ​ 20 ​px​;
+ ​border​: ​solid​ ​ 1 ​px​ ​#dfdfdf​;
+}
```
Breaking change:
https://github.com/ampproject/amphtml/commit/f2a361651b4b4d1d484c6cd9502c895695545d
b

GH Issue : ​https://github.com/ampproject/amphtml/issues/

Partial Rollback: ​https://github.com/ampproject/amphtml/pull/

Lesson learnt here is , even though the breaking CSS was a good change it fixed the FOUC
due to the class introduced at BUILD, it moved properties from a selector with LOWER
specificity to HIGHER specificity, which breaks backward compatibility.


## Reading material

- https://csswizardry.com/2014/07/hacks-for-dealing-with-specificity/
- https://csswizardry.com/2012/05/keep-your-css-selectors-short/
- https://philipwalton.com/articles/do-we-actually-need-specificity-in-css/


