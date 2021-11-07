import {clearOurFragment} from '../../addthis-utils/fragment';

describes.sandboxed('fragment', {}, () => {
  it('clears AddThis fragments from an url', () => {
    let url =
      'http://www.example.com/2012-07-25?utm_campaign=linkedin-Share-Web#at_pco=cfd-1.0';
    expect(clearOurFragment(url)).to.equal(
      'http://www.example.com/2012-07-25?utm_campaign=linkedin-Share-Web'
    );

    url = 'http://www.addthis.com/#.WNU1xGHp7QE.facebook;text';
    expect(clearOurFragment(url)).to.equal('http://www.addthis.com/');

    url = 'http://www.addthis.com/#.WNU1xGHp7QE.facebook';
    expect(clearOurFragment(url)).to.equal('http://www.addthis.com/');

    url = 'http://www.addthis.com/#.WNU1xGHp7QE;text';
    expect(clearOurFragment(url)).to.equal('http://www.addthis.com/');

    url = 'http://www.addthis.com/#.WNU1xGHp7QE';
    expect(clearOurFragment(url)).to.equal('http://www.addthis.com/');
  });

  it('does not clear a fragment that does not belong to AddThis', () => {
    let url = 'http://www.addthis.com/#top';
    expect(clearOurFragment(url)).to.equal('http://www.addthis.com/#top');

    url = 'http://www.addthis.com/hello';
    expect(clearOurFragment(url)).to.equal('http://www.addthis.com/hello');
  });
});
