import React from 'react';

const FontAwesome = require('react-fontawesome');

export default class LabelRow extends React.Component {
    render() {
        return (
            <div className={'region-row' + (this.props.focused ? ' focused-row' : '')}>
                <div className='index-container'>
                    {this.props.label.id}
                </div>
                <p className='label-container'>
                    {this.props.label.text}
                </p>
            </div>
        )

    }

}