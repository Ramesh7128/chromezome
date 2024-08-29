import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './Popup.css';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, Box, Flex, VStack, Heading, Button, Divider, Image, Icon } from '@chakra-ui/react';
import theme from '../theme';
import { FaClone, FaArchive, FaWindowClose, FaColumns } from "react-icons/fa";

function Popup() {
  const [isSavingTabs, setIsSavingTabs] = useState(false);
  const [isClosingTabs, setIsClosingTabs] = useState(false);
  const [isOpeningDashboard, setIsOpeningDashboard] = useState(false);
  const [isSavingAndClosing, setIsSavingAndClosing] = useState(false);

  const saveCurrentTabs = () => {
    setIsSavingTabs(true);
    chrome.tabs.query({currentWindow: true}, (tabs) => {
      const tabGroup = {
        id: Date.now(),
        name: `Tabs saved on ${new Date().toLocaleString()}`,
        urls: tabs.map(tab => tab.url)
      };
      
      chrome.storage.local.get({tabGroups: []}, (result) => {
        const tabGroups = result.tabGroups;
        tabGroups.push(tabGroup);
        chrome.storage.local.set({tabGroups: tabGroups}, () => {
          console.log("Tabs saved successfully");
          setIsSavingTabs(false);
        });
      });
    });
  };

  const closeAllTabs = () => {
    setIsClosingTabs(true);
    chrome.tabs.query({currentWindow: true, active: false}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.remove(tab.id);
      });
      console.log("Tabs closed successfully");
      setIsClosingTabs(false);
    });
  };

  const saveAndCloseAllTabs = () => {
    setIsSavingAndClosing(true);
    chrome.tabs.query({currentWindow: true}, (tabs) => {
      const tabGroup = {
        id: Date.now(),
        name: `Tabs saved on ${new Date().toLocaleString()}`,
        urls: tabs.map(tab => tab.url)
      };
      
      chrome.storage.local.get({tabGroups: []}, (result) => {
        const tabGroups = result.tabGroups;
        tabGroups.push(tabGroup);
        chrome.storage.local.set({tabGroups: tabGroups}, () => {
          console.log("Tabs saved successfully");
          // Now close all tabs except the active one
          chrome.tabs.query({currentWindow: true, active: false}, (tabsToClose) => {
            tabsToClose.forEach(tab => {
              chrome.tabs.remove(tab.id);
            });
            console.log("Tabs closed successfully");
            setIsSavingAndClosing(false);
          });
        });
      });
    });
  };

  const openDashboard = () => {
    setIsOpeningDashboard(true);
    chrome.tabs.create({url: 'dashboard.html'}, () => {
      console.log("Dashboard opened");
      setIsOpeningDashboard(false);
    });
  };

  return (
    <Box p={4} width="300px">
      <VStack spacing={2} align="stretch">
        <Flex align="center">
          <Image src="icons/icon48.png" alt="Chromezome logo" boxSize="32px" mr={2} />
          <Heading size="md">Chromezome</Heading>
        </Flex>
        <Divider height="2px" backgroundColor="black"/>
        <VStack mt="2" spacing={2} align="stretch">
          <Button
            size='sm'
            rightIcon={<FaClone />}
            isLoading={isSavingTabs}
            loadingText='Saving Tabs'
            colorScheme='teal'
            onClick={saveCurrentTabs}
          >
            Save All Tabs
          </Button>
          <Button
            size='sm'
            rightIcon={<FaArchive />}
            isLoading={isSavingAndClosing}
            loadingText='Saving and Closing Tabs'
            colorScheme='teal'
            onClick={saveAndCloseAllTabs}
          >
            Save And Close All Tabs
          </Button>
          <Button
            size='sm'
            rightIcon={<FaWindowClose />}
            isLoading={isClosingTabs}
            loadingText='Closing Tabs'
            colorScheme='red'
            onClick={closeAllTabs}
          >
            Close All Tabs
          </Button>
          <Button
            size='sm'
            rightIcon={<FaColumns />}
            isLoading={isOpeningDashboard}
            loadingText='Opening Dashboard'
            colorScheme='teal'
            onClick={openDashboard}
          >
            Open Dashboard
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Box bg="white" borderRadius="5px" overflow="hidden">
        <Popup />
      </Box>
    </ChakraProvider>
  </React.StrictMode>
);
