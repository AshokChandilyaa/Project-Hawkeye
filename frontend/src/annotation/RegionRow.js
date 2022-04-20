import React from 'react';

const FontAwesome = require('react-fontawesome');

export default class RegionRow extends React.Component {
    render() {
        return (
            <div className={'region-row' + (this.props.focused ? ' focused-row' : '')}>
                <div className='index-container'>
                    {this.props.index+1}
                </div>
                <FontAwesome
                    className='img-placeholder'
                    name='image'
                    size='2x'
                />
                <p className='label-container'>
                    {(this.props.regionInfo.label.trim() != '' ?  this.props.regionInfo.label.trim() : '(Unlabelled)')}
                </p>
                <div className='dims-container'>
                    <div className='left-col'>
                        X: {Math.round((this.props.regionInfo.x1 + this.props.regionInfo.x0)/2)}<br/>
                        Y: {Math.round((this.props.regionInfo.y1 + this.props.regionInfo.y0)/2)}
                    </div>
                    <div className='right-col'>
                        Width: {Math.abs(Math.round(this.props.regionInfo.x1 - this.props.regionInfo.x0))}<br/>
                        Height: {Math.abs(Math.round(this.props.regionInfo.y1 - this.props.regionInfo.y0))} 
                    </div>
                </div>
                <button className='delete-button btn' onClick={() => this.props.onDelete()}>
                    <FontAwesome
                        name='trash'
                        size='2x'
                    />
                </button>
            </div>
        )

    }

}