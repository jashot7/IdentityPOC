import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
// import './lib/bip39/src/js/polyfill.es6';
// import './lib/bip39/src/js/basex';
// import './lib/bip39/src/js/jquery-3.2.1';
// import './lib/bip39/src/js/index';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Identity Proof of Concept</h1>
        </header>
        <p className="App-intro">
          This is where it begins. {this.test()}!
        </p>
      </div>
    );
  }
  test() {
    var phrase = "cats";
    // var phrase = window.index.generateRandomPhrase();
    // var phrase = window.generateRandomPhrase();
    // window.jason.

    return phrase;
  }
}

export default App;
