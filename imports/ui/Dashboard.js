import React from 'react';
import { Route } from 'react-router-dom';

import PrivateHeader from './PrivateHeader';
import Bots from './Bots/Bots';
import Files from './Files/Files';

export default ({ computedMatch }) => {
  console.log(computedMatch, `${computedMatch.url}/files`);
  return (
    <div>
      <PrivateHeader title="Dashboard" />
      <Bots />
      <Route exact path={`${computedMatch.url}/files`} component={Files} />
    </div>
  );
};
