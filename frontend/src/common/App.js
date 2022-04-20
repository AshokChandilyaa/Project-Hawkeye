import React from 'react';
import ReactDOM from 'react-dom';
import './common.scss';

import NavBar from './NavBar.js';
import Banner from './Banner.js';
import Main from './Main.js';


export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            popup: null,
            onBackgroundClick: () => {}
        }
    }
    
    createPopup(popup, onBackgroundClick) {
        if (onBackgroundClick) {
            this.setState({popup: popup, onBackgroundClick: onBackgroundClick})
        } else {
            this.setState({popup: popup, onBackgroundClick: () => this.hidePopup()})
        }
    }

    hidePopup() {
        this.setState({popup: null, onBackgroundClick: () => {}})
    }

    render() {
        return (
            <div 
                className="app" 
            >
                <NavBar createPopup={(popup) => this.createPopup(popup)} hidePopup={() => this.hidePopup()}/>
                {/* <Banner /> */}
                <Main createPopup={(popup) => this.createPopup(popup)} hidePopup={() => this.hidePopup()}/>
                {
                    this.state.popup ? 
                    <div className='popup-container'>
                        {this.state.popup}
                        <div className='popup-bg'  onClick={(e) => this.state.onBackgroundClick(e)}></div>
                    </div> : ''
                }
                
            </div>
        );
    }
}