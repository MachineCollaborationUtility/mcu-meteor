import { Meteor } from 'meteor/meteor';
import expect from 'expect';
import { validateNewUser } from './users';

if (Meteor.isServer) {
  describe('User validation functionality', () => {
    it('should allow valid email address', () => {
      const testUser = {
        emails: [
          {
            address: 'me@domain.com',
          },
        ],
      };

      const res = validateNewUser(testUser);

      expect(res).toBe(true);
    });

    it('should throw error on invalid email address', () => {
      expect(() => {
        const testUser = {
          emails: [
            {
              address: 'me.com',
            },
          ],
        };

        const res = validateNewUser(testUser);
      }).toThrow();
    });
  });
}
