import {pubcode} from './constants';

const helpersFactory = env => {
  const {win} = env;

  return {
    createAnchor(href) {
      const anchor = win.document.createElement('a');
      anchor.href = href;

      return anchor;
    },

    createStubXhr(data) {
      const response = {
        json: () => { return Promise.resolve(data); },
      };

      return {
        fetchJson: env.sandbox.stub().returns(Promise.resolve(response)),
      };
    },

    createGetTrackingInfoStub(data) {
      return () => {
        return Object.assign({
          pubcode,
          // https://github.com/ampproject/amphtml/blob/master/spec/amp-var-substitutions.md
          referrer: 'referrer',
          externalReferrer: 'external_referrer',
          timezone: 'timezone',
          pageImpressionId: 'page_impression_id',
          customTrackingId: null,
          guid: 'user_guid',
        }, data);
      };
    },
  };
};

export default helpersFactory;