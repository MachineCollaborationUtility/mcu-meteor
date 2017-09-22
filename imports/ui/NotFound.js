import React from 'react';
import { NavLink } from 'react-router-dom';

const NotFound = () => (
  <div className="boxed-view">
    <div className="boxed-view__box">
      <h1>Page Not Found</h1>
      <p>Hmmm, we're unable to find that page.</p>
      <NavLink className="button button--link" to="/">
        Head Home
      </NavLink>
    </div>
  </div>
);

export default NotFound;
