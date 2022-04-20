import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common.scss';
import './train.scss';
import TrainPopup from './TrainPopup.js';
import ClassPopup from './ClassPopup.js';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css' 

const metricsPath = 'http://localhost:5000/projects/1/train/metrics'
const FontAwesome = require('react-fontawesome');

export default class TrainPage extends React.Component {

    constructor(props) {
        super(props);
        const date = (new Date());
        this.state = {
            metrics:{model:false},
            models: [
                {name: 'Default model', timeCreated: date.toLocaleString(), timeTrained: null}
            ],
            selectedIndex: 0
        }
    }
    componentDidMount() {
        const date = (new Date());
        // Get current model's performance    
        fetch(metricsPath)
            .then(res => res.json())
            .then((result) => {
                
                this.setState({
                    metrics: result,
                    models: result.model ? [{name: result.name, timeCreated: date.toLocaleString(), timeTrained: null, mAP: result.mAP.toPrecision(3), mAR: result.mAR.toPrecision(3)}] : []
                });
            });
    }

    onTrainClickHandler() {
        this.props.createPopup(
            <TrainPopup 
                hidePopup={this.props.hidePopup}
            />
        )
    }   
    
    onClassClickHandler() {
        this.props.createPopup(
            <ClassPopup hidePopup={this.props.hidePopup} labels={this.props.labels}></ClassPopup>

        )
    }

    buildStatsVisualiser(value, color) {
        return <CircularProgressbar 
            value={value}
            text={value + '%'}
            circleRatio={0.75}
            styles={buildStyles({
                rotation: 1 / 2 + 1 / 8,
                strokeLinecap: 'butt',
                trailColor: '#eee',
                pathColor: color,
                textColor: color
            })}
        />
    }

    render() {
        const model = this.state.metrics.model ? this.state.models[0] : ""


        return (
            <div className='models-page'>
                <div className='sidebar'>
                    {
                        this.state.models.map((val, i) => 
                            <div 
                                className={'model-item' + (i == this.state.selectedIndex ? ' selected' : '')}
                                onClick={() => this.setState({selectedIndex: i})}
                            >
                                <div className='model-name'>{val.name}</div>
                                <div className='model-created'>Created: {val.timeCreated}</div>
                                
                            </div>
                        )
                    }
                </div>
                <div className='model-view'>
                    <div className='buttons-container'>
                        <button className='btn'>
                            <FontAwesome name='download' />
                            Export
                        </button>
                        <button className='btn'>
                            <FontAwesome name='trash' />
                            Delete
                        </button>
                    </div>
                    {this.state.metrics.model ? <div>
                    <div className='model-name'>{model.name}</div>
                    <div className='model-created'>Created: {model.timeCreated}</div>
                    
                    <div className='eval-container'>
                        <h2>Evaluation statistics:</h2>
                        <div className='stats-container'>
                            {<div className='dial-container'>
                                {this.buildStatsVisualiser(model.mAP, "#389dfc")}
                                <div className='dial-label'>mAP</div>
                            </div>}
                            {<div className='dial-container'>
                                {this.buildStatsVisualiser(model.mAR, "#72e342")}
                                <div className='dial-label'>mAR</div>
                            </div>}
                        </div>
                    </div>
                    </div>
                    : ""}
                    <div className='abs-btn-container'>

                        <button 
                            className='btn primary-btn train-btn abs-btn'
                            onClick={() => this.onTrainClickHandler()}
                        >
                            <FontAwesome
                                name='cogs'
                            />
                            <span className='train-text'>Train a model</span>
                        </button>
                    </div>   

                    <div className='abs-btn-container'>

                        <button 
                            className='btn primary-btn class-btn abs-btn'
                            onClick={() => this.onClassClickHandler()}
                        >
                            <FontAwesome
                                name='cogs'
                            />
                            <span className='train-text'>Manage Classes</span>
                        </button>
                    </div>               
                </div>
            </div>
        )

    }

}