import React from 'react';
import { Route } from 'react-router-dom';

import PrivateHeader from './PrivateHeader';
import Bots from './Bots/Bots';
import Files from './Files/Files';

export default ({ computedMatch }) => (
  <div>
    <PrivateHeader title="Dashboard" />
    <Bots />
  </div>
);
