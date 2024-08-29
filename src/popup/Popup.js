import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './Popup.css';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, Box, Flex, VStack, Heading, Button, Divider, Image, Icon } from '@chakra-ui/react';
import theme from '../theme';
import { FaClone, FaArchive, FaWindowClose, FaColumns } from "react-icons/fa";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function Popup() {
  const [isSavingTabs, setIsSavingTabs] = useState(false);
  const [isClosingTabs, setIsClosingTabs] = useState(false);
  const [isOpeningDashboard, setIsOpeningDashboard] = useState(false);
  const [isSavingAndClosing, setIsSavingAndClosing] = useState(false);

  const captureTabScreenshot = async (tab) => {
    return new Promise((resolve) => {
      chrome.tabs.captureVisibleTab(tab.windowId, { format: 'jpeg', quality: 50 }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          resolve(null);
        } else {
          resolve(dataUrl);
        }
      });
    });
  };

  const captureTabThumbnails = async (tabs) => {
    const capturedTabs = [];
    for (const tab of tabs) {
      try {
        await chrome.tabs.update(tab.id, { active: true });
        await new Promise(resolve => setTimeout(resolve, 250)); // Wait for tab to become visible
        const screenshot = await captureTabScreenshot(tab);
        const resizedScreenshot = await resizeImage(screenshot, 200, 150);
        capturedTabs.push({...tab, thumbnail: resizedScreenshot.split(',')[1]}); // Remove the data URL prefix
      } catch (error) {
        console.error(`Failed to capture thumbnail for tab ${tab.id}:`, error);
        capturedTabs.push({...tab, thumbnail: null});
      }
    }
    return capturedTabs;
  };

  // Helper function to resize the image
  const resizeImage = (dataUrl, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const img = new window.Image();  // Use window.Image instead of Image
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = dataUrl;
    });
  };

  const captureTabInfo = (tabs) => {
    return tabs.map(tab => ({
      url: tab.url,
      title: tab.title,
      favicon: tab.favIconUrl || null
    }));
  };

  const saveCurrentTabs = () => {
    setIsSavingTabs(true);
    chrome.tabs.query({currentWindow: true}, (tabs) => {
      const tabData = captureTabInfo(tabs);

      const tabGroup = {
        id: Date.now(),
        name: `Tabs saved on ${new Date().toLocaleString()}`,
        urls: tabData
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
    chrome.tabs.query({currentWindow: true}, async (tabs) => {
      const tabData = await captureTabThumbnails(tabs);

      const tabGroup = {
        id: Date.now(),
        name: `Tabs saved on ${new Date().toLocaleString()}`,
        urls: tabData.map(tab => ({
          url: tab.url,
          title: tab.title,
          thumbnail: tab.thumbnail
        }))
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
