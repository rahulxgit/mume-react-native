import TrackPlayer, { Capability } from 'react-native-track-player';

let isReady = false;

export async function setupPlayer() {
  if (isReady) return;

  await TrackPlayer.setupPlayer();

  await TrackPlayer.updateOptions({
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Stop,
    ],
    compactCapabilities: [Capability.Play, Capability.Pause],
  });

  isReady = true;
}

export async function playSong(track: {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
}) {
  await TrackPlayer.reset();
  await TrackPlayer.add(track);
  await TrackPlayer.play();
}
