import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common.scss';
import './predict.scss';

import Library from '../library/Library.js';
const FontAwesome = require('react-fontawesome');


export default class PredictionPage extends React.Component {
    // Show images for prediction
    constructor(props) {
        super(props);

    }

    render() {

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
            <div className='train-page'>
                <Library
                    createPopup={this.props.createPopup}
                    hidePopup={this.props.hidePopup}
                    photos={this.props.photos.filter(x => x.dset =='test')}
                    updatePhotos={this.props.updatePhotos}
                    dset='test'
                />
            </div>
        )

    }

}