import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common.scss';
import './images.scss';

import Library from '../library/Library.js';


const FontAwesome = require('react-fontawesome');

export default class ImagePage extends React.Component {
    // Show images in the training set

    constructor(props) {
        super(props);
        this.state = {
            ids:[],
            viewLabelled: false,
            labelled: [],
            unlabelled:[]
        }
    }

    componentDidMount() {
        const urlPath="http://localhost:5000/projects/1/images/labelled"
        fetch(urlPath)
            .then(res => res.json())
            .then((result) => {
                this.setState({
                    ids:result
                })
            }
            )
        }
    
    componentDidUpdate(prevProps, prevState){
        console.log(this.state.ids)
        if (this.props.photos !==prevProps.photos){
            this.setState({
                labelled: this.props.photos.filter(x=> this.state.ids.includes(x.id) && x.dset == "train"),
                unlabelled: this.props.photos.filter(x=> !(this.state.ids.includes(x.id)) && x.dset == "train") 
            })
        }

        if (this.state.ids !== prevState.ids) {
            this.setState({
                labelled: this.props.photos.filter(x=> this.state.ids.includes(x.id) && x.dset == "train"),
                unlabelled: this.props.photos.filter(x=> !(this.state.ids.includes(x.id)) && x.dset == "train") 
            })
        }

    }
    onTrainClickHandler() {

    }

    render() {

        return (
            <div className='train-page'>
                <div className='sidebar'>
                    <p>Currently viewing:</p>
                    <div className='radio-container'>
                        <input
                            type='radio' name='option' defaultChecked='true' id='unlabelled'
                            onChange={() => this.setState({ viewLabelled: false })}
                        />
                        <label htmlFor='unlabelled'>Unlabelled images</label>
                    </div>
                    <div className='radio-container'>
                        <input
                            type='radio' name='option' id='labelled'
                            onChange={() => this.setState({ viewLabelled: true })}
                        />
                        <label htmlFor='labelled'>Labelled images</label>
                    </div>
                </div>
                <Library
                    createPopup={this.props.createPopup}
                    hidePopup={this.props.hidePopup}
                    photos={this.state.viewLabelled ? this.state.labelled: this.state.unlabelled}
                    updatePhotos={this.props.updatePhotos}
                    dset='train'
                >  
                </Library>
            </div>
        )

    }

}