import React from 'react';
import ReactDOM from 'react-dom';
import './common.scss';

const FontAwesome = require('react-fontawesome')

export default class Banner extends React.Component {

    render() {
        return (
            <div className='wip-banner'>
                <FontAwesome
                    name='exclamation-triangle'
                    size='2x'
                />
                <div>
                    <span className='marquee'>UNDER CONSTRUCTION: Most features will likely be missing / unfinished.</span>
                </div>
                <FontAwesome
                    name='exclamation-triangle'
                    size='2x'
                />
            </div >
        )
    }

}