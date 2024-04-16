/* eslint-disable local/html-template */
const documentModes = require('./document-modes');
const {AmpState, ampStateKey} = require('./amphtml-helpers');
const {html, joinFragments} = require('./html');

const jsModes = [
  {
    value: 'default',
    description: `Unminified AMP JavaScript is served from the local server. For
    local development you will usually want to serve unminified JS to test your
    changes.`,
  },
  {
    value: 'minified',
    description: html`
      Minified AMP JavaScript is served from the local server. This is only
      available after running <code>amp dist --fortesting</code>
    `,
  },
  {
    value: 'cdn',
    description: 'Minified AMP JavaScript is served from the AMP Project CDN.',
  },
];

const stateId = 'settings';

const htmlEnvelopePrefixStateKey = 'htmlEnvelopePrefix';
const jsModeStateKey = 'jsMode';
const panelStateKey = 'panel';

const htmlEnvelopePrefixKey = ampStateKey(stateId, htmlEnvelopePrefixStateKey);
const panelKey = ampStateKey(stateId, panelStateKey);

const PanelSelectorButton = ({expression, type, value}) => html`
  <button
    class="settings-panel-button"
    [class]="'settings-panel-button' + (${panelKey} != '${type}' ? '' : ' open')"
    data-type="${type}"
    tabindex="0"
    on="tap: AMP.setState({
        ${stateId}: {
          ${panelStateKey}: (${panelKey} != '${type}' ? '${type}' : null),
        }
      })"
  >
    <span>${type}</span> <strong [text]="${expression}">${value}</strong>
  </button>
`;

/**
 * @param {{
 *   children: string[],
 *   compact?: boolean,
 *   key: string,
 *   name?: null | string,
 * }} param0
 * @return {string}
 */
const PanelSelector = ({children, compact = false, key, name = null}) => html`
  <amp-selector
    layout="container"
    name="${name || key}"
    class="${compact ? 'compact ' : ''}"
    on="select: AMP.setState({
      ${stateId}: {
        ${panelStateKey}: null,
        ${key}: event.targetOption,
      }
    })"
  >
    ${joinFragments(children)}
  </amp-selector>
`;

const PanelSelectorBlock = ({children, id, selected, value}) => html`
  <div
    class="selector-block"
    ${selected ? ' selected' : ''}
    id="${id}"
    option="${value}"
  >
    <div class="check-icon icon"></div>
    ${children}
  </div>
`;

const HtmlEnvelopeSelector = ({htmlEnvelopePrefix}) =>
  PanelSelector({
    compact: true,
    key: htmlEnvelopePrefixStateKey,
    children: Object.entries(documentModes).map(([prefix, name]) =>
      PanelSelectorBlock({
        id: `select-html-mode-${name}`,
        value: prefix,
        selected: htmlEnvelopePrefix === prefix,
        children: html`<strong>${name}</strong>`,
      })
    ),
  });

const JsModeSelector = ({jsMode}) =>
  PanelSelector({
    key: jsModeStateKey,
    name: 'mode',
    children: jsModes.map(({description, value}) =>
      PanelSelectorBlock({
        id: `serve-mode-${value}`,
        value,
        selected: jsMode === value,
        children: html`
          <strong>${value}</strong>
          <p>${description}</p>
        `,
      })
    ),
  });

const SettingsPanelButtons = ({htmlEnvelopePrefix, jsMode}) => html`
  <div style="flex: 1">
    <div class="settings-panel-button-container">
      ${PanelSelectorButton({
        type: 'HTML',
        expression: `${stateId}.documentModes[${htmlEnvelopePrefixKey}]`,
        value: documentModes[htmlEnvelopePrefix],
      })}
      ${PanelSelectorButton({
        type: 'JS',
        expression: `${stateId}.${jsModeStateKey}`,
        value: jsMode,
      })}
    </div>
    ${SettingsPanel({htmlEnvelopePrefix, jsMode})}
  </div>
`;

const SettingsSubpanel = ({children, type}) => html`
  <div hidden [hidden]="${panelKey} != '${type}'">${children}</div>
`;

const SettingsPanel = ({htmlEnvelopePrefix, jsMode}) => html`
  <div class="settings-panel" hidden [hidden]="${panelKey} == null">
    ${AmpState(stateId, {
      documentModes,
      [panelStateKey]: null,
      [htmlEnvelopePrefixStateKey]: htmlEnvelopePrefix,
      [jsModeStateKey]: jsMode,
    })}
    ${SettingsSubpanel({
      type: 'HTML',
      children: html`
        <h4>Select an envelope to serve HTML documents.</h4>
        ${HtmlEnvelopeSelector({htmlEnvelopePrefix})}
      `,
    })}
    ${SettingsSubpanel({
      type: 'JS',
      children: html`
        <h4>Select the JavaScript binaries to use in served documents.</h4>
        <form
          action="/serve_mode_change"
          action-xhr="/serve_mode_change"
          target="_blank"
          id="serve-mode-form"
        >
          ${JsModeSelector({jsMode})}
        </form>
      `,
    })}
  </div>
`;

module.exports = {
  SettingsPanel,
  SettingsPanelButtons,
  htmlEnvelopePrefixKey,
};
