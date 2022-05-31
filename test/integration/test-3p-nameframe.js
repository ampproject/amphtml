describes.sandboxed.skip('alt nameframe', {}, function () {
  describes.sandboxed('alt nameframe', {}, () => {
    describes.realWin('nameframe', {allowExternalResources: true}, (env) => {
      let fixture;
      let win;
      let doc;
      let iframe;
      beforeEach(() => {
        fixture = env;
        win = fixture.win;
        doc = win.document;
        iframe = doc.createElement('iframe');
        iframe.src = 'http://localhost:9876/dist.3p/current/nameframe.max.html';
      });

      it('should load remote nameframe and succeed w/ valid JSON', () => {
        let messageContent;
        iframe.name = JSON.stringify({
          creative: `<html>
                    <body>
                      <script>
                        window.parent.postMessage(
                                {type: 'creative rendered'}, '*');
                      </script>
                    </body>
                    </html>`,
        });
        doc.body.appendChild(iframe);
        return new Promise((resolve) => {
          win.addEventListener('message', (content) => {
            messageContent = content;
            resolve();
          });
        }).then(() => {
          expect(messageContent.data.type).to.equal('creative rendered');
        });
      });

      it('should fail if JSON is not paresable', (done) => {
        iframe.name = 'not valid JSON';
        expectNoContent(win, done);
        doc.body.appendChild(iframe);
      });

      it('should fail if JSON is valid, but missing creative field', (done) => {
        iframe.name = JSON.stringify({fnord: 'some meaningless data'});
        expectNoContent(win, done);
        doc.body.appendChild(iframe);
      });

      it('should fail if JSON is missing altogether', (done) => {
        iframe.name = null;
        expectNoContent(win, done);
        doc.body.appendChild(iframe);
      });
    });
  });
});

function expectNoContent(win, done) {
  win.addEventListener('message', (content) => {
    expect(content.data).to.have.property('type');
    expect(content.data.type).to.equal('no-content');
    done();
  });
}
