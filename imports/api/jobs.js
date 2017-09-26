import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import moment from 'moment';

export const Jobs = new Mongo.Collection('jobs');

if (Meteor.isServer) {
  Meteor.publish('jobs', function () {
    return Jobs.find({ userId: this.userId });
  });
}

Meteor.methods({
  'jobs.insert': function (botId, fileId) {
    if (!this.userId) {
      throw new Meteor.Error('Unauthorized');
    }

    Jobs.insert(
      {
        userId: this.userId,
        botId,
        fileId,
        state: '',
        started: null,
        elapsed: 0,
        percentComplete: 0,
        createdAt: moment().valueOf(),
        updatedAt: moment().valueOf(),
      },
      (error, response) => {
        if (error) {
          // We can toss an error to the user if something fudges up.
          return error.reason;
        }
      },
    );
  },
  'jobs.remove': function (jobId) {
    const jobs = Jobs.find(jobId);

    if (!this.userId || this.userId != job.userId) {
      throw new Meteor.Error('Unauthorized');
    }

    Jobs.remove(jobId, (error) => {
      if (error) {
        // We can toss an error to the user if something fudges up.
        return error.reason;
      }
    });
  },
});
