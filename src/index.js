import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import { StudentProvider } from './context/StudentContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <StudentProvider>
        <App />
    </StudentProvider>
);