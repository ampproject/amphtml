import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

const formulas = {
  quadratic: '\\[x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.\\]',
  cauchy: '\\[f(a) = \\frac{1}{2\\pi i} \\oint\\frac{f(z)}{z-a}dz\\]',
  doubleAngle: '\\[cos(θ+φ)=\\cos(θ)\\cos(φ)−\\sin(θ)\\sin(φ)\\]',
};

export default {
  title: 'amp-mathml-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-mathml', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    formulas,
  },
};

export const Default = (args) => {
  return (
    <>
      <p>Should not render formulas (because they're all onscreen)</p>
      <TestDemo {...args}></TestDemo>
      <TestDemoInline {...args}></TestDemoInline>
    </>
  );
};

function TestDemo({formulas, withScroll, ...args}) {
  const {cauchy, doubleAngle, quadratic} = formulas;
  return (
    <>
      <h2>The Quadratic Formula</h2>
      <amp-mathml data-formula={quadratic} {...args}></amp-mathml>

      <h2>Cauchy's Integral Formula</h2>
      <amp-mathml data-formula={cauchy} {...args}></amp-mathml>

      {withScroll ? (
        <div style={{height: 1000, border: '1px solid black'}}>
          long stuff to create scroll
        </div>
      ) : null}

      <h2>Double angle formula for Cosines</h2>
      <amp-mathml data-formula={doubleAngle} {...args}></amp-mathml>
    </>
  );
}

function TestDemoInline({formulas, ...args}) {
  const {quadratic} = formulas;
  return (
    <>
      <h2>Inline formula</h2>
      <p>
        This is an example of a formula of{' '}
        <amp-mathml
          height="13"
          width="9"
          inline
          data-formula={'`x`'}
          {...args}
        ></amp-mathml>
        ,{' '}
        <amp-mathml
          height="47"
          width="146"
          inline
          data-formula={quadratic}
          {...args}
        ></amp-mathml>{' '}
        placed inline in the middle of a block of text.{' '}
        <amp-mathml
          height="19"
          width="71"
          inline
          data-formula={'\\( \\cos(θ+φ) \\)'}
          {...args}
        ></amp-mathml>{' '}
        This shows how the formula will fit inside a block of text and can be
        styled with CSS.
      </p>
    </>
  );
}
