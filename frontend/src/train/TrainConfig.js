import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common.scss';
import './train.scss';

import Select from 'react-select';
import FontAwesome from 'react-fontawesome';

export default class TrainConfig extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedConfig: null,
        }
    }

    startTraining() {
        this.props.hidePopup();
        const requestPath = 'http://localhost:5000/projects/1/train'
        fetch(requestPath, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            // body: JSON.stringify(this.state.epochs)
        })
        
    }

    render() {

        return (
            <div className='train-config'>
                <div className='model-name-container'>
                    Model iteration name:
                    <input type='text' defaultValue='Default model' />
                </div>
                <div className='buttons-container'>
                    <button className='primary-btn btn' onClick={() => this.startTraining()}>Begin training</button>
                    <button className='btn' onClick={this.props.hidePopup}>Cancel</button>
                </div>
            </div>
        )

    }

}