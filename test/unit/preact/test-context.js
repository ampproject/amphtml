import {mount} from 'enzyme';

import * as Preact from '#preact';
import {WithAmpContext, useAmpContext, useLoading} from '#preact/context';

describes.sandboxed('preact/context', {}, () => {
  function Component(props) {
    const context = useAmpContext();
    const loading = useLoading(props.loading);
    return <ContextReader {...context} computedLoading={loading} />;
  }

  function ContextReader() {
    return <div />;
  }

  it('should use default values', () => {
    const wrapper = mount(
      <WithAmpContext>
        <Component />
      </WithAmpContext>
    );
    expect(wrapper.find(ContextReader).props()).to.contain({
      renderable: true,
      playable: true,
      loading: 'auto',
      computedLoading: 'auto',
    });
  });

  it('should override renderable', () => {
    const wrapper = mount(
      <WithAmpContext renderable={false}>
        <Component />
      </WithAmpContext>
    );
    expect(wrapper.find(ContextReader).props()).to.contain({
      renderable: false,
      playable: false,
      loading: 'lazy',
      computedLoading: 'lazy',
    });
  });

  it('should override playable', () => {
    const wrapper = mount(
      <WithAmpContext playable={false}>
        <Component />
      </WithAmpContext>
    );
    expect(wrapper.find(ContextReader).props()).to.contain({
      renderable: true,
      playable: false,
      loading: 'auto',
      computedLoading: 'auto',
    });
  });

  it('should override loading=lazy', () => {
    const wrapper = mount(
      <WithAmpContext loading={'lazy'}>
        <Component />
      </WithAmpContext>
    );
    expect(wrapper.find(ContextReader).props()).to.contain({
      renderable: true,
      playable: true,
      loading: 'lazy',
      computedLoading: 'lazy',
    });
  });

  it('should override loading=eager', () => {
    const wrapper = mount(
      <WithAmpContext loading={'eager'}>
        <Component />
      </WithAmpContext>
    );
    expect(wrapper.find(ContextReader).props()).to.contain({
      renderable: true,
      playable: true,
      loading: 'eager',
      computedLoading: 'eager',
    });
  });

  it('should override prop.loading', () => {
    const wrapper = mount(
      <WithAmpContext loading={'eager'}>
        <Component loading={'unload'} />
      </WithAmpContext>
    );
    expect(wrapper.find(ContextReader).props()).to.contain({
      renderable: true,
      playable: true,
      loading: 'eager',
      computedLoading: 'unload',
    });
  });

  it('should keep in load mode when started', () => {
    const wrapper = mount(
      <WithAmpContext>
        <Component />
      </WithAmpContext>
    );
    expect(wrapper.find(ContextReader).props()).to.contain({
      loading: 'auto',
      computedLoading: 'auto',
    });

    wrapper.setProps({loading: 'lazy'});
    expect(wrapper.find(ContextReader).props()).to.contain({
      loading: 'lazy',
      computedLoading: 'lazy',
    });
  });

  it('should cancel load on unload even when started', () => {
    const wrapper = mount(
      <WithAmpContext>
        <Component />
      </WithAmpContext>
    );
    expect(wrapper.find(ContextReader).props()).to.contain({
      loading: 'auto',
      computedLoading: 'auto',
    });

    wrapper.setProps({loading: 'unload'});
    expect(wrapper.find(ContextReader).props()).to.contain({
      loading: 'unload',
      computedLoading: 'unload',
    });
  });
});
