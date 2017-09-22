import { Accounts } from 'meteor/accounts-base';
import React from 'react';
import PropTypes from 'prop-types';

const PrivateHeader = props => (
  <div className="header">
    <div className="header__content">
      <p className="header__title">{props.title}</p>
      <button className="button button--link-text" onClick={() => Accounts.logout()}>
        Logout
      </button>
    </div>
  </div>
);

PrivateHeader.propTypes = {
  title: PropTypes.string.isRequired,
};

export default PrivateHeader;
