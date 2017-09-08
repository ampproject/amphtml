# AMP Design Principles

These design principles are meant to guide the ongoing design and development of AMP. They should help us make internally consistent decisions.


## User Experience > Developer Experience > Ease of Implementation.

When in doubt, do what’s best for the end user experience, even if it means that it’s harder for the page creator to build or for the library developer to implement.


## Don’t design for a hypothetical faster future browser.

We’ve chosen to build AMP as a library in the spirit of the [extensible web manifesto](https://github.com/extensibleweb/manifesto/blob/master/README.md) to be able to fix the web of today, not the web of tomorrow.

AMP should be fast in today's browsers. When certain optimizations aren't possible with today's platform, AMP developers should participate in standards development to get these added to the web platform.


## Don’t break the web.

Ensure that if AMP has outages or problems it doesn’t hurt the rest of the web. That means if the Google AMP Cache, the URL API or the library fails it should be possible for websites and consumption apps to gracefully degrade. If something works with an AMP cache it should also work without a cache.


## Solve problems on the right layer.

E.g. don’t integrate things on the client side, just because that is easier, when the user experience would be better with a server side integration.


## Only do things if they can be made fast.

Don’t introduce components or features to AMP that can’t reliably run at 60fps or hinder the instant load experience on today’s most common mobile devices.


## Prioritise things that improve the user experience – but compromise when needed.

Some things can be made fast and are still a terrible user experience. AMPs should deliver a fantastic user experience and speed is just one part of that. Only compromise when lack of support for something would stop AMP from being widely used and deployed.


## No whitelists.

We won’t give any special treatment to specific sites, domains or origins except where needed for security or performance reasons.
