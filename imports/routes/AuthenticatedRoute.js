import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import ReactRouterPropTypes from 'react-router-prop-types';
import PropTypes from 'prop-types';

const Authenticated = ({ location, component, loggingIn, authenticated, ...rest }) => {
  const Component = component;
  if (loggingIn) return <div />;
  if (!authenticated) {
    const toObject = {
      pathname: '/',
    };
    if (location) {
      toObject.state = {
        from: location,
      };
    }
    return <Redirect to={toObject} />;
  }

  const route = <Route {...rest} location={location} render={() => <Component {...rest} />} />;

  return route;
};

Authenticated.propTypes = {
  loggingIn: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
  location: ReactRouterPropTypes.location,
};

Authenticated.defaultProps = {
  location: null,
};

export default Authenticated;
