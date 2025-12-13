import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JourneyBuilder } from '@/components/journey-builder/Canvas';
import { useJourneyStore } from '@/stores/journeyStore';
import { mockJourneys } from '@/data/mockData';

export default function JourneyBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setCurrentJourney, journeys, createJourney } = useJourneyStore();

  useEffect(() => {
    // Initialize with mock data if empty
    if (journeys.length === 0) {
      mockJourneys.forEach((j) => {
        useJourneyStore.setState((state) => ({
          journeys: [...state.journeys, j],
        }));
      });
    }

    if (id === 'new') {
      const newJourney = createJourney('Untitled Journey');
      setCurrentJourney(newJourney);
    } else if (id) {
      const journey = journeys.find((j) => j.id === id) || mockJourneys.find((j) => j.id === id);
      if (journey) {
        setCurrentJourney(journey);
      } else {
        navigate('/journeys');
      }
    }

    return () => setCurrentJourney(null);
  }, [id, journeys, createJourney, setCurrentJourney, navigate]);

  return <JourneyBuilder />;
}
