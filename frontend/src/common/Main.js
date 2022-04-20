import React from 'react';
import ReactDOM from 'react-dom';
import './common.scss';
import { Switch, Route } from 'react-router-dom';

import AnnotationPage from '../annotation/AnnotationPage.js';
import PredictionsPage from '../predict/PredictionsPage.js';
import TrainPage from  '../train/TrainPage.js';
import ImagePage from '../images/Images.js'

const FontAwesome = require('react-fontawesome');

const urlPath = 'http://localhost:5000/projects/1/images'
const labelPath = 'http://localhost:5000/projects/1/labels'

export default class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            labels: []
        }
    }

    componentDidMount() {

        fetch(urlPath)
            .then(res => res.json())
            .then((result) => {
                const newPhotos = result.map((arr, i) => {
                    return {
                        id: arr["id"],
                        src: urlPath + '/' + arr["id"], 
                        width: arr["width"], 
                        height: arr["height"], 
                        selected: false,
                        index: i,
                        dset:arr["dset"],
                        labelled: arr["labelled"]
                    }
                })
                this.setState({
                    photos: newPhotos
                });
            });

        fetch(labelPath)
            .then(res => res.json())
            .then((result) => {
                const newLabels = result.map((arr, i) => {
                    return {
                        id: arr["id"],
                        text: arr["text"]
                    }
                })
                this.setState({
                    labels: newLabels
                });
            });
    }

    updatePhotos(newPhotos) {
        this.setState({photos: newPhotos});
    }

    render() {
        const libComp = <ImagePage 
            photos={this.state.photos} 
            createPopup={this.props.createPopup} 
            hidePopup={this.props.hidePopup}
            updatePhotos={(newPhotos) => this.updatePhotos(newPhotos)} 
        />

        const trainComp = <TrainPage 
            photos={this.state.photos} 
            createPopup={this.props.createPopup} 
            hidePopup={this.props.hidePopup}
            updatePhotos={(newPhotos) => this.updatePhotos(newPhotos)}
            labels={this.state.labels} 
        />

        return (
            <Switch>
                <Route exact path='/' render={() => libComp} />
                <Route exact path='/annotation/:index' render={props => <AnnotationPage photos={this.state.photos} 
                    imageIndex={props.match.params.index} labels={this.state.labels} />} />
                <Route exact path='/predict' render={() => 
                        <PredictionsPage 
                            photos={this.state.photos} 
                            createPopup={this.props.createPopup} 
                            hidePopup={this.props.hidePopup}
                            updatePhotos={(newPhotos) => this.updatePhotos(newPhotos)} 
                        />
                    } 
                />
                <Route exact path='/train' render={() => trainComp} />
                <Route exact path='/images' render={() => libComp} />
            </Switch>
        )

    }

}