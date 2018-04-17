import React, { Component } from 'react';
import firebase from 'firebase';
import 'firebase/firestore';
import rgbHex from 'rgb-hex';
import * as Styled from './style';
import config from '../../firebase/env';

const rc = () => (Math.floor(Math.random() * 50) + 140);

export default class Main extends Component {
  state = {
    balls: [],
    user: {},
  }
  componentDidMount() {
    window.firebase = firebase;
    firebase.initializeApp(config);
    this.database = firebase.firestore();
    this.ballCollection = this.database.collection('ball');
    this.ballCollection.onSnapshot(d => this.setState({ balls: d.docs }));
    firebase.auth().onAuthStateChanged(this.authChange);
  }

  authChange = (user) => {
    if (user === null) {
      this.setState({ user: {} });
    } else {
      this.setState({ user });
    }

  }

  addBall = () => {
    const r = Math.floor(Math.random() * 40) + 10;
    const cx = r + Math.floor(Math.random() * (500 - r));
    const cy = r + Math.floor(Math.random() * (500 - r));
    const fill = `#${rgbHex(rc(), rc(), rc())}`;
    const ball = {
      cx, cy, r, fill,
    };
    this.ballCollection.add(ball);
  }

  removeBall = (ball) => {
    this.ballCollection.doc(ball.id).delete();
  }

  renderBall = (ball) => {
    const data = ball.data();
    return <circle onClick={() => { this.removeBall(ball); }} key={ball.id} cx={data.cx} cy={data.cy} r={data.r} fill={data.fill} />
  }

  loginFB = () => {
    const provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider);
  }

  logout = () => {
    firebase.auth().signOut();
  }

  render() {
    return (
      <Styled.ContainerView>
        <button style={{ width: 50, height: 50 }} onClick={this.addBall}>add ball</button>
        {
          this.state.user.uid ?
            <Styled.BtnLogin onClick={this.logout}>Logout {this.state.user.displayName}</Styled.BtnLogin> :
            <Styled.BtnLogin onClick={this.loginFB}>Connect with Facebook</Styled.BtnLogin>
        }
        <svg width="500" height="500">
          {
            this.state.balls.map(this.renderBall)
          }
        </svg>
      </Styled.ContainerView>
    );
  }
}
