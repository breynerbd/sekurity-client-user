import { Linking, Platform } from 'react-native';

export const openMaps = (latitude, longitude) => {
    if (!latitude || !longitude) return;

    if (Platform.OS === 'web') {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        window.open(webUrl, '_blank');
        return;
    }

    const url = Platform.select({
        ios: `maps://app?q=${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`
    });

    Linking.openURL(url).catch(() => {
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        Linking.openURL(webUrl);
    });
};