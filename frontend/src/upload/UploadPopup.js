import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common.scss';
import './upload.scss';

const FontAwesome = require('react-fontawesome');

export default class UploadPopup extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className='popup upload-popup'>
                <span className='files-header'>Files to be uploaded:</span>
                <div className='files-container'>
                    {this.props.files.map(file => {
                        return (
                            <div key={file.name} className='file-row'>
                                <span className='file-name'>{file.name}</span>
                            </div>
                        );
                    })}
                </div>
                               
                <div className='button-container'>
                    <button className='btn primary-btn' onClick={() => this.props.popupConfirm()}>
                        Confirm
                    </button>
                    <button className='btn' onClick={() => this.props.popupCancel()}>
                        Cancel
                    </button>
                </div>
            </div>
        )

    }

}