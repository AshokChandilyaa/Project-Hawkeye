import React from 'react';
import ReactDOM from 'react-dom';
import FontAwesome from 'react-fontawesome';
import '../common/common.scss';

import RegionInfo from '../util/RegionInfo.js';
const colormap=['#ffffd9','#edf8b1','#c7e9b4','#7fcdbb','#41b6c4','#1d91c0','#225ea8','#0c2c84','#0c2c84']
export default class RegionBB extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            labelFocused: false,
            draggingCorner: null
        }
        this.wasFocused = false;
    }

    onFocusHandler() {
        this.showAll();
        this.labelInput.focus();
        this.labelFocused = true;
    }

    onBlurHandler() {
        if (!this.labelFocused) {
            this.hideAll();
        }
    }

    onMouseEnterHandler() {
        this.showAll();
    }
 
    onMouseLeaveHandler() {

        if (this.props.focused) {
            return;
        }

        this.hideAll();

    }

    showAll() {
        if (this.confTab) {
            this.confTab.style.display = 'block';
        }

        this.labelInput.style.display = 'block'

        for (const div of this.domElement.getElementsByClassName('resize-tab')) {
            div.style.display = 'block';
        }
    }

    hideAll() {
        if (this.confTab) {
            this.confTab.style.display = 'none';
        }

        this.labelInput.style.display = 'none'

        for (const div of this.domElement.getElementsByClassName('resize-tab')) {
            div.style.display = 'none';
        }
    }

    componentDidUpdate() {

        if (!this.focused && this.props.focused) {
            this.labelInput.focus();
        }
        this.focused = this.props.focused;

    }

    changeColor() {
        return "3px dashed " + colormap[Math.floor(this.props.conf*7)]
    }

    render() {
        
        return (
            <div tabIndex='-1' className={'region-bb' + (this.props.isPrediction ? ' pred-bb' : '')}
                onKeyDown={(e) => this.props.onKeyDown(e)}
                onMouseEnter = {() => this.onMouseEnterHandler()}
                onMouseLeave = {() => this.onMouseLeaveHandler()}
                onMouseDown = {() => {
                    this.domElement.focus();
                    if (this.props.isPrediction) {
                        this.props.onConfirm();
                    }
                }}
                onFocus = {() => {
                    this.onFocusHandler();
                }}
                onBlur = {() => {
                    this.onBlurHandler();
                }}
                style={{
                    left: this.props.x, 
                    top: this.props.y, 
                    width: this.props.width + 'px',
                    height: this.props.height + 'px',
                    zIndex: this.props.zIndex+1,
                    border: this.props.isPrediction ? this.changeColor() : ''
                }}
                ref = {ref => this.domElement = ref}
            >
                {this.props.index+1}
                <input type='text' 
                    placeholder='(No label)'
                    defaultValue={this.props.label}
                    className='label-input no-drag' 
                    ref={ref => this.labelInput = ref} 
                    onBlur = {() => this.labelFocused = false}
                    onMouseDown = {(e) => {
                        // prevent focused index from changing by preventing event from bubbling 
                        this.labelFocused = true
                        e.stopPropagation();
                    }}
                    onFocus = {() => {
                        this.labelInput.style.display = 'block'
                        this.labelFocused = true;
                    }}
                    onInput={() => this.props.onLabelUpdate(this.props.index, this.labelInput.value)}
                />


                {
                    this.props.isPrediction &&
                    <div className='conf-tab' ref={ref => this.confTab = ref}>
                        {this.props.conf.toFixed(3)*100 + '% Confident'}
                    </div>   
                }


                <div className='resize-tab no-drag' style={{
                    'bottom': '100%', 'right': '100%',
                    'transform': 'translate(50%, 50%)',
                    'display': this.props.zIndex != -1 ? 'block' : 'none'
                }}
                    onMouseDown={() => this.props.onTabMouseDown('top-left')}
                    draggable='false'
                ></div>
                <div className='resize-tab no-drag' style={{
                    'bottom': '100%', 'left': '100%',
                    'transform': 'translate(-50%, 50%)',
                    'display': this.props.zIndex != -1 ? 'block' : 'none'
                }}
                    onMouseDown={() => this.props.onTabMouseDown('top-right')}
                    draggable='false'
                ></div>
                <div className='resize-tab no-drag' style={{
                    'top': '100%', 'bottom': '0', 'left': '100%', 'right': '0',
                    'transform': 'translate(-50%, -50%)',
                    'display': this.props.zIndex != -1 ? 'block' : 'none'
                }}
                    onMouseDown={() => this.props.onTabMouseDown('bottom-right')}
                    draggable='false'
                ></div>
                <div className='resize-tab no-drag' style={{
                    'top': '100%', 'bottom': '0', 'right': '100%',
                    'transform': 'translate(50%, -50%)',
                    'display': this.props.zIndex != -1 ? 'block' : 'none'
                }}
                    onMouseDown={() => this.props.onTabMouseDown('bottom-left')}
                    draggable='false'
                ></div>
            </div>
        )

    }

}