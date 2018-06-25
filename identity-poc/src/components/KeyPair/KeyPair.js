import React, { Component } from 'react';
import './KeyPair.css';

class KeyPair extends Component {

  constructor(props) {
    super(props);
    this.state = {
      label: 'No Label Provided',
      value: 'No Value Provided',
      ...props
    };
  }

  componentWillReceiveProps(newProps) {
    // It took me a while to realize this is necessary to update the state in a child component.
    this.setState(...this.state, newProps);
  }

  render() {
    return (
      <p className="key-pair">
        <span className='label'>{this.state.label}</span>
        <span className='value'>{this.state.value}</span>
      </p>
    )
  }

  handleClick() {
    this.state.callback();
  }

}

export default KeyPair;