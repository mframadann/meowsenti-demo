import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import SentimentAnalyzer from './components/sentiment-analyzer';
import { Toaster } from './components/ui/toaster';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className='flex items-center justify-center h-screen p-2 md:p-0'>
      <Toaster />
      <SentimentAnalyzer />
    </div>
  </StrictMode>
);
