import { Meteor } from 'meteor/meteor';
import React from 'react';
import expect from 'expect';
import { mount } from 'enzyme';

import { PrivateHeader } from './PrivateHeader';

if (Meteor.isClient) {
  describe('PrivateHeader', () => {
    it('should should set button text to "Logout"', () => {
      const wrapper = mount(<PrivateHeader title="Testing Private Header Title" />);
      const buttonText = wrapper.find('.button').text();
      expect(buttonText).toBe('Logout');
    });

    it('should use title prop as h1 text', () => {
      const title = 'Test Title';
      const wrapper = mount(<PrivateHeader title={title} handleLogout={() => {}} />);
      const titleText = wrapper.find('h1').text();

      expect(titleText).toEqual(title);
    });

    it('should call handleLogout on click', () => {
      const spy = expect.createSpy();
      const wrapper = mount(<PrivateHeader title="Test Title" handleLogout={spy} />);
      wrapper.find('button').simulate('click');

      expect(spy).toHaveBeenCalled();
    });
  });
}
