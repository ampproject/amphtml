import {ValidationBubble} from '../validation-bubble';

describes.realWin('validation-bubble', {amp: true}, (env) => {
  it('should append a dom element to the document', () => {
    const {ampdoc} = env;
    const document = ampdoc.getRootNode();

    new ValidationBubble(ampdoc);
    expect(document.querySelector('.i-amphtml-validation-bubble')).to.not.be
      .null;
  });

  it('should show and hide bubble', () => {
    const {ampdoc} = env;
    const document = ampdoc.getRootNode();

    const targetEl = document.createElement('div');
    targetEl.textContent = 'I am the target!';
    targetEl.style.position = 'absolute';
    targetEl.style.top = '300px';
    targetEl.style.left = '400px';
    targetEl.style.width = '200px';
    document.body.appendChild(targetEl);

    const bubble = new ValidationBubble(ampdoc);
    bubble.vsync_ = {
      run: (task, state) => {
        if (task.measure) {
          task.measure(state);
        }
        if (task.mutate) {
          task.mutate(state);
        }
      },
    };
    const bubbleEl = document.querySelector('.i-amphtml-validation-bubble');
    bubble.show(targetEl, 'Hello World');
    expect(bubbleEl).to.not.be.null;
    expect(bubbleEl.textContent).to.equal('Hello World');
    expect(bubbleEl.style.top).to.equal('290px');
    expect(bubbleEl.style.left).to.equal('500px');

    bubble.hide();
    expect(bubbleEl).to.have.display('none');
  });
});
