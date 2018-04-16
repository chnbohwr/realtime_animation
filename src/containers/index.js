import React, { Component } from 'react';
import firebase from 'firebase';
import 'firebase/firestore';
import config from '../../firebase/env';
import rgbHex from 'rgb-hex';

const rc = () => (Math.floor(Math.random() * 50) + 140);

export default class Main extends Component {
  state = {
    balls: [],
    users: [],
  }

  componentDidMount() {
    window.firebase = firebase;
    firebase.initializeApp(config);
    this.database = firebase.firestore();
    this.ballCollection = this.database.collection('ball');
    this.ballCollection.onSnapshot(d => this.setState({ balls: d.docs }));
  }

  addBall = () => {
    const ball = {
      cx: Math.floor(Math.random() * 500),
      cy: Math.floor(Math.random() * 500),
      r: Math.floor(Math.random() * 40) + 10,
      fill: `#${rgbHex(rc(), rc(), rc())}`
    };
    console.log(ball)
    this.ballCollection.add(ball);
  }

  removeBall = (ball) => {
    this.ballCollection.doc(ball.id).delete();
  }

  renderBall = (ball) => {
    const data = ball.data();
    return <circle onClick={()=>{this.removeBall(ball)}} key={data.id} cx={data.cx} cy={data.cy} r={data.r} fill={data.fill} />
  }

  render() {
    return (
      <div>
        <button onClick={this.addBall}>add ball</button>
        <svg width="500" height="500">
          {
            this.state.balls.map(this.renderBall)
          }
        </svg>
      </div>
    );
  }
}
