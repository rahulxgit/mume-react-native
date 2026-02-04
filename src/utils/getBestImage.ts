export const getBestImage = (image?: { url: string }[]) =>
  image?.[2]?.url || image?.[1]?.url || image?.[0]?.url || '';
