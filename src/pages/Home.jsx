import React from 'react';

import Header from '@/components/Header';

import VirtueGrid from '@/components/VirtueGrid';

import TaskInstruction from '@/components/TaskInstruction';

import BottomNavigation from '@/components/BottomNavigation';


const Home = () => {
  return (
    <>

      <Header />

      <VirtueGrid />

      <TaskInstruction />

      <BottomNavigation />

    </>
  );
};

export default Home;