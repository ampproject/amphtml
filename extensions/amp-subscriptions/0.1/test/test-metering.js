import {Metering} from '../metering';

describes.fakeWin('Metering', {amp: true}, () => {
  /** @type {!Metering} */
  let metering;

  beforeEach(() => {
    const platformKey = 'subscribe.google.com';

    metering = new Metering({
      platformKey,
    });
  });

  describe('saveMeteringState', () => {
    it('saves state', async () => {
      const newMeteringState = {new: true};

      await metering.saveMeteringState(newMeteringState);
      const savedMeteringState = await metering.loadMeteringState();

      expect(savedMeteringState).to.deep.equal(newMeteringState);
    });

    it('resets flag', async () => {
      metering.entitlementsWereFetchedWithCurrentMeteringState = true;

      await metering.saveMeteringState({new: true});

      expect(metering.entitlementsWereFetchedWithCurrentMeteringState).to.be
        .false;
    });
  });

  describe('loadMeteringState', () => {
    it('loads state', async () => {
      const newMeteringState = {new: true};

      await metering.saveMeteringState(newMeteringState);
      const savedMeteringState = await metering.loadMeteringState();

      expect(savedMeteringState).to.deep.equal(newMeteringState);
    });

    it('returns null if state is not defined', async () => {
      const meteringState = await metering.loadMeteringState();

      expect(meteringState).to.equal(null);
    });
  });
});
