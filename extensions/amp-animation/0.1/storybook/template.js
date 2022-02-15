import * as Preact from '#preact';

export const FILL_OPTIONS = {
  none: 'none',
  forwards: 'forwards',
  backwards: 'backwards',
  both: 'both',
};

export const DIRECTION_OPTIONS = {
  normal: 'normal',
  reverse: 'reverse',
  alternate: 'alternate',
  'alternate-reverse': 'alternate-reverse',
};

const CONTAINER_STYLE = {
  position: 'relative',
  width: '300px',
  height: '300px',
  background: '#EEE',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const INFO_STYLE = {
  background: '#DDD',
  fontSize: 'x-small',
  margin: 0,
  position: 'absolute',
  top: 0,
  height: '100%',
  right: '-310px',
  width: '300px',
  overflow: 'auto',
};

export const animationFillArgType = {
  name: 'fill',
  options: FILL_OPTIONS,
  control: {type: 'select'},
  defaultValue: 'both',
};

export const animationDirectionArgType = {
  name: 'duration',
  options: DIRECTION_OPTIONS,
  control: {type: 'select'},
  defaultValue: 'alternate',
};

/**
 * @param {!Object} props
 * @return {!Object}
 */
export function AnimationTemplate(props) {
  const {children, spec} = props;
  return (
    <main>
      <amp-animation id="anim1" layout="nodisplay">
        <script
          type="application/json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(spec)}}
        />
      </amp-animation>

      <div class="buttons" style={{marginBottom: '8px'}}>
        <button on="tap:anim1.start">Start</button>
        <button on="tap:anim1.restart">Restart</button>
        <button on="tap:anim1.togglePause">Toggle Pause</button>
        <button on="tap:anim1.seekTo(percent=0.5)">Seek to 50%</button>
        <button on="tap:anim1.reverse">Reverse</button>
        <button on="tap:anim1.finish">Finish</button>
        <button on="tap:anim1.cancel">Cancel</button>
      </div>
      <div style={CONTAINER_STYLE}>
        <pre style={INFO_STYLE}>{JSON.stringify(spec, null, 2)}</pre>

        {children}
      </div>
    </main>
  );
}
