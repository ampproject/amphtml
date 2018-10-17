import { h, render, Component } from 'preact';

class Clock extends Component {
    render() {
        let time = new Date().toLocaleTimeString();
        return <span>{ time }</span>;
    }
}

// render an instance of Clock into <body>:
render(<Clock />, document.getElementById('proxy-form-root'));
