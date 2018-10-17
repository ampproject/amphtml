import { h, render, Component } from 'preact';

class ProxyForm extends Component {

  constructor() {
    super();
    this.setState({
      proxyInput: ''
    });
  }

  handleProxyInputChange(event) {
    this.setState({
      ...this.state,
      proxyInput: event.target.value
    });
  }
  
  handleSubmit(event) {
    event.preventDefault();

    const suffix = this.state.proxyInput.replace(/^http(s?):\/\//i, '');
    const redirectUrl = '/proxy/s/' + suffix;

    window.location = redirectUrl;
  }

  render() {
    return (
      <div class="block proxy-form-container">
        <form id="proxy-form" onSubmit={(event) => this.handleSubmit(event)}>
          <label for="proxy-input">
            <span>Load URL by Proxy</span>
            {/* 
                Following regex is gnarly, but works. 
                Taken from https://justmarkup.com/log/2012/12/input-url/
            */}
            <input type="text" class="text-input" id="proxy-input"
              required aria-required="true"
              placeholder="https://"
              value={this.state.proxyInput} 
              onChange={(event) => this.handleProxyInputChange(event)}
              pattern="^(https?://)?([a-zA-Z0-9]([a-zA-ZäöüÄÖÜ0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$" />
            </label>
            <div class="form-info">
              <a href="https://github.com/ampproject/amphtml/blob/master/contributing/TESTING.md#document-proxy">
                What's this?
              </a>
            </div>
          </form>
        </div>
    );
  }
}


render(<ProxyForm />, document.getElementById('proxy-form-root'));
