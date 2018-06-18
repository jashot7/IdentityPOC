import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Button from './components/Button';


class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Identity Proof of Concept</h1>
        </header>
        <p className="App-intro">
          Your identity shall be secured: <span className='randomPhrase'>{this.test()}</span>
        </p>
      </div>
    );
  }
  test() {
    const phrase = window.jason.generateRandomPhrase();

    return phrase;
  }
}

export default App;
