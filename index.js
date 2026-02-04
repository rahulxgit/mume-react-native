import 'react-native-gesture-handler';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// ❌ COMMENT THIS OUT FOR NOW
// import TrackPlayer from 'react-native-track-player';
// import playbackService from './src/services/playbackService';
// TrackPlayer.registerPlaybackService(() => playbackService);

AppRegistry.registerComponent(appName, () => App);
