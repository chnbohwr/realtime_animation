import React, { Component } from 'react';
import firebase from 'firebase';
import 'firebase/firestore';
import config from '../../firebase/env';

export default class Main extends Component {
  state = {
    balls: []
  }
  componentDidMount() {
    firebase.initializeApp(config);
    this.database = firebase.firestore();
    const ballCollection = this.database.collection('ball');
    ballCollection.onSnapshot(d => this.setState({ balls: d.docs }));
  }

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <h2>Hello, I`m ReactMaker.</h2>
        <p>To get started, edit containers/index.js</p>
        {this.state.balls.map(ball =>
          <div key={ball.id}>{JSON.stringify(ball.data())}</div>)
        }
      </div>
    );
  }
}
