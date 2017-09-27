import { Accounts } from 'meteor/accounts-base';
import React from 'react';
import { NavLink } from 'react-router-dom';

import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';

export const PrivateHeader = props => (
  <div className="header">
    <div className="header__content">
      <h1 className="header__title">{props.title}</h1>
      <NavLink to="/dashboard">Bots</NavLink>
      <NavLink to="/files">Files</NavLink>
      <button className="button button--link-text" onClick={props.handleLogout}>
        Logout
      </button>
    </div>
  </div>
);

PrivateHeader.propTypes = {
  title: PropTypes.string.isRequired,
  handleLogout: PropTypes.func.isRequired,
};

export default createContainer(
  () => ({
    handleLogout: () => Accounts.logout(),
  }),
  PrivateHeader,
);
