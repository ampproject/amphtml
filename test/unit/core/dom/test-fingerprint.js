import {DomFingerprint, domFingerprintPlain} from '#core/dom/fingerprint';

describes.realWin('DOM - fingerprint', {}, (env) => {
  let body;
  let div1;
  let ampAd;

  beforeEach(() => {
    const doc = env.win.document;
    // Start with empty body.
    body = doc.body;
    body.textContent = '';
    div1 = doc.createElement('div');
    div1.id = 'id1';
    div1.innerHTML = `<div id='id2'>
         <table>                <!-- table:0 -->
           <tr>                 <!-- tr:0 -->
             <td></td>          <!-- td:0 -->
             <td>               <!-- td:1 -->
               <amp-ad type="adsense"></amp-ad>
             </td>
           </tr>
           <tr></tr>            <!-- tr:1 -->
         </table>
      </div>`;

    body.appendChild(div1);
    ampAd = doc.getElementsByTagName('amp-ad')[0];
  });

  it('should map a sample DOM structure to the right string', () => {
    expect(domFingerprintPlain(ampAd)).to.equal(
      'amp-ad.0,td.1,tr.0,tbody.0,table.0,div/id2.0,div/id1.0,body.0,html.0'
    );
  });

  it('should map a sample DOM structure to the right hashed value', () => {
    expect(DomFingerprint.generate(ampAd)).to.equal('2437661740');
  });
});
