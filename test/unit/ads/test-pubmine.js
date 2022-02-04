import {pubmine} from '#ads/vendors/pubmine';

describes.fakeWin('pubmine', {}, (env) => {
  let win;
  const mockData = {
    siteid: '12345',
    blogid: '23456',
    section: 1,
    pt: 2,
    ht: 2,
  };

  function getPubmineScriptElement() {
    return win.document.querySelector(
      'script[src="https://s.pubmine.com/head.js"]'
    );
  }

  function getSlotElement() {
    return win.document.querySelector('#atatags-123451');
  }

  beforeEach(() => {
    win = env.win;
    win.document.body.innerHTML = '<div id="c"></div>';
  });

  it('should set pubmine publisher config on global if loader in a master frame', () => {
    win.context = {
      isMaster: true,
    };
    const expectedConfig = {
      pt: 2,
      ht: 2,
      tn: 'amp',
      amp: true,
      consent: 0,
      siteid: 12345,
      blogid: 23456,
    };
    pubmine(win, mockData);
    expect(win.__ATA_PP).to.deep.equal(expectedConfig);
    expect(win.__ATA.cmd).to.be.an('array');
    expect(win.__ATA.cmd).to.have.length(1);
    expect(getPubmineScriptElement()).to.be.ok;
    expect(getSlotElement()).to.be.ok;
  });

  it('should add a command and not to load the script if loaded in a slave frame', () => {
    win.__ATA = {
      cmd: [],
    };
    win.context = {
      isMaster: false,
      master: win,
    };
    pubmine(win, mockData);
    expect(win.context.master.__ATA.cmd).to.have.length(1);
    expect(getPubmineScriptElement()).to.be.null;
    expect(getSlotElement()).to.be.ok;
  });
});
