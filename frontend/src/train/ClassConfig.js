import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common.scss';
import './train.scss';

import Select from 'react-select';
import FontAwesome from 'react-fontawesome';

export default class ClassConfig extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            labels:this.props.labels,
            newLabel:""
        }
    }


    confirmLabels() {
        this.props.hidePopup();
        const requestPath = 'http://localhost:5000/projects/1/labels'
        const updatedLabels = this.state.labels
        const toDelete = this.props.labels.filter(x => !(updatedLabels.includes(x)))
        const toPost = updatedLabels.filter(x => !(this.props.labels.includes(x)))
        console.log(toPost)
        fetch(requestPath, {
            method: "DELETE",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Request-Method': 'DELETE',
                'Access-Control-Request-Headers': 'X-PINGOTHER, Content-Type',
            },
            body: JSON.stringify(toDelete)
        })

        fetch(requestPath, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'X-PINGOTHER, Content-Type',
            },
            body: JSON.stringify(toPost)
        })
        
        
    }

    addClass(){
        console.log(this.state.labels)
        this.setState({
            labels:Array.from(this.state.labels.concat([{"text":this.state.newLabel}]))
        })
    }

    handleChange(event) {
        this.setState({
            newLabel:event.target.value
        })
    }

    render() {

        return (
            <div className='train-config'>
                <div className='model-name-container'>
                    Add classes:
                    <input type='text' id= "newLabel" name= "newLabel" defaultValue={this.state.newLabel} onChange={this.handleChange.bind(this)} />
                </div>
 
                    <div className='advanced-options-container'>
                        <span>Labels to train on:</span>
                        <div className="class-list">
                            {this.state.labels.map(x=> <div><span>{x.text}</span><button className="btn" onClick={()=> {this.setState({labels:this.state.labels.filter(y=>y!=x)})}}style={{marginLeft: "10px"}}>Remove</button></div>)}
                        </div>

                    </div>
                

                <div className='buttons-container'>
                    <button className='primary-btn btn' onClick={() => this.confirmLabels()}>Confirm classes</button>
                    <button className='btn' onClick={this.props.hidePopup}>Cancel</button>
                    <button className='btn' onClick={() => this.addClass()}>Add class</button>
                </div>
            </div>
        )

    }

}