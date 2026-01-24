import { useState, useEffect } from 'react';
import { MOCK_ROUTE, Coordinate } from '../utils/mockData';

export const useGPS = (isPlaying: boolean = true, speedMultiplier: number = 1) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentData, setCurrentData] = useState<Coordinate | null>(null);
  const [history, setHistory] = useState<Coordinate[]>([]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % MOCK_ROUTE.length;
        return next;
      });
    }, 1000 / speedMultiplier);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier]);

  useEffect(() => {
    const data = MOCK_ROUTE[currentIndex];
    const dataWithTime = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    setCurrentData(dataWithTime);
    
    // Keep track of history for the trail
    setHistory((prev) => {
       // If we looped back to start, reset history or handle it. 
       // For now let's just append, but if index is 0, reset.
       if (currentIndex === 0) return [dataWithTime];
       return [...prev, dataWithTime];
    });
  }, [currentIndex]);

  return { currentData, currentIndex, history, fullRoute: MOCK_ROUTE };
};
