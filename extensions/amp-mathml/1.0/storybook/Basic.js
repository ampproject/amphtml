import * as Preact from '#preact';

import {BentoMathml} from '../component';

const formulas = {
  quadratic: '\\[x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}.\\]',
  cauchy: '\\[f(a) = \\frac{1}{2\\pi i} \\oint\\frac{f(z)}{z-a}dz\\]',
  doubleAngle: '\\[cos(θ+φ)=\\cos(θ)\\cos(φ)−\\sin(θ)\\sin(φ)\\]',
};

export default {
  title: 'Mathml',
  component: BentoMathml,
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

export const WithScroll = (args) => {
  return (
    <>
      <p>Should lazily render formula when formulas are offscreen</p>
      <TestDemo withScroll={true} {...args}></TestDemo>
      <TestDemoInline {...args}></TestDemoInline>
    </>
  );
};

export const WithCustomDimensions = (args) => {
  return (
    <>
      <p>
        Should render everything, using manual sizes for onscreen elements and
        dynamic resizing for offscreen elements
      </p>
      <TestDemo withScroll={true} style={{height: 40}} {...args}></TestDemo>
      <TestDemoInline {...args}></TestDemoInline>
    </>
  );
};

function TestDemo({formulas, withScroll, ...args}) {
  const {cauchy, doubleAngle, quadratic} = formulas;
  return (
    <>
      <h2>The Quadratic Formula</h2>
      <BentoMathml formula={quadratic} {...args}></BentoMathml>

      <h2>Cauchy's Integral Formula</h2>
      <BentoMathml formula={cauchy} {...args}></BentoMathml>

      {withScroll ? (
        <div style={{height: 1000, border: '1px solid black'}}>
          long stuff to create scroll
        </div>
      ) : null}

      <h2>Double angle formula for Cosines</h2>
      <BentoMathml formula={doubleAngle} {...args}></BentoMathml>
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
        <BentoMathml inline formula={'`x`'} {...args}></BentoMathml>,{' '}
        <BentoMathml inline formula={quadratic} {...args}></BentoMathml> placed
        inline in the middle of a block of text.{' '}
        <BentoMathml
          inline
          formula={'\\( \\cos(θ+φ) \\)'}
          {...args}
        ></BentoMathml>{' '}
        This shows how the formula will fit inside a block of text and can be
        styled with CSS.
      </p>
    </>
  );
}
