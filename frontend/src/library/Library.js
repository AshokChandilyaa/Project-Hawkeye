import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common.scss';
import './library.scss';
import Dropzone from "../dropzone/Dropzone";
import LibraryView from './LibraryView.js';
import UploadPopup from '../upload/UploadPopup.js';
import DeletePopup from './DeletePopup.js';

const urlBasePath = 'http://localhost:5000/projects/1'

const FontAwesome = require('react-fontawesome');
const perPage=10
export default class Library extends React.Component {
    // General photo viewer
    constructor(props) {
        super(props);
        this.state = {
            uploadImages: [],
            uploading: false,
            uploadProgress: {},
            currentPage: 0,
            maxPage : 0
        }
        this.selectAll = false;
        this.showPopup = false;
        this.upload360 = false
        this.dset = this.props.dset
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.photos != prevProps.photos) {
            this.setState({
                currentPage : 0,
                maxPage : Math.max(Math.floor((this.props.photos.length-1)/perPage),0)
            })
        }
    }
    onImageSelectHandler(id) {
        const newPhotos = this.props.photos.slice();
        for (const photo of newPhotos) {
            if (photo.id == id) {
                photo.selected = !photo.selected;
                break;
            }
        }
        this.props.updatePhotos(newPhotos);
    }

    onSelectAllHandler() {
        const newPhotos = this.props.photos.slice();
        for (const photo of newPhotos) {
            photo.selected = this.selectAll;
        }
        this.props.updatePhotos(newPhotos);
    }

    loadImagesWithLabels() {
        const requestPath = `${urlBasePath}/images`
        fetch(requestPath)
            .then(res => res.json())
            .then((result) => { this.setState({ labelledImages: result }) });
    }

    componentDidMount() {
        this.setState({
            maxPage: Math.floor(this.props.photos.length/perPage)
        })
    }

    onFilesAdded(files) {
        this.setState({ uploadImages: files }, () => this.createUploadPopup());
    }

    popupCancel = () => {
        this.setState({ uploadImages: [], uploading: false });
        this.showPopup = false;
        this.props.hidePopup();
    }

    popupConfirm = () => {
        this.uploadFiles();
        this.showPopup = false;
        this.props.hidePopup();
    }

    deleteCancel = () => {
        this.showPopup = false;
        this.props.hidePopup();
    }

    deleteConfirm = () => {
        this.showPopup = false;
        this.props.hidePopup();
        let photos = this.props.photos.slice(),
        i = 0,
        end = photos.length;

    while (i < end) {
        if (photos[i].selected) {
            const requestPath = `${urlBasePath}/images/${photos[i].id}`;
            fetch(requestPath, {'method':'DELETE'});
            photos.splice(i, 1);
            i--;
            end--;
        }
        i++;
    }
    this.props.updatePhotos(photos);
    }

    async uploadFiles() {
        this.setState({ uploadProgress: {}, uploading: true });
        // Testing model
        if (this.dset == 'test') {
            var requestPath = `${urlBasePath}/images/test`
        }
        else { // uploading photos to training set
            var requestPath = `${urlBasePath}/images`
        }
        // Append 360 to the url if uploading 360 images

        const promises = [];
        this.state.uploadImages.forEach(file => {
            promises.push(this.sendRequest(file, requestPath));
        });
        try {
            await Promise.all(promises);
            this.setState({ successfullUploaded: true, uploading: false, uploadImages: [] });
            window.location.reload(false);
        } catch (e) {
            // Not Production ready! Do some error handling here instead...
            this.setState({ uploading: false });
        }
    }

    sendRequest(file, requestPath) {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.upload.addEventListener("progress", event => {
                if (event.lengthComputable) {
                    const copy = { ...this.state.uploadProgress };
                    copy[file.name] = {
                        state: "pending",
                        percentage: (event.loaded / event.total) * 100
                    };
                    this.setState({ uploadProgress: copy });
                }
            });

            req.upload.addEventListener("load", event => {
                const copy = { ...this.state.uploadProgress };
                copy[file.name] = { state: "done", percentage: 100 };
                this.setState({ uploadProgress: copy });
                resolve(req.response);
            });

            req.upload.addEventListener("error", event => {
                const copy = { ...this.state.uploadProgress };
                copy[file.name] = { state: "error", percentage: 0 };
                this.setState({ uploadProgress: copy });
                reject(req.response);
            });

            const formData = new FormData();
            formData.append("file", file, file.name);
            req.open("POST", requestPath);
            req.send(formData);
        });
    }

    deleteClick() {
        this.props.createPopup(
            <DeletePopup
                popupConfirm={this.deleteConfirm}
                popupCancel={this.deleteCancel}
            />
        );


    }

    createUploadPopup() {
        this.props.createPopup(
            <UploadPopup
                files={this.state.uploadImages}
                popupConfirm={this.popupConfirm}
                popupCancel={this.popupCancel}
            />
        );
    }

    render() {
        let photoSelected = false;
        for (const photo of this.props.photos) {
            if (photo.selected) {
                photoSelected = true;
                break;
            }
        }
        return (
            <div className='library-container'>
                <div className='library-buttons-container'>
                    <Dropzone
                        onFilesAdded={(files) => this.onFilesAdded(files)}
                        disabled={this.state.uploading} />
                    <button className='select-btn' onClick={() => {
                        this.selectAll = !this.selectAll;
                        this.onSelectAllHandler();
                    }}>
                        <FontAwesome
                            name='check'
                        />
                    Toggle select all
                    </button>
                    <button className={'del-btn' + (!photoSelected ? ' disabled' : '')} onClick={() => this.deleteClick()}>
                        <FontAwesome
                            name='trash'
                        />
                        Delete selected
                    </button>
                </div>
                <LibraryView
                    selectAll={this.state.selectAll}
                    photos={this.state.currentPage == this.maxPage ? this.props.photos.slice(perPage*this.state.currentPage, this.props.photos.length) : this.props.photos.slice(perPage*this.state.currentPage, perPage*this.state.currentPage + perPage)}
                    onImageSelect={(id) => this.onImageSelectHandler(id)}
                />
                {this.props.children}
                <div className='abs-btn-container'>
                    {this.state.currentPage != 0 ? 
                    <button className='btn secondary-btn previous-btn abs-btn' onClick={() => {this.setState({currentPage : this.state.currentPage - 1})}}>
                        <span>Previous Page</span>
                    </button> : <div></div>
                    }
                    {this.state.currentPage != this.state.maxPage ?                   
                    <button className='btn secondary-btn next-btn abs-btn' onClick={() => {this.setState({currentPage : this.state.currentPage + 1})}}>
                        <span>Next Page</span>
                    </button> : <div></div>
                    }
                </div>   
            </div>
        )
    }

}