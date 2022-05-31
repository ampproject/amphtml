import {FormSubmitService} from '../form-submit-service';

describes.sandboxed('form-submit-service', {}, (env) => {
  let submitService;

  beforeEach(() => {
    submitService = new FormSubmitService();
  });

  it('firing without callbacks should not break', () => {
    expect(() => submitService.fire()).not.to.throw();
  });

  it('should register & fire one callback', () => {
    const cb = env.sandbox.spy();
    submitService.beforeSubmit(cb);

    const fakeFormEl = {};
    submitService.fire(fakeFormEl);

    expect(cb.calledOnce).to.be.true;
    expect(cb).calledWith(fakeFormEl);
  });

  it('should register & fire many callbacks', () => {
    const cb = env.sandbox.spy();
    submitService.beforeSubmit(cb);
    submitService.beforeSubmit(cb);
    submitService.beforeSubmit(cb);

    const fakeFormEl = {};
    submitService.fire(fakeFormEl);

    expect(cb.calledThrice).to.be.true;
    expect(cb).calledWith(fakeFormEl);
  });
});
