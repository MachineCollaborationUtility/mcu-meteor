import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import FlipMove from 'react-flip-move';
import moment from 'moment';

import Images from '../../api/files';

export default class Files extends React.Component {
  constructor(props) {
    super(props);

    this.updateDelay = 10;

    this.state = {
      images: [],
      lastUpdated: moment().valueOf(),
      currentUpload: null,
      uploadProgress: null,
    };

    this.handleFileUpload = this.handleFileUpload.bind(this);
  }

  componentDidMount() {
    this.imagesTracker = Tracker.autorun(() => {
      Meteor.subscribe('files.images.all');

      const images = Images.find().cursor.map(image => Images.findOne(image._id));

      // When a new item is created
      // optimistic loading momentarily creates the illusion that 2 collection items are created
      // To deal with this, we compare the current time with the time that the new collection item was provided
      // If an update happens prior to the timeout function being called
      // Then the state will be updated by the later callback

      setTimeout(() => {
        const currentTime = moment().valueOf();
        if (currentTime - this.state.lastUpdated >= this.updateDelay) {
          this.setState({ images });
        }
      }, this.updateDelay);

      this.setState({ lastUpdated: moment().valueOf() });
    });
  }

  componentWillUnmount() {
    this.imagesTracker.stop();
  }

  renderFiles() {
    if (this.state.images.length === 0) {
      return (
        <div className="item">
          <p className="item__status-message">No Files</p>
        </div>
      );
    }

    return this.state.images.map(image => (
      <a
        href={`${image.link()}?download=true`}
        download={image.currentFile.name}
        key={image.currentFile._id}
      >
        {image.currentFile.name}
      </a>
      ));
  }

  handleFileUpload(e) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We ufpload only one file, in case
      // there was multiple files selected
      const file = e.currentTarget.files[0];
      if (file) {
        const uploadInstance = Images.insert(
          {
            file,
            streams: 'dynamic',
            chunkSize: 'dynamic',
            onProgress: (uploadProgress) => {
              this.setState({ uploadProgress });
            },
          },
          false,
        );

        uploadInstance.on('start', () => {
          this.setState({ uploadProgress: 0 });
        });

        uploadInstance.on('end', (error, fileObj) => {
          if (error) {
            window.alert(`Error during upload: ${error.reason}`);
          } else {
            window.alert(`File "${fileObj.name}" successfully uploaded`);
          }
          this.setState({ uploadProgress: 100 });
          setTimeout(() => this.setState({ uploadProgress: null }), 2000);
        });

        uploadInstance.start();
      }
    }
  }

  render() {
    return (
      <div>
        <input onChange={this.handleFileUpload} id="fileInput" type="file" />
        {this.state.uploadProgress ? <p>Upload progress: {this.state.uploadProgress}%</p> : null}
        <FlipMove maintainContainerHeight>{this.renderFiles()}</FlipMove>
      </div>
    );
  }
}
