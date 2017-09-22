import { Meteor } from 'meteor/meteor';
import React from 'react';
import { NavLink } from 'react-router-dom';
import autobind from 'react-autobind';

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
    };

    autobind(this);
  }

  onSubmit(e) {
    e.preventDefault();

    const email = this.email.value.trim();
    const password = this.password.value.trim();

    Meteor.loginWithPassword({ email }, password, (err) => {
      if (err) {
        this.setState({ error: err.reason });
      }
    });
  }

  registerFb(e) {
    e.preventDefault();
    Meteor.loginWithFacebook({ requestPermissions: ['public_profile', 'email'] }, (err) => {
      if (err) {
        console.log('Handle errors here: ', err);
      }
    });
  }

  registerGoogle(e) {
    e.preventDefault();
    Meteor.loginWithGoogle({ requestPermissions: ['email'] }, (err) => {
      if (err) {
        console.log('Handle errors here: ', err);
      }
    });
  }

  render() {
    return (
      <div className="boxed-view">
        <div className="boxed-view__box">
          <h1>Login</h1>
          {this.state.error ? <p>{this.state.error}</p> : null}
          <form className="boxed-view__form" onSubmit={this.onSubmit}>
            <input
              type="email"
              ref={(email) => {
                this.email = email;
              }}
              name="email"
              placeholder="Email"
            />
            <input
              type="password"
              ref={(password) => {
                this.password = password;
              }}
              name="password"
              placeholder="Password"
            />
            <button className="button">Login</button>
            {/* <button onClick={this.registerFb} className="button button--fb">
              Login with Facebook
            </button> */}
            {/* <button onClick={this.registerGoogle} className="button button--gmail">
              Login with Gmail
            </button> */}
          </form>
          <NavLink to="/signup">or Signup Here</NavLink>
        </div>
      </div>
    );
  }
}
