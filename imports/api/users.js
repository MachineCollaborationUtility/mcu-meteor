import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { Accounts } from 'meteor/accounts-base';
import _ from 'lodash';

Accounts.validateNewUser((user) => {
  const email = user.emails[0].address;

  try {
    new SimpleSchema({
      email: {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
      },
    }).validate({ email });
  } catch (ex) {
    throw new Meteor.Error(400, ex.message);
  }

  return true;
});

Accounts.onCreateUser((options, user) => {
  // Currently only support creating an account through either facebook or google
  if (!user.services.facebook && !user.services.google) {
    return user;
  }

  const newUser = Object.assign({}, user);
  const facebookName = _.get(newUser, 'services.facebook.name');
  const facebookEmail = _.get(newUser, 'services.facebook.email');
  const googleName = _.get(newUser, 'services.google.name');
  const googleEmail = _.get(newUser, 'services.google.email');

  newUser.username = facebookName || googleName;

  newUser.emails = [];
  if (facebookEmail) {
    newUser.emails.push({ address: facebookEmail });
  }
  if (googleEmail) {
    newUser.emails.push({ address: googleEmail });
  }

  return newUser;
});
