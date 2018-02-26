import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MatchThree from './game/MatchThree';
class App extends Component {
  render() {
    MatchThree();
    return (
      <div id="myCanvas">

      </div>
    );
  }
}

export default App;
