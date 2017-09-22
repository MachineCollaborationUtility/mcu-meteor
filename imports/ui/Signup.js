import { Accounts } from 'meteor/accounts-base';
import React from 'react';
import { NavLink } from 'react-router-dom';
import autobind from 'react-autobind';

export default class Signup extends React.Component {
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

    Accounts.createUser({ email, password }, (err) => {
      if (err) {
        this.setState({ error: err.reason });
      }
    });
  }

  render() {
    return (
      <div className="boxed-view">
        <div className="boxed-view__box">
          <p>Join</p>

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
            <button className="button">Create Account</button>
          </form>

          <NavLink to="/">Already have an account?</NavLink>
        </div>
      </div>
    );
  }
}
