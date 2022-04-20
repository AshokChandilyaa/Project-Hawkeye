import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common.scss';
import './train.scss';

import Select from 'react-select';
import FontAwesome from 'react-fontawesome';
import TrainConfig from './TrainConfig.js';

export default class TrainPopup extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {

        

        return (
            <div className='popup train-popup'>
                <TrainConfig
                    hidePopup={this.props.hidePopup}
                />
            </div>
        )

    }

}