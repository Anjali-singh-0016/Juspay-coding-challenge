import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import App from './App';
import 'tailwindcss/tailwind.css';

console.log('hi');

const container = document.getElementById('root');
const root = createRoot(container); // Create a root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);