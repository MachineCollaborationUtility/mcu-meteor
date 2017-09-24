import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import moment from 'moment';

export const Notes = new Mongo.Collection('notes');

if (Meteor.isServer) {
  Meteor.publish('notes', function () {
    return Notes.find({ userId: this.userId });
  });
}
Meteor.methods({
  'notes.insert': function () {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    return Notes.insert({
      title: '',
      body: '',
      userId: this.userId,
      updatedAt: moment().valueOf(),
    });
  },
  'notes.remove': function (_id) {
    // Check for user id else throw error
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    try {
      new SimpleSchema({
        _id: {
          type: String,
          min: 1,
        },
      }).validate({ _id });
    } catch (ex) {
      throw new Meteor.Error(400, ex.message);
    }

    Notes.remove({ _id, userId: this.userId });
  },
  'notes.update': function (_id, updates) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    try {
      new SimpleSchema({
        _id: {
          type: String,
          min: 1,
        },
        title: {
          type: String,
          optional: true,
        },
        body: {
          type: String,
          optional: true,
        },
      }).validate({ _id, ...updates });
    } catch (ex) {
      throw new Meteor.Error(400, ex.message);
    }

    Notes.update(
      {
        _id,
        userId: this.userId, // Make sure update only called by note creator
      },
      {
        $set: {
          updatedAt: moment().valueOf(),
          ...updates,
        },
      },
    );
  },
});
