import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { Session } from 'meteor/session';
import FlipMove from 'react-flip-move';
import moment from 'moment';

import PrivateHeader from '../PrivateHeader';
import FilesAPI from '../../api/files';

export default class Files extends React.Component {
  constructor(props) {
    super(props);

    this.updateDelay = 10;

    this.state = {
      files: [],
      lastUpdated: moment().valueOf(),
      currentUpload: null,
      uploadProgress: null,
    };

    this.handleFileUpload = this.handleFileUpload.bind(this);
  }

  componentDidMount() {
    this.filesTracker = Tracker.autorun(() => {
      Meteor.subscribe('files.files.all');

      const files = FilesAPI.find().cursor.map(file => FilesAPI.findOne(file._id));

      // When a new item is created
      // optimistic loading momentarily creates the illusion that 2 collection items are created
      // To deal with this, we compare the current time with the time that the new collection item was provided
      // If an update happens prior to the timeout function being called
      // Then the state will be updated by the later callback

      setTimeout(() => {
        const currentTime = moment().valueOf();
        if (currentTime - this.state.lastUpdated >= this.updateDelay) {
          this.setState({ files });
        }
      }, this.updateDelay);

      this.setState({ lastUpdated: moment().valueOf() });
    });
  }

  componentWillUnmount() {
    this.filesTracker.stop();
  }

  renderFiles() {
    if (this.state.files.length === 0) {
      return (
        <div className="item">
          <p className="item__status-message">No Files</p>
        </div>
      );
    }

    return this.state.files.map(file => (
      <a
        href={`${file.link()}?download=true`}
        download={file.currentFile.name}
        key={file.currentFile._id}
      >
        {file.currentFile.name}
      </a>
    ));
  }

  handleFileUpload(e) {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // there was multiple files selected
      const file = e.currentTarget.files[0];
      if (file) {
        const uploadInstance = FilesAPI.insert(
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
        <PrivateHeader title="Dashboard" />
        <input onChange={this.handleFileUpload} id="fileInput" type="file" />
        {this.state.uploadProgress ? <p>Upload progress: {this.state.uploadProgress}%</p> : null}
        <FlipMove maintainContainerHeight>{this.renderFiles()}</FlipMove>
      </div>
    );
  }
}
