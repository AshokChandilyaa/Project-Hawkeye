import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import '../common/common.scss';
import './library.scss';

const FontAwesome = require('react-fontawesome');

export default class SelectableImage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hovered: false
        }
    }

    render() {
        return (
            <div 
                class='img-container no-drag'
                onMouseEnter = {() => this.setState({hovered: true})}
                onMouseLeave = {() => this.setState({hovered: false})}
                ref = {(ref) => this.ref = ref}
            >
                <div 
                    class='checkmark-container' 
                    style={{display: (this.state.hovered || this.props.selected) ? 'block' : 'none'}}
                    onClick = {() => this.props.onSelect()}
                >
                    <div class='checkmark-bg'></div>
                    <FontAwesome
                        name='check-circle'
                        style={{color: this.props.selected ? ' rgb(56, 157, 252)' : 'rgb(165,165,165)'}}
                    />
                </div>
                
                <Link to={'/annotation/' + this.props.photo.index}>
                    <img
                        {...this.props.photo}
                    >
                    </img>
                </Link>
                
            </div>
        )

    }

    componentDidUpdate() {
        this.ref.addEventListener('mousedown', () => {
            this.ref.classList.remove('bounce');  // reset animation
            void this.ref.offsetWidth; // trigger reflow
            this.ref.classList.add('bounce');  // start animation
        })
    }

}