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
    scores: [],
  }

  componentDidMount() {
    window.firebase = firebase;
    firebase.initializeApp(config);
    this.database = firebase.firestore();
    this.ballCollection = this.database.collection('ball');
    this.ballCollection.onSnapshot(this.ballChange);
    firebase.auth().onAuthStateChanged(this.authChange);
    this.scoreCollection = this.database.collection('score');
    this.scoreCollection.orderBy('score').limit(10).onSnapshot(this.scoreChange);
  }

  ballChange = d => this.setState({ balls: d.docs })

  scoreChange = d => this.setState({ scores: d.docs })

  authChange = async (user) => {
    if (!user) {
      this.setState({ user: {} });
    } else {
      const doc = await this.scoreCollection.doc(user.uid).get();
      if (doc.exists) {
        user.score = doc.data().score;
      } else {
        user.score = 0;
      }
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
    if (!this.state.user.uid) {
      return;
    }
    this.ballCollection.doc(ball.id).delete();
    const data = ball.data();
    const score = Math.floor(40 / data.r + 1) + 1 + this.state.user.score;
    this.setState({ user: { ...this.state.user, score: score } })
    this.scoreCollection.doc(this.state.user.uid).set({
      uid: this.state.user.uid,
      displayName: this.state.user.displayName,
      photoURL: this.state.user.photoURL,
      score,
    });
    this.addBall();
  }

  renderBall = (ball) => {
    const data = ball.data();
    return <circle onClick={() => { this.removeBall(ball); }} key={ball.id} cx={data.cx} cy={data.cy} r={data.r} fill={data.fill} />
  }

  renderTopScore = (score) => {
    const data = score.data();
    return (<div key={score.id}><img src={data.photoURL} /><span>{data.displayName} : {data.score}</span></div>);
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
        {
          this.state.user.uid ?
            <Styled.BtnLogin onClick={this.logout}>Logout {this.state.user.displayName}</Styled.BtnLogin> :
            <Styled.BtnLogin onClick={this.loginFB}>Connect with Facebook</Styled.BtnLogin>
        }
        <p>score: {this.state.user.score}</p>
        <svg width="500" height="500">
          {
            this.state.balls.map(this.renderBall)
          }
        </svg>
        <div>
          {
            this.state.scores.map(this.renderTopScore)
          }
        </div>
      </Styled.ContainerView>
    );
  }
}
