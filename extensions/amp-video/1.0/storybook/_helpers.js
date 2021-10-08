import * as Preact from '#preact';

export const VideoElementWithActions = ({
  id,
  children,
  actions = ['play', 'pause', 'mute', 'unmute', 'fullscreen'],
}) => (
  <div style="max-width: 800px">
    <p style={{display: 'flex'}}>
      {actions.map((action) => (
        <button style={{flex: 1, margin: '0 4px'}} on={`tap:${id}.${action}`}>
          {action}
        </button>
      ))}
    </p>
    {children}
  </div>
);
