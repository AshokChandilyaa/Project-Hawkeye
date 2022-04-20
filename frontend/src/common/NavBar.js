import React from 'react';
import ReactDOM from 'react-dom';
import './common.scss';

import logo from '../res/logo.png';
import { Link } from 'react-router-dom';

import TrainPopup from '../train/TrainPopup.js';
const FontAwesome = require('react-fontawesome');

export default class NavBar extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='navbar'>
                <div className='logo-container'>
                    <img className='logo' src={logo} alt='logo'></img>
                    <h2>
                        <Link to ='/'>
                            HawkeyeVision
                        </Link>
                    </h2>
                </div>
                <div className='vert-separator'></div>
                <Link to='/images'>
                    Images
                </Link>
                <div className='vert-separator'></div>
                <Link to='/train'>
                    Train
                </Link>
                <div className='vert-separator'></div>
                <Link to='/predict'>
                    Predict
                </Link>
                <div className='vert-separator'></div>

                {/* <button onClick={() => {fetch('http://localhost:5000/api/v1/projects/1/reset/'); window.location.reload(false);}}>
                    Reset DB <FontAwesome size='lg' name='undo'/>
                </button> */}
            </div>
        )
    }

}