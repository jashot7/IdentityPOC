import React, { Component } from 'react';
import './Button.css';

class Button extends Component {

  constructor(props) {
    super(props);
    this.state = {
      onOnClick: () => console.log('this is a function'),
      ...props
    };
  }

  render() {
    return (
      <button className='generate-button' onClick={() => this.handleClick()}>{this.props.children}</button>
    )
  }

  handleClick() {
    this.state.callback();
  }

}

export default Button;