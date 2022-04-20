import { render } from '@testing-library/react';
import React, { Component } from 'react';
import Dropzone, { useDropzone } from 'react-dropzone';
const FontAwesome = require('react-fontawesome');

export default function UploadButton(props) {
    const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

    const files = acceptedFiles.map(file => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
        </li>
    ));


        return (
            <span {...getRootProps({ className: 'dropzone' })}>
                <button>
                    <input {...getInputProps()} />
                    <p><FontAwesome
                        name='upload'
                    />Upload Files</p>
                </button>
            </span>
        )


}
