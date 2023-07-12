import * as Preact from '#preact';

import {BentoMathml} from '../component';

import '../component.jss';

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

function TestDemo({formulas, ...args}) {
  const {cauchy, doubleAngle, quadratic} = formulas;
  return (
    <>
      <h2>The Quadratic Formula</h2>
      <BentoMathml
        style={{height: 40}}
        formula={quadratic}
        {...args}
      ></BentoMathml>

      <h2>Cauchy's Integral Formula</h2>
      <BentoMathml
        style={{height: 40}}
        formula={cauchy}
        {...args}
      ></BentoMathml>

      <h2>Double angle formula for Cosines</h2>
      <BentoMathml
        style={{height: 23}}
        formula={doubleAngle}
        {...args}
      ></BentoMathml>
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
        <BentoMathml
          style={{height: 13, width: 9}}
          inline
          formula={'`x`'}
          {...args}
        ></BentoMathml>
        ,{' '}
        <BentoMathml
          style={{height: 47, width: 146}}
          inline
          formula={quadratic}
          {...args}
        ></BentoMathml>{' '}
        placed inline in the middle of a block of text.{' '}
        <BentoMathml
          style={{height: 19, width: 71}}
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
