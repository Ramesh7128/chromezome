import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Dashboard.css';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, Box, VStack, Heading, Button } from '@chakra-ui/react';

function Dashboard() {
  const [tabGroups, setTabGroups] = useState([]);

  useEffect(() => {
    loadSavedGroups();
  }, []);

  const loadSavedGroups = () => {
    chrome.storage.local.get({tabGroups: []}, (result) => {
      setTabGroups(result.tabGroups);
    });
  };

  const openTabs = (urls) => {
    urls.forEach(url => {
      chrome.tabs.create({url: url});
    });
  };

  const deleteGroup = (index) => {
    const newTabGroups = tabGroups.filter((_, i) => i !== index);
    chrome.storage.local.set({tabGroups: newTabGroups}, () => {
      setTabGroups(newTabGroups);
    });
  };

  return (
    <div className="Dashboard">
      <h1>Chromezome</h1>
      {tabGroups.map((group, index) => (
        <div key={index} className="card">
          <span className="card-name" onClick={() => openTabs(group.urls)}>{group.name}</span>
          <button className="delete-btn" onClick={() => deleteGroup(index)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);


root.render(
  <React.StrictMode>
    <ChakraProvider>
      <Dashboard />
    </ChakraProvider>
  </React.StrictMode>
);