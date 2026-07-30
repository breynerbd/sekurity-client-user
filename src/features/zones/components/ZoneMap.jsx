import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

export default function ZoneMap({ latitude, longitude, radius, compact = false, interactive = false, onLocationSelect }) {
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);

    const lat = latitude || 14.6349;
    const lng = longitude || -90.5069;

    const mapRadius = radius || 550;

    const circleScript = `
        L.circle([${lat}, ${lng}], {
             radius: ${mapRadius},
             color: '#2563EB',
             fillColor: '#2563EB',
             fillOpacity: 0.15,
             weight: 1.5,
        }).addTo(map);
    `;

    const interactiveScript = interactive ? `
        let currentMarker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

        function updateCoords(latlng) {
            postToRN('locationSelected', { latitude: latlng.lat, longitude: latlng.lng });
        }

        map.on('click', function(e) {
            currentMarker.setLatLng(e.latlng);
            updateCoords(e.latlng);
        });

        currentMarker.on('dragend', function(e) {
            updateCoords(e.target.getLatLng());
        });
    ` : `
        L.marker([${lat}, ${lng}]).addTo(map);
    `;

    const mapHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
        .leaflet-control-attribution { display: none !important; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        function postToRN(type, payload) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type, payload }));
          }
        }
        try {
          if (typeof L === 'undefined') {
            postToRN('error', 'Leaflet no se cargó (sin internet o CDN bloqueado)');
          } else {
            const map = L.map('map', {
              zoomControl: ${compact ? 'false' : 'true'},
              dragging: ${compact ? 'false' : 'true'},
              scrollWheelZoom: false,
              doubleClickZoom: ${compact ? 'false' : 'true'},
              attributionControl: false,
            }).setView([${lat}, ${lng}], ${compact ? 14 : 15});

            L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
              maxZoom: 20,
              subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
              attribution: '&copy; Google Maps',
            }).addTo(map);

            ${circleScript}
            ${interactiveScript}
            
            postToRN('ready');
          }
        } catch (e) {
          postToRN('error', e.message);
        }
      </script>
    </body>
  </html>
`;

    const handleMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'ready') {
                setLoading(false);
                setErrorMsg(null);
            } else if (data.type === 'error') {
                setLoading(false);
                setErrorMsg(data.payload || 'Error desconocido al cargar el mapa');
            } else if (data.type === 'locationSelected' && onLocationSelect) {
                onLocationSelect(data.payload);
            }
        } catch { }
    };

    return (
        <View style={[styles.mapContainer, compact && styles.mapContainerCompact]}>
            <WebView
                originWhitelist={['*']}
                source={{ html: mapHtml }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                style={styles.webview}
                scalesPageToFit={true}
                mixedContentMode="always"
                onMessage={handleMessage}
                pointerEvents={compact ? "none" : "auto"}
            />

            {loading && !errorMsg && (
                <View style={styles.overlay}>
                    <ActivityIndicator size={compact ? "small" : "large"} color="#2563EB" />
                    {!compact && <Text style={styles.overlayText}>Cargando mapa…</Text>}
                </View>
            )}

            {errorMsg && !compact && (
                <View style={styles.overlay}>
                    <Text style={styles.errorText}>No se pudo cargar el mapa</Text>
                    <Text style={styles.errorDetail}>{errorMsg}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        height: 220,
        width: '100%',
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: '#EFF6FF',
    },
    mapContainerCompact: {
        flex: 1,
        width: "100%",
        height: "100%",
        borderRadius: 0,
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EFF6FF',
        gap: 8,
        paddingHorizontal: 16,
    },
    overlayText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
    },
    errorText: {
        fontSize: 13,
        color: '#DC2626',
        fontWeight: '700',
    },
    errorDetail: {
        fontSize: 11,
        color: '#475569',
        textAlign: 'center',
    },
});