import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';

let leafletLoadingPromise = null;

function loadLeaflet() {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('No hay entorno de navegador disponible'));
    }
    if (window.L) return Promise.resolve(window.L);
    if (leafletLoadingPromise) return leafletLoadingPromise;

    leafletLoadingPromise = new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        script.onerror = () => reject(new Error('No se pudo cargar Leaflet (sin internet o CDN bloqueado)'));
        document.body.appendChild(script);
    });

    return leafletLoadingPromise;
}

export default function ZoneMap({ latitude, longitude, radius, compact = false, interactive = false, onLocationSelect }) {
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState(null);
    const containerRef = useRef(null);
    const mapRef = useRef(null);

    const lat = latitude || 14.6349;
    const lng = longitude || -90.5069;
    const mapRadius = radius || 550;

    useEffect(() => {
        let cancelled = false;

        loadLeaflet()
            .then((L) => {
                if (cancelled || !containerRef.current) return;

                const map = L.map(containerRef.current, {
                    zoomControl: !compact,
                    dragging: !compact,
                    scrollWheelZoom: false,
                    doubleClickZoom: !compact,
                    attributionControl: false,
                }).setView([lat, lng], compact ? 14 : 15);

                L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                    maxZoom: 20,
                    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                }).addTo(map);

                L.circle([lat, lng], {
                    radius: mapRadius,
                    color: '#2563EB',
                    fillColor: '#2563EB',
                    fillOpacity: 0.15,
                    weight: 1.5,
                }).addTo(map);

                if (interactive) {
                    const currentMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
                    const updateCoords = (latlng) => {
                        onLocationSelect && onLocationSelect({ latitude: latlng.lat, longitude: latlng.lng });
                    };
                    map.on('click', (e) => {
                        currentMarker.setLatLng(e.latlng);
                        updateCoords(e.latlng);
                    });
                    currentMarker.on('dragend', (e) => updateCoords(e.target.getLatLng()));
                } else {
                    L.marker([lat, lng]).addTo(map);
                }

                mapRef.current = map;
                setLoading(false);
            })
            .catch((err) => {
                if (!cancelled) {
                    setErrorMsg(err.message);
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [lat, lng, mapRadius, compact, interactive]);

    return (
        <View style={[styles.mapContainer, compact && styles.mapContainerCompact]}>
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

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