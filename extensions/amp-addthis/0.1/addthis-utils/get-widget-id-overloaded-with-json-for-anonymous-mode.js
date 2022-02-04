const overrideKeys = [
  'backgroundColor',
  'borderRadius',
  'counterColor',
  'counts',
  'countsFontSize',
  'desktopPosition',
  'elements',
  'hideDevice',
  'hideEmailSharingConfirmation',
  'hideLabel',
  'iconColor',
  'label',
  'mobilePosition',
  'numPreferredServices',
  'offset',
  'originalServices',
  'postShareFollowMsg',
  'postShareRecommendedMsg',
  'postShareTitle',
  'responsive',
  'shareCountThreshold',
  'size',
  'style',
  'textColor',
  'thankyou',
  'titleFontSize',
  '__hideOnHomepage',
  'originalServices',
  'services',
];

/**
 * Get Widget ID Overloaded With JSON For Anonymous Mode
 * If no argument or self doesnt have element.getAttribute, returns empty string
 * For each existing attribute: `data-attr-NAME`, check and add value for key
 * If object is not empty, return only the JSON of the override object
 * If an error happens return empty string
 * @param {AMP.BaseElement} self
 * @return {string} empty string means there is no override object
 */
export function getWidgetOverload(self) {
  const override = {};
  overrideKeys.forEach((item) => {
    const data = self.element.getAttribute(`data-attr-${item}`);
    if (
      typeof data === 'string' ||
      typeof data === 'number' ||
      typeof data === 'boolean'
    ) {
      override[String(item)] = data;
    }
  });
  const overrideString = JSON.stringify(override);
  return overrideString === '{}' ? '' : overrideString;
}
