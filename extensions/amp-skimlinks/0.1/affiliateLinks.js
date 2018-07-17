export const LINK_STATUS__AFFILIATE = 'affiliate';
export const LINK_STATUS__NON_AFFILIATE = 'non-affiliate';
export const LINK_STATUS__IGNORE_LINK = 'ignore';
export const LINK_STATUS__UNKNOWN = 'unkonwn';

export default class AffiliateLinks {
  constructor(domainResolver) {
    this.domainResolver_ = domainResolver;
    this.linkMap_ = new Map();
  }

  initialize(options) {
    this.onAffiliate_ = options.onAffiliatedClick;
    this.onNonAffiliate_ = options.onNonAffiliate;
    this.linkSelector_ = options.linkSelector;

    document.addEventListener('click', this.clickHandler_.bind(this));

    this.reset();
  }

  addDomChangeListener_() {
    // TODO
    //Listen for event
    this.reset();
  }


  reset() {
    this.linkMap_.clear();
    const links = this.getLinksInDOM_();
    // Resolve status of links with an already known domain
    const unknownLinks = this.updateLinkMap_(links);

    // If there are some unresolved links, ask beacon.
    if (unknownLinks.length) {
      this.resolveUnknownLinks_(unknownLinks).then(() => {
        // Ignore if there are links that are still unknown.
        const stillUnknown = this.updateLinkMap_(unknownLinks);
        // TODO: If DEV ONLY
        if (stillUnknown.length) {
          console.error("You have some links still unknown after trying to resolve them.")
        }
      });
    }
  }

  updateLinkMap_(links) {
    const unknownLinks = [];

    links.forEach(link => {
      const status = this.getLinkAffiliateStatus_(link);
      this.linkMap_.set(link, {
        status,
      });

      if (status === LINK_STATUS__UNKNOWN) {
        unknownLinks.push(link);
      }
    });

    return unknownLinks;
  }

  clickHandler_(e) {
    e.preventDefault();
    const link = e.target;
    const linkState = this.linkMap_.get(link);
    console.log('Received click', link, linkState);
  }

  getLinksInDOM_() {
    return document.querySelectorAll(this.linkSelector_ || 'a');
  }

  resolveUnknownLinks_(unknownLinks) {
    // TODO: Throw if resolveUnknownLinks is not a function
    return this.domainResolver_.resolveUnknownLinks(unknownLinks);
  }

  getLinkAffiliateStatus_(link) {
    // TODO: Throw if getLinkAffiliateStatus is not a function
    return this.domainResolver_.getLinkAffiliateStatus(link);
  }
}
