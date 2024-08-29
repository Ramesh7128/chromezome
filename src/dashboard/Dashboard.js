import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Dashboard.css';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, Box, Divider, Icon, IconButton, Heading, Button, Image, Text, Flex, HStack } from '@chakra-ui/react';
import { FaClone, FaExternalLinkAlt, FaExternalLinkSquareAlt, FaTrashAlt } from "react-icons/fa";

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

  const deleteGroup = (index) => {
    const newTabGroups = tabGroups.filter((_, i) => i !== index);
    chrome.storage.local.set({tabGroups: newTabGroups}, () => {
      setTabGroups(newTabGroups);
    });
  };

  const deleteTab = (groupIndex, tabIndex) => {
    const newTabGroups = [...tabGroups];
    newTabGroups[groupIndex].urls.splice(tabIndex, 1); // Remove the tab from the group
    chrome.storage.local.set({tabGroups: newTabGroups}, () => {
      setTabGroups(newTabGroups);
    });
  };

  const openAllTabs = (urls) => {
    urls.forEach(tab => {
      chrome.tabs.create({url: tab.url});
    });
  };

  console.log(tabGroups)

  return (
    <div className="Dashboard">
      <Heading size="xl" mb="5">Chromezome</Heading>
      <Divider height="4px" mb="4" backgroundColor="black"/>
      {tabGroups.map((group, index) => (
        <Box key={index} borderWidth="1px" borderRadius="lg" overflow="hidden" mb={4} p={4}>
          <Flex align="center" justify="space-between">
            <Heading as="h2" size="md" mb={2}>{group.name}</Heading>
            <HStack spacing={4} mb={4}>
              <Button size="sm" onClick={() => openAllTabs(group.urls)} colorScheme="teal">
                Open All Tabs
              </Button>
              <Button size="sm" onClick={() => deleteGroup(index)} colorScheme="red">
                Delete Group
              </Button>
            </HStack>
          </Flex>
          <Divider height="4px" backgroundColor="black"/>
          <Flex flexWrap="wrap">
            {group.urls.map((tab, tabIndex) => (
              <Box key={tabIndex} width="200px" m={2} border="1px" borderRadius="lg" shadow="md" _hover={{ transform: 'scale(1.1)', zIndex: 2 }} overflow="hidden" p={2}>
                <Flex alignItems="center" mb={2}>
                  <Image 
                    src={tab.favicon || 'path/to/default/favicon.png'} 
                    alt="Favicon"
                    boxSize="16px"
                    mr={2}
                  />
                  <Text fontSize="sm" isTruncated>{tab.title}</Text>
                </Flex>
                <Flex justify="flex-end">
                  <Button size="xs" rightIcon={<FaExternalLinkAlt />} colorScheme='teal' variant='solid' onClick={() => chrome.tabs.create({url: tab.url})}>
                    Open
                  </Button>
                  <IconButton variant="link" colorScheme="red" onClick={() => deleteTab(index, tabIndex)}> 
                    <FaTrashAlt />
                  </IconButton>
                </Flex>
              </Box>
            ))}
          </Flex>
        </Box>
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