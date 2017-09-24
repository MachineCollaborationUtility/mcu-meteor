import { Meteor } from 'meteor/meteor';
import expect from 'expect';

import { Notes } from './notes';

if (Meteor.isServer) {
  describe('notes', () => {
    const note1 = {
      _id: 'testid1',
      title: 'My title',
      body: 'Note body',
      updatedAt: 0,
      userId: 'testUserId1',
    };

    beforeEach(() => {
      Notes.remove({});
      Notes.insert(note1);
    });
    it('should insert a new note if user is logged in', () => {
      const userId = note1.userId;
      const _id = Meteor.server.method_handlers['notes.insert'].apply({ userId });

      expect(Notes.findOne({ _id, userId })).toBeTruthy();
    });

    it('should not insert note if not authenticated', () => {
      expect(() => {
        Meteor.server.method_handlers['notes.insert']();
      }).toThrow();
    });

    it('should remove note', () => {
      Meteor.server.method_handlers['notes.remove'].apply({ userId: note1.userId }, [note1._id]);

      expect(Notes.findOne({ _id: note1._id })).toBeFalsy();
    });

    it('should not remove note if unauthenticated', () => {
      expect(() => {
        Meteor.server.method_handlers['notes.remove'].apply({}, [note1._id]);
      }).toThrow();
    });

    it('should not remove note if invalid _id', () => {
      expect(() => {
        Meteor.server.method_handlers['notes.remove'].apply({ userId: note1.userId });
      }).toThrow();
    });

    it('should update note', () => {
      const title = 'New title!';

      Meteor.server.method_handlers['notes.update'].apply(
        {
          userId: note1.userId,
        },
        [note1._id, { title }],
      );

      const note = Notes.findOne(note1._id);
      expect(note.updatedAt).toBeGreaterThan(0);
      expect(note).toInclude({
        title,
        body: note1.body,
      });
    });

    it('should throw an error if additional params passed', () => {
      const title = 'New title!';
      expect(() => {
        Meteor.server.method_handlers['notes.update'].apply({ userId: note1.userId }, [
          note1._id,
          { title, foo: 'bar' },
        ]);
      }).toThrow();
    });

    it('should not update note, if user was not the creator', () => {
      const title = 'This is an updated title!';

      Meteor.server.method_handlers['notes.update'].apply(
        {
          userId: 'testid',
        },
        [note1._id, { title }],
      );

      const note = Notes.findOne(note1._id);

      expect(note).toInclude(note1);
    });

    it('should not update note if unauthenticated', () => {
      expect(() => {
        Meteor.server.method_handlers['notes.update'].apply({}, [note1._id]);
      }).toThrow();
    });

    it('should not edit note if invalid _id', () => {
      expect(() => {
        Meteor.server.method_handlers['notes.update'].apply({ userId: note1.userId });
      }).toThrow();
    });
  });
}
