import { Meteor } from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';

const Files = new FilesCollection({
  debug: true,
  collectionName: 'Files',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow upload files under 100MB, and only in png/jpg/jpeg formats
    if (file.size <= 1024 * 1024 * 100 && /gcode|x3g|esh/i.test(file.extension)) {
      return true;
    }
    return 'Please upload image, with size equal or less than 100MB';
  },
});

if (Meteor.isServer) {
  Files.denyClient();
  Meteor.publish('files.files.all', () => Files.find().cursor);
}

export default Files;
