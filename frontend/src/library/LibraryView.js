import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common.scss';
import Gallery from 'react-photo-gallery';

import SelectableImage from './SelectableImage.js';


export default class LibraryView extends React.Component {

    render() {

        return (
            <Gallery photos={this.props.photos} renderImage={(props) => {
                return (
                    <SelectableImage
                        selected={props.photo.selected || this.props.selectAll}
                        photo={props.photo}
                        onSelect={() => this.props.onImageSelect(props.photo.id)}
                    />
                )
            }} />
        )

    }

}

