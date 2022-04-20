import React from 'react';

import RegionRow from './RegionRow.js'; 

export default class RegionsList extends React.Component {
    // Show the list of regions

    render() {

        return (
            <div className='regions-list'>
                {
                    this.props.regions.map((regionInfo, i) => <RegionRow 
                        regionInfo={regionInfo}
                        key={i}
                        index={i}
                        focused={i == this.props.focusedIndex}
                        onDelete={() => this.props.onRegionDelete(i)}
                    ></RegionRow>)
                }
            </div>
        )

    }

}