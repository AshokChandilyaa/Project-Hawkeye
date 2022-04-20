import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common.scss';

import RegionInfo from '../util/RegionInfo.js';
import PredictionInfo from '../util/PredictionInfo.js';
import RegionBB from './RegionBB.js';
import {TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch'

export default class AnnotationPane extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currZ: 1
        }
        this.resizingCorner = null;
        this.dragging = false;
        this.drawingOrigin = null;
        this.drawingRegion = false;
    }

    componentDidUpdate(prevProps){
        if (prevProps.predictions !=this.props.predictions){
            
        }
    }

    getLocalXY(e) {
        const rect = e.currentTarget.getBoundingClientRect();

        const x = Math.round(e.clientX - rect.left),
              y = Math.round(e.clientY - rect.top);

        return [x ,y]
    }

    fixRegionCoords(region) {
        // x1 always greater than x0, y1 always greater than y0
        const tempx1 = region.x1
        region.x1 = Math.max(region.x1, region.x0);
        region.x0 = Math.min(tempx1, region.x0);

        const tempy1 = region.y1
        region.y1 = Math.max(region.y1, region.y0);
        region.y0 = Math.min(tempy1, region.y0);
    }

    onMouseDownHandler(e) {

        const coords = this.getLocalXY(e).map(x=> x/this.props.scale);
        
        // Highlight the box when the box is clicked
        let intersectingRegion = false;
        for (let i = 0; i < this.props.regions.length; i++) {
            const regionInfo = this.props.regions[i];
            if (coords[0] > regionInfo.x0 && coords[0] < regionInfo.x1 &&
                coords[1] > regionInfo.y0 && coords[1] < regionInfo.y1) {

                    intersectingRegion = true;
                    if (this.resizingCorner != null) {
                        // do nothing
                    } else if (i == this.props.focusedIndex) {
                        this.dragging = true;
                    } else {
                        this.resetFlags();
                        this.setFocusedIndex(i);
                    }
                    break;

            }
        }
        
        // If clicking on the empty part of the image, draw new box
        if (!intersectingRegion && !this.resizingCorner) {

            this.drawingOrigin = coords;
            this.setFocusedIndex(-1);
        }

    }

    onMouseMoveHandler(e) {

        const coords = this.getLocalXY(e);
        const scale = this.props.scale
        if (this.drawingOrigin != null) {

            const prevDrawingRegion = this.drawingRegion;
            this.drawingRegion = this.drawingRegion || 
                                 Math.abs(coords[0] - this.drawingOrigin[0]) > 3 ||
                                 Math.abs(coords[1] - this.drawingOrigin[1]) > 3;

            const newRegions = this.props.regions.slice();
            if (this.drawingRegion != prevDrawingRegion) {
                // Just started drawing a new box
                const currentRegion = new RegionInfo(...this.drawingOrigin, ...coords.map(x => x/scale), '', 0);

                newRegions.push(currentRegion);
                this.updateRegions(newRegions,-1);

            } else if (this.drawingRegion) {
                // Drawing a new box
                const lastRegion = newRegions[newRegions.length-1];
    
                if (coords[0] < this.drawingOrigin[0]) {
                    lastRegion.x0 = coords[0]/scale;
                } else {
                    lastRegion.x1 = coords[0]/scale;
                }
    
                if (coords[1] < this.drawingOrigin[1]) {
                    lastRegion.y0 = coords[1]/scale;
                } else {
                    lastRegion.y1 = coords[1]/scale;
                }
                
            }

            this.updateRegions(newRegions,newRegions.length-1);

        } else if (this.dragging) {
            // Move the existing box
            const newRegions = this.props.regions.slice();
            const focusedRegion = newRegions[this.props.focusedIndex];
            
            if (focusedRegion.x0 + e.movementX/scale < 0) {
                focusedRegion.x1 -= focusedRegion.x0;
                focusedRegion.x0 = 0;
            } else if (focusedRegion.x1 + e.movementX/scale > this.domElement.clientWidth) {
                focusedRegion.x0 += this.domElement.clientWidth - focusedRegion.x1;
                focusedRegion.x1 = this.domElement.clientWidth
            } else {
                focusedRegion.x0 += e.movementX/scale;
                
                focusedRegion.x1 += e.movementX/scale;
                
            }

            if (focusedRegion.y0 + e.movementY/scale < 0) {
                focusedRegion.y1 -= focusedRegion.y0;
                focusedRegion.y0 = 0;
            } else if (focusedRegion.y1 + e.movementY/scale > this.domElement.clientHeight) {
                focusedRegion.y0 += this.domElement.clientHeight - focusedRegion.y1;
                focusedRegion.y1 = this.domElement.clientHeight
            } else {
                focusedRegion.y0 += e.movementY/scale;
                
                focusedRegion.y1 += e.movementY/scale;
                
            }

            this.updateRegions(newRegions, this.props.focusedIndex);

        } else if (this.resizingCorner !== null) {
            // Resize the existing box
            const newRegions = this.props.regions.slice();
            const focusedRegion = newRegions[this.props.focusedIndex];
            const coords = this.getLocalXY(e);
                
            if (this.resizingCorner == 'top-left') {
                focusedRegion.x0 = coords[0]/scale;
                focusedRegion.y0 = coords[1]/scale;
            } else if (this.resizingCorner == 'top-right') {
                focusedRegion.x1 = coords[0]/scale;
                focusedRegion.y0 = coords[1]/scale;
            } else if (this.resizingCorner == 'bottom-right') {
                focusedRegion.x1 = coords[0]/scale;
                focusedRegion.y1 = coords[1]/scale;
            } else if (this.resizingCorner == 'bottom-left') {
                focusedRegion.x0 = coords[0]/scale;
                focusedRegion.y1 = coords[1]/scale;
            }

            focusedRegion.x0 = Math.min(this.domElement.clientWidth, Math.max(0, focusedRegion.x0));
            focusedRegion.x1 = Math.min(this.domElement.clientWidth, Math.max(0, focusedRegion.x1));
            focusedRegion.y0 = Math.min(this.domElement.clientHeight, Math.max(0, focusedRegion.y0));
            focusedRegion.y1 = Math.min(this.domElement.clientHeight, Math.max(0, focusedRegion.y1));

            this.updateRegions(newRegions, this.props.focusedIndex);

        }

    }

    onMouseUpHandler(e) {

        if (this.drawingRegion) {
            this.setFocusedIndex(this.props.regions.length-1);
        } else if (this.resizingCorner != null) {
            this.fixRegionCoords(this.props.regions[this.props.focusedIndex]);
        }

        this.resetFlags();

    }

    setFocusedIndex(i) {
        const prevI = this.props.focusedIndex;
        this.props.onFocusedIndexChange(i);

        if (prevI != i && i != -1) {
            const newRegions = this.props.regions.slice();
            newRegions[i].zIndex = this.currZ+1;
            this.updateRegions(newRegions,-1);
            this.setState({currZ: this.state.currZ+1});
        }
    }

    resetFlags() {
        this.dragging = false;
        this.drawingOrigin = null;
        this.drawingRegion = false;
        this.resizingCorner = null;
    }

    deleteRegion(i) {

        const newRegions = this.props.regions.slice();
        newRegions.splice(i, 1);
        this.updateRegions(newRegions,-1);
        if (i == this.props.focusedIndex) {
            this.setFocusedIndex(-1);
        } else if (i < this.props.focusedIndex) {
            this.setFocusedIndex(this.props.focusedIndex-1);
        }

    }

    bbOnKeyDownHandler(e, i) {

        if (e.key == 'Delete') {
            this.deleteRegion(i);
        }

    }



    bbOnFocusHandler(i) {
        this.setFocusedIndex(i);
    }

    updateRegions(newRegions, i) {
        this.props.updateRegions(newRegions, i);
    }

    onLabelUpdateHandler(i, newLabel) {

        const newRegions = this.props.regions.slice();
        newRegions[i].label = newLabel;

        this.updateRegions(newRegions,-1);

    }

    createRegionBB(ri, i) {

        const minX = Math.min(ri.x0, ri.x1),
              minY = Math.min(ri.y0, ri.y1),
              maxX = Math.max(ri.x0, ri.x1),
              maxY = Math.max(ri.y0, ri.y1);
                    
        return (
            <RegionBB
                onKeyDown = {(e) => this.bbOnKeyDownHandler(e, i)}
                onFocus = {() => this.bbOnFocusHandler(i)}
                onTabMouseDown = {(corner) => {
                    this.bbOnFocusHandler(i);
                    this.resizingCorner = corner;
                }}
                onLabelUpdate = {(i, newLabel) => this.onLabelUpdateHandler(i, newLabel)}
                onConfirm={ri instanceof PredictionInfo ? () => this.props.confirmPrediction(i) : () => {}}
                zIndex = {ri.zIndex}
                key = {i}
                index = {i}
                x = {minX} y = {minY}
                width = {maxX - minX} height = {maxY - minY}
                label = {ri.label}
                isPrediction={ri instanceof PredictionInfo}
                focused={i == this.props.focusedIndex}
                conf={ri instanceof PredictionInfo ? ri.conf : null}
                region={ri}
            ></RegionBB>

        )

    }

    render() {
        
        return (
            // Wrapper for zoom-pan-pinch
            <TransformWrapper panning={{"disabled":!(this.props.panning)}} onZoom={() => this.props.setScale()}>
            <TransformComponent wrapperStyle={{width:"100%", height: "100%"}} contentStyle={{width: "100%", height:"100%"}}>
            
            <div 
                className='annotation-pane no-drag'
                onMouseDown = {this.props.panning ? () => {} : (e) => this.onMouseDownHandler(e)}
                onMouseMove = {this.props.panning ? () => {} : (e) => this.onMouseMoveHandler(e)}
                onMouseUp = {this.props.panning ? () => {} : (e) => this.onMouseUpHandler(e)}
                draggable='true'
                ref = {ref => this.domElement = ref}
            >
                <img src={this.props.image} className='labelling-img no-drag'></img>
                {this.props.regions.map((ri, i) => this.createRegionBB(ri, i))}
                {this.props.predictions.map((ri, i) => this.createRegionBB(ri, i))}
            </div>

            </TransformComponent>
            </TransformWrapper>
        )

    }

}