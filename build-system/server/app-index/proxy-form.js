/* eslint-disable local/html-template */

const {htmlEnvelopePrefixKey} = require('./settings');
const {html} = require('./html');

module.exports = ({htmlEnvelopePrefix}) => html`
  <form id="proxy-form" action="/proxy" target="_top">
    <div class="proxy-form-content">
      <input
        type="text"
        class="text-input"
        id="proxy-input"
        name="url"
        required
        aria-required="true"
        placeholder="https://"
        pattern="^(https?://)?[^\\s]+$"
      />
      <input
        type="hidden"
        name="mode"
        value="${htmlEnvelopePrefix}"
        [value]="${htmlEnvelopePrefixKey}"
      />
      <button type="submit">Load URL by Proxy</button>
    </div>
    <div class="form-info">
      <span>This proxy takes canonical, AMPHTML and Google viewer URLs.</span>
      <a
        href="https://github.com/ampproject/amphtml/blob/main/docs/testing.md#document-proxy"
        target="_blank"
      >
        What's this?
      </a>
    </div>
  </form>
`;
