import React from 'react';
import ReactDOM from 'react-dom';
import './common/common.scss';

import App from './common/App.js';
import { BrowserRouter } from 'react-router-dom';

  // ========================================
  
ReactDOM.render((
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  ), document.getElementById('root')
);
  