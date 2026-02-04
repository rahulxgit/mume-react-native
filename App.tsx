import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import RootNavigator from './src/navigation/RootNavigator';
import { setupPlayer } from './src/services/trackPlayer';
import { ThemeProvider } from './src/theme/ThemeContext';

export default function App() {
  const scheme = useColorScheme();

useEffect(() => {
  (async () => {
    try {
      await setupPlayer();
    } catch (e) {
      console.log('TrackPlayer setup error', e);
    }
  })();
}, []);


  return (
    <ThemeProvider>
      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar
          barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <RootNavigator />
              <Toast />

      </NavigationContainer>
    </ThemeProvider>
  );
}
