import React from 'react';
import { FullPageChatAssistant } from '../components/FullPageChatAssistant';

interface HomeProps {
  setCurrentTab: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = () => {
  return (
    <FullPageChatAssistant />
  );
};
