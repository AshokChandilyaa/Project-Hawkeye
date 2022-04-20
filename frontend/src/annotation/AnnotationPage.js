import React from 'react';
import '../common/common.scss';
import './annotation.scss';

import PredictionInfo from '../util/PredictionInfo.js';
import RegionInfo from '../util/RegionInfo.js';
import MathUtils from '../util/MathUtils.js';

import AnnotationPane from './AnnotationPane.js';
import RegionsList from './RegionsList.js';
import LabelRow from './LabelRow.js'

const FontAwesome = require('react-fontawesome');

const urlPath = 'http://localhost:5000/projects/1/'


export default class AnnotationPage extends React.Component {

    constructor(props) {

        super(props);
        this.regions=[]

        this.state = {
            regions: [],    // array of boxes
            predictions: [],
            focusedIndex: -1,   // box to highlight
            imageIndex: props.imageIndex,
            currentTab: 'regions',
            confThreshold: 0.6,
            iouThreshold: 0.3,
            visualisePred: false,
            panning: false,
            scale:1
        }


        this.prevImageWidth = null; // to handle images with different sizes
        this.prevImageHeight = null;

    }

    onRegionDeleteHandler(i) {

        const newRegions = this.state.regions.slice();
        newRegions.splice(i, 1);

        let newFocusedIndex = this.state.focusedIndex;
        if (i < this.state.focusedIndex) {
            newFocusedIndex--;
        } else if (i == this.state.focusedIndex) {
            newFocusedIndex = -1;
        }
        this.setState({ focusedIndex: newFocusedIndex, regions: newRegions });

    }

    bbOnFocusedIndexChangeHandler(i) {
        this.setState({ focusedIndex: i })
    }

    getTabContent() {
        if (this.state.currentTab == 'regions') {

            if (this.state.regions.length == 0) {  // no regions drawn
                return (
                    <div className='regions-placeholder'>
                        <FontAwesome
                            size='5x'
                            name='clone'
                        />
                        <div>Draw a region and it will appear here.</div>
                    </div>
                )
            } else {
                return (
                    <RegionsList
                        focusedIndex={this.state.focusedIndex}
                        regions={this.state.regions}
                        onRegionDelete={(i) => this.onRegionDeleteHandler(i)}
                    ></RegionsList>
                )
            }

        } else if (this.state.currentTab == 'labels') {
            return (this.props.labels.length > 0 ?
                <div>{this.props.labels.map((x)=><LabelRow label={x}></LabelRow>)}</div> : <span>There is no labels added. Add labels in Train page to start annotating</span>
            )
        } else if (this.state.currentTab == 'help') {
            return (
                <div>
                    <img src='https://i.imgur.com/he6rf2X.png' width='200'></img>
                </div>
            )
        }
    }

    getPredictions() {
        const requestPath = `${urlPath}predict/${this.props.photos[this.state.imageIndex].id}`
        fetch(requestPath)
            .then(res => res.json())
            .then((result) => {
                console.log(result)

                const img = document.getElementsByClassName('labelling-img')[0];
                this.setState({predictions: result.map((arr, i) => {
                    return new PredictionInfo(arr["x0"]*img.naturalWidth, arr["y0"]*img.naturalHeight, arr["x1"]*img.naturalWidth, arr["y1"]*img.naturalHeight, arr["label"], arr["conf"],0, arr["id"])
                })})
                this.scaleRegions(this.state.predictions, img.naturalWidth, img.naturalHeight, img.offsetWidth, img.offsetHeight);

            });
    }

    getRegions() {
        const requestPath = `${urlPath}images/${this.props.photos[this.state.imageIndex].id}/regions`
        const img = document.getElementsByClassName('labelling-img')[0];
        const img_width = img.offsetWidth
        const img_height = img.offsetHeight
        fetch(requestPath)
            .then(res => res.json())
            .then((result) => {

                const newRegions = result.map((arr, i) => {
                    return new RegionInfo(arr["x0"] * img_width, arr["y0"] * img_height, arr["x1"] * img_width, arr["y1"] * img_height, arr["label"], 0, arr["id"])
                })
                console.log(newRegions)
                this.setState({ regions: newRegions });

            });

    }

    confirmPrediction(i) {
        // Add prediction to the array of regions
        const newRegions = this.state.regions.slice();
        newRegions.push(RegionInfo.fromPrediction(this.state.predictions[i]));
        this.state.predictions.splice(i, 1);
        this.setState({regions: newRegions, focusedIndex: this.state.regions.length});

    }

    confirmPredictions() {
        // Only valid if the image is in test set
        // Move the image to training set
        const im_indx = this.state.imageIndex
        console.log(im_indx)
        this.sendRegions(im_indx)
        this.toTrainingSet(im_indx)
        this.changeImageIndex(1)
    }

    getFilteredPredictions() {
        // Filter boxes using their confidence scores and NMS

        let filteredPredictions = this.state.predictions.slice().filter((pred) => pred.conf > this.state.confThreshold);;
        filteredPredictions.sort((r1, r2) => r2.conf - r1.conf)

        let i = 0;
        let end = filteredPredictions.length;

        while (i < end) {

            const r1 = filteredPredictions[i];
            let j = i+1;
            while (j < end) {
                const r2 = filteredPredictions[j];
                if (r1.label == r2.label && MathUtils.iou(r1, r2) > this.state.iouThreshold) {
                    filteredPredictions.splice(j, 1);
                    end--;
                }
                j++
            }
            i++

        }

        return filteredPredictions

    }

    sendRegions(im_indx) {
        // Post regions
        console.log(this.props.photos[im_indx].id)
        const requestPath = `${urlPath}images/${this.props.photos[im_indx].id}/regions`
        const img = document.getElementsByClassName('labelling-img')[0];
        const img_width = img.offsetWidth
        const img_height = img.offsetHeight
        fetch(requestPath, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.processRegionsForOutput(this.state.regions, img_width, img_height))
        })
    }
    
    toTrainingSet(im_indx) {
        const requestPath = `${urlPath}images/${this.props.photos[im_indx].id}/confirm`
        fetch(requestPath, {
            method: 'POST'
        })

    }
    processRegionsForOutput(regs, im_width, im_height) {
        // Filter regions and convert absolute to proportional coordinates
        return regs.filter(x => !(x instanceof PredictionInfo)).map((obj, i) => {
            const temp_x1 = obj.x1
            obj.x0 = Math.min(obj.x0, obj.x1) / im_width
            obj.x1 = Math.max(temp_x1, obj.x0) / im_width
            const temp_y1 = obj.y1
            obj.y0 = Math.min(obj.y0, obj.y1) / im_height
            obj.y1 = Math.max(temp_y1, obj.y1) / im_height
            return obj

        })
    }

    handlePredictionsToggle(e) {
        this.setState({ visualisePred: e.target.checked });
    }

    handlePanningToggle(e) {
        this.setState({ panning: e.target.checked });
    }


    render() {

        const filteredPred = this.state.visualisePred ? this.getFilteredPredictions() : [];
        console.log(filteredPred)
        const selectStyles = {
            'container': function (provided) {
                return {
                    ...provided,
                    width: 250,
                    display: 'inline-block',
                    fontSize: 15,
                    marginRight: 12
                }
            },
            'control': function (provided, state) {
                return {
                    ...provided,
                    outline: 'none',
                    boxShadow: state.isFocused ? '0 0 5px rgb(56, 157, 252)' : ''
                }
            },
            'option': function (provided, state) {
                return {
                    ...provided,
                    background: state.isSelected ? 'rgb(56, 157, 252)' : '',
                }
            }
        }

        return (
            <div className='annotation-page'>
                <div className='annotation-content-container'>
                    <div className='annotation-controls-container'>
                        <label htmlFor='predictions-toggle'>
                            <input
                                type='checkbox' id='predictions-toggle' className='predictions-toggle'
                                value={this.state.visualisePred}
                                onChange={(e) => this.handlePredictionsToggle(e)}
                            />
                            <span>Visualise model predictions</span>
                        </label>

                        <label htmlFor='predictions-toggle'>
                            <input
                                type='checkbox' id='predictions-toggle' className='predictions-toggle'
                                value={this.state.panning}
                                onChange={(e) => this.handlePanningToggle(e)}
                            />
                            <span>Enable Panning</span>
                        </label>
                        <div className={'thresh-container conf-container' + (this.state.visualisePred ? '' : ' disabled')}>
                            <span className='conf-text'>Confidence threshold ({this.state.confThreshold}):</span>
                            <input
                                type='range' className='thresh-slider' value={this.state.confThreshold}
                                onChange={(e) => this.setState({ confThreshold: e.target.value })}
                                min='0.01' max='.99' step='0.01'
                            />
                        </div>
                        <div className={'thresh-container iou-container' + (this.state.visualisePred ? '' : ' disabled')}>
                            <span className='iou-text'>IOU threshold ({this.state.iouThreshold}):</span>
                            <input
                                type='range' className='thresh-slider' value={this.state.iouThreshold}
                                onChange={(e) => this.setState({ iouThreshold: e.target.value })}
                                min='0.01' max='.99' step='0.01'    
                            />
                        </div>
                        {
                            this.props.photos[this.state.imageIndex].dset == 'test' &&
                            <button className='btn primary-btn move-button' onClick={() => { this.confirmPredictions() }}>
                                <FontAwesome name='arrow-right' />
                                Move to training set
                            </button>
                        }
                    </div>
                       <div className='annotation-pane-container' ref={ref => this.containerRef = ref}>
                        <AnnotationPane
                            regions={this.state.regions}
                            predictions={filteredPred}
                            confirmPrediction={(i) => this.confirmPrediction(i)}
                            updateRegions={(newRegions, i) => this.updateRegions(newRegions, i)}
                            onFocusedIndexChange={(i) => this.bbOnFocusedIndexChangeHandler(i)}
                            focusedIndex={this.state.focusedIndex}
                            image={this.props.photos[this.state.imageIndex].src}
                            panning={this.state.panning}
                            scale={this.state.scale}
                            setScale={() => this.setScale()}
                        />
                    </div>



                </div>
                <div className='sidebar-container'>
                    <div className='tab-container'>
                        <div
                            className={'tab' + (this.state.currentTab == 'regions' ? ' focused-tab' : '')}
                            onClick={() => this.setState({ currentTab: 'regions' })}
                        >
                            <FontAwesome
                                name='clone'
                            />
                            <span className='tab-text'>Regions ({this.state.regions.length + filteredPred.length})</span>
                        </div>
                        <div
                            className={'tab' + (this.state.currentTab == 'labels' ? ' focused-tab' : '')}
                            onClick={() => this.setState({ currentTab: 'labels' })}
                        >
                            <FontAwesome
                                name='info-circle'
                            />
                            <span className='tab-text'>Labels</span>
                        </div>
                        <div
                            className={'tab' + (this.state.currentTab == 'help' ? ' focused-tab' : '')}
                            onClick={() => this.setState({ currentTab: 'help' })}
                        >
                            <FontAwesome
                                name='question-circle'
                            />
                            <span className='tab-text'>Help</span>
                        </div>
                    </div>
                    <div className='tab-content-container'>
                        {this.getTabContent()}
                    </div>
                    <div className='buttons-container'>
                        <button
                            className='btn prev-btn'
                            onClick={() => this.changeImageIndex(-1)}
                        >
                            Previous Image
                        </button>
                        <button
                            className='btn primary-btn'
                            onClick={() => this.changeImageIndex(1)}
                        >
                            Next Image
                        </button>
                    </div>
                </div>
            </div>
        )

    }

    changeImageIndex(dir) {
        // dir == 1 -> Move to the next image
        // dir == -1 -> Move to the previous image 

        let newIndex = (1*this.state.imageIndex + dir) % this.props.photos.length
        console.log(this.props.photos[this.state.imageIndex].labelled)
        console.log(this.props.photos[newIndex].labelled)
        while ((this.props.photos[newIndex].dset != this.props.photos[this.state.imageIndex].dset) ||
        (this.props.photos[newIndex].labelled != this.props.photos[this.state.imageIndex].labelled)) {
            newIndex = (this.props.photos.length + newIndex + dir) % this.props.photos.length;
        }
        this.updateImage(newIndex);
    }

    componentDidMount() {
        
        this.updateDimensions(false);
        this.getPredictions();
        this.getRegions();
        new ResizeObserver(() => {
            this.updateDimensions(true)
        }).observe(this.containerRef);

    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.imageIndex !== prevState.imageIndex) {
            this.getPredictions();
            this.getRegions();
        }
    }

    componentWillUnmount() {
        this.sendRegions(this.state.imageIndex)
    }

    updateImage(newIndex) {
        this.sendRegions(this.state.imageIndex)

        this.setState({
            imageIndex: newIndex,
            regions: [],
            predictions: []
        }, () => this.updateDimensions());
    }

    scaleRegions(regions, prevWidth, prevHeight, width, height) {

        regions.forEach((region) => {
            region.x0 /= prevWidth / width;
            region.x1 /= prevWidth / width;
            region.y0 /= prevHeight / height;
            region.y1 /= prevHeight / height;
        });
        
    }

    setScale() {
        // The value by which the image has been zoomed in
        const zoom=document.getElementsByClassName('react-transform-component transform-component-module_content__2jYgh')[0];
        const scale=zoom.style.transform.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g)[4]
        this.setState({scale:scale})
    }

    updateRegions(newRegions, i) {
        this.setState({ regions: newRegions })
        


    }
    updateDimensions(scaleRegions) {

        const annotationContainer = document.getElementsByClassName('annotation-pane-container')[0];
        const annotationPane = document.getElementsByClassName('annotation-pane')[0];
        const img = document.getElementsByClassName('labelling-img')[0];


        if (img == undefined) {
            return;
        } else if (this.prevImageWidth == null) {
            this.prevImageWidth = img.naturalWidth;
            this.prevImageHeight = img.naturalHeight;
        }

        const widthDiff = img.naturalWidth / annotationContainer.offsetWidth,
            heightDiff = img.naturalHeight / annotationContainer.offsetHeight;

        let width, height;
        if (widthDiff > heightDiff) {
            width = Math.min(img.naturalWidth, annotationContainer.offsetWidth);
            height = (width / img.naturalWidth) * img.naturalHeight;
        } else {
            height = Math.min(img.naturalHeight, annotationContainer.offsetHeight);
            width = (height / img.naturalHeight) * img.naturalWidth;
        }

        annotationPane.style.width = width + 'px';
        annotationPane.style.height = height + 'px';

        if (scaleRegions) {

            const newRegions = this.state.regions.slice();
            this.scaleRegions(newRegions, this.prevImageWidth, this.prevImageHeight, width, height);
            this.scaleRegions(this.state.predictions, this.prevImageWidth, this.prevImageHeight, width, height);
            this.setState({regions: newRegions});
        }

        this.prevImageWidth = width;
        this.prevImageHeight = height;

    }

}