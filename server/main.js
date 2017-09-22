import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
// import { ServiceConfiguration } from "meteor/service-configuration";

import '../imports/api/users';
import '../imports/startup/simple-schema-configuration';

// ServiceConfiguration.configurations.remove({
//   service: 'facebook',
// });

// ServiceConfiguration.configurations.insert({
//   service: 'facebook',
//   secret: process.env.FB_SECRET,
//   appId: process.env.FB_APP_ID,
// });

// ServiceConfiguration.configurations.remove({
//   service: 'google',
// });

// ServiceConfiguration.configurations.insert({
//   service: 'google',
//   clientId: process.env.GOOGLE_APP_ID,
//   secret: process.env.GOOGLE_SECRET,
// });

Meteor.startup(() => {});
