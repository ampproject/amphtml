import {referrers_} from '../amp-dynamic-css-classes';

describes.sandboxed('amp-dynamic-css-classes', {}, () => {
  describe('referrers_', () => {
    describe('when referrer is TLD-less', () => {
      const referrer = 'localhost';

      it('contains the domain', () => {
        expect(referrers_(referrer)).to.deep.equal(['localhost']);
      });
    });

    describe('when referrer has no subdomains', () => {
      const referrer = 'google.com';
      const referrers = referrers_(referrer);

      it('contains the TLD', () => {
        expect(referrers).to.contain('com');
      });

      it('contains the domain', () => {
        expect(referrers).to.contain('google.com');
        expect(referrers.length).to.equal(2);
      });
    });

    describe('when referrer has subdomains', () => {
      const referrer = 'a.b.c.google.com';
      const referrers = referrers_(referrer);

      it('contains the TLD', () => {
        expect(referrers).to.contain('com');
      });

      it('contains the domain', () => {
        expect(referrers).to.contain('google.com');
      });

      it('contains each subdomain', () => {
        expect(referrers).to.include.members([
          'c.google.com',
          'b.c.google.com',
          'a.b.c.google.com',
        ]);
        expect(referrers.length).to.equal(5);
      });
    });
  });
});
