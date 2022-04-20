import React, { Component } from "react";
import "./dropzone.scss";
const FontAwesome = require('react-fontawesome');

class Dropzone extends Component {
  // For uploading images
  constructor(props) {
    super(props);
    this.state = { hightlight: false };
    this.fileInputRef = React.createRef();

    this.openFileDialog = this.openFileDialog.bind(this);
    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.onDragOver = this.onDragOver.bind(this);
    this.onDragLeave = this.onDragLeave.bind(this);
    this.onDrop = this.onDrop.bind(this);
  }

  openFileDialog() {
    if (this.props.disabled) return;
    this.fileInputRef.current.click();
  }

  onFilesAdded(evt) {
    if (this.props.disabled) return;
    const files = evt.target.files;
    if (this.props.onFilesAdded) {
      const array = this.fileListToArray(files);
      this.props.onFilesAdded(array);
    }
  }

  onDragOver(event) {
    event.preventDefault();
    if (this.props.disabed) return;
    this.setState({ hightlight: true });
  }

  onDragLeave(event) {
    this.setState({ hightlight: false });
  }

  onDrop(event) {
    event.preventDefault();
    if (this.props.disabed) return;
    const files = event.dataTransfer.files;
    if (this.props.onFilesAdded) {
      const array = this.fileListToArray(files);
      this.props.onFilesAdded(array);
    }
    this.setState({ hightlight: false });
  }

  fileListToArray(list) {
    const array = [];
    for (var i = 0; i < list.length; i++) {
      array.push(list.item(i));
    }
    return array;
  }

  render() {
    return (
      <button className='upload-btn'
        className={`dropzone ${this.state.hightlight ? "highlight" : ""}`}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
        onClick={() => this.openFileDialog()}
        style={{ cursor: this.props.disabled ? "default" : "pointer" }}
      >
        <input
          ref={this.fileInputRef}
          className="file-input"
          type="file"
          multiple
          onChange={this.onFilesAdded}
        />
        <span>
          <FontAwesome
            name='upload'
          />
          Upload images
        </span>
      </button>
    );
  }
}

export default Dropzone;
