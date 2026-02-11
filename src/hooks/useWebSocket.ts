import { useEffect, useState, useCallback } from 'react';
import { WS_URL } from '../config/api';

interface TruckPosition {
  id: string;
  registration_number: string;
  latitude: number;
  longitude: number;
  status: string;
  speed: number;
  trips_completed: number;
  last_update: string | null;
}

interface WebSocketMessage {
  type: string;
  data: TruckPosition[];
  timestamp: string;
}

export const useWebSocket = () => {
  const [truckPositions, setTruckPositions] = useState<TruckPosition[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connect = useCallback(() => {
    try {
      const websocket = new WebSocket(WS_URL);

      websocket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      websocket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          if (message.type === 'truck_positions' && message.data) {
            setTruckPositions(message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (document.visibilityState === 'visible') {
            connect();
          }
        }, 5000);
      };

      setWs(websocket);

      return websocket;
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const websocket = connect();

    // Cleanup on unmount
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [connect]);

  // Keep connection alive with ping
  useEffect(() => {
    if (!ws || !isConnected) return;

    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 30000); // Send ping every 30 seconds

    return () => clearInterval(interval);
  }, [ws, isConnected]);

  return {
    truckPositions,
    isConnected,
  };
};
