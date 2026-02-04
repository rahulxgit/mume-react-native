import TrackPlayer, { Event } from 'react-native-track-player';
import { usePlayerStore } from '../store/playerStore';

export default async function playbackService() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    usePlayerStore.getState().playNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    usePlayerStore.getState().playPrevious();
  });
}
