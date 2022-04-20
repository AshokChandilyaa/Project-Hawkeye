import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common.scss';

const FontAwesome = require('react-fontawesome');

export default class DeletePopup extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className='popup'>
                <span>Delete selected files</span>
                              
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