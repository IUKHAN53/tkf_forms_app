import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type UseLocationReturn = {
  loading: boolean;
  coordinates: Coordinates | null;
  getLocation: () => Promise<Coordinates | null>;
};

export function useLocation(): UseLocationReturn {
  const [loading, setLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const getLocation = useCallback(async (): Promise<Coordinates | null> => {
    try {
      setLoading(true);

      // Request permissions first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get GPS coordinates. Please enable it in your device settings.'
        );
        return null;
      }

      // Check if location services are enabled
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        Alert.alert(
          'Location Disabled',
          'Please enable Location/GPS in your device settings and try again.',
          [{ text: 'OK' }]
        );
        return null;
      }

      // Try to get last known position first (faster)
      try {
        const lastKnown = await Location.getLastKnownPositionAsync({
          maxAge: 60000, // Accept positions from last 60 seconds
          requiredAccuracy: 100, // Within 100 meters
        });
        
        if (lastKnown) {
          const coords: Coordinates = {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          };
          setCoordinates(coords);
          Alert.alert('Success', `GPS coordinates captured\nAccuracy: ~${Math.round(lastKnown.coords.accuracy || 0)}m`);
          return coords;
        }
      } catch (e) {
        // Last known not available, continue to get current
        console.log('Last known position not available, fetching current...');
      }

      // Try getCurrentPositionAsync with different accuracy levels
      let location = null;
      const accuracyLevels = [
        Location.Accuracy.Low,
        Location.Accuracy.Balanced,
        Location.Accuracy.High,
      ];

      for (const accuracy of accuracyLevels) {
        try {
          location = await Promise.race([
            Location.getCurrentPositionAsync({
              accuracy,
              mayShowUserSettingsDialog: true,
            }),
            // Timeout after 10 seconds per attempt
            new Promise<null>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 10000)
            ),
          ]);
          
          if (location) break;
        } catch (e) {
          console.log(`Failed with accuracy ${accuracy}, trying next...`);
          continue;
        }
      }

      if (location) {
        const coords: Coordinates = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCoordinates(coords);
        Alert.alert('Success', `GPS coordinates captured\nAccuracy: ~${Math.round(location.coords.accuracy || 0)}m`);
        return coords;
      }

      // Final fallback - try with no accuracy requirements
      try {
        const fallback = await Location.getLastKnownPositionAsync({});
        if (fallback) {
          const coords: Coordinates = {
            latitude: fallback.coords.latitude,
            longitude: fallback.coords.longitude,
          };
          setCoordinates(coords);
          Alert.alert(
            'Location Retrieved',
            'Using cached location. For more accurate readings, please go outdoors and try again.'
          );
          return coords;
        }
      } catch (e) {
        // Ignore
      }

      Alert.alert(
        'Location Unavailable',
        'Could not get GPS coordinates. Please try:\n\n• Go outdoors or near a window\n• Enable High Accuracy mode in Location settings\n• Wait a few seconds and try again'
      );
      return null;
    } catch (error: any) {
      console.error('Location error:', error);
      
      const errorMessage = error?.message || 'Unknown error';
      
      if (errorMessage.includes('unavailable')) {
        Alert.alert(
          'GPS Unavailable', 
          'Location services are temporarily unavailable. Please:\n\n• Check if GPS is enabled\n• Try again in a few seconds\n• Move to an area with better GPS signal'
        );
      } else {
        Alert.alert('Location Error', `Failed to get location: ${errorMessage}`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, coordinates, getLocation };
}
