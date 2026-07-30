import { Linking, Platform } from 'react-native';

export const openMaps = (latitude, longitude) => {
    if (!latitude || !longitude) return;

    const url = Platform.select({
        ios: `maps://app?daddr=${latitude},${longitude}`,
        android: `google.navigation:q=${latitude},${longitude}`
    });

    Linking.openURL(url).catch(() => {
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(webUrl);
    });
};