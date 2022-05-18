import {mount} from 'enzyme';

import * as Preact from '#preact';

import {BentoMegaMenu} from '../component/BentoMegaMenu';

describes.sandboxed('BentoMegaMenu preact component v1.0', {}, (unusedEnv) => {
  it('should render empty', () => {
    const component = mount(<BentoMegaMenu />);

    expect(component.find('nav > ul')).to.have.lengthOf(1);
    expect(component.find('nav > ul > *')).to.have.lengthOf(0);
  });

  describe('rendering a simple menu', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = mount(
        <BentoMegaMenu>
          <BentoMegaMenu.Item>
            <BentoMegaMenu.Title>Title 1</BentoMegaMenu.Title>
            <BentoMegaMenu.Content>Content 1</BentoMegaMenu.Content>
          </BentoMegaMenu.Item>
          <BentoMegaMenu.Item>
            <BentoMegaMenu.Title>Title 2</BentoMegaMenu.Title>
            <BentoMegaMenu.Content>Content 2</BentoMegaMenu.Content>
          </BentoMegaMenu.Item>
          <BentoMegaMenu.Item>
            <BentoMegaMenu.Title>Title 3</BentoMegaMenu.Title>
            <BentoMegaMenu.Content>Content 3</BentoMegaMenu.Content>
          </BentoMegaMenu.Item>
        </BentoMegaMenu>
      );
    });
    function getTitles() {
      return wrapper.find(BentoMegaMenu.Title).find('span');
    }
    function getContents() {
      return wrapper.find(BentoMegaMenu.Content).find('div');
    }
    it('should render all the elements', () => {
      expect(wrapper.find(BentoMegaMenu.Item)).to.have.lengthOf(3);
      expect(wrapper.find(BentoMegaMenu.Title)).to.have.lengthOf(3);
      expect(wrapper.find(BentoMegaMenu.Content)).to.have.lengthOf(3);
      expect(getTitles()).to.have.lengthOf(3);
      expect(getContents()).to.have.lengthOf(3);
    });
    it('the contents should not be visible', () => {
      getContents().forEach((content) => {
        expect(content.getDOMNode()).not.to.have.class('open');
      });
    });

    describe('when clicking a menu item', () => {
      beforeEach(() => {
        getTitles().at(0).simulate('click');
      });
      it('the contents should be shown', () => {
        expect(getContents().at(0).getDOMNode()).to.have.class('open');
        expect(getContents().at(1).getDOMNode()).not.to.have.class('open');
        expect(getContents().at(2).getDOMNode()).not.to.have.class('open');
      });
      it('clicking the item again should hide the contents', () => {
        getTitles().at(0).simulate('click');
        expect(getContents().at(0).getDOMNode()).not.to.have.class('open');
        expect(getContents().at(1).getDOMNode()).not.to.have.class('open');
        expect(getContents().at(2).getDOMNode()).not.to.have.class('open');
      });
      it('clicking another item should show the new contents', () => {
        getTitles().at(1).simulate('click');
        expect(getContents().at(0).getDOMNode()).not.to.have.class('open');
        expect(getContents().at(1).getDOMNode()).to.have.class('open');
        expect(getContents().at(2).getDOMNode()).not.to.have.class('open');
      });
      it('clicking outside the menu should close the menu', () => {
        const target = document.body;
        target.dispatchEvent(new MouseEvent('click'));
        wrapper.update();

        expect(getContents().at(0).getDOMNode()).not.to.have.class('open');
        expect(getContents().at(1).getDOMNode()).not.to.have.class('open');
        expect(getContents().at(2).getDOMNode()).not.to.have.class('open');
      });
      it('clicking inside the menu should NOT close the menu', () => {
        const target = getContents().at(0).getDOMNode();
        target.dispatchEvent(new MouseEvent('click'));
        wrapper.update();

        expect(getContents().at(0).getDOMNode()).to.have.class('open');
        expect(getContents().at(1).getDOMNode()).not.to.have.class('open');
        expect(getContents().at(2).getDOMNode()).not.to.have.class('open');
      });
    });
  });
});
