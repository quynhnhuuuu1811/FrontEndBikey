import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import IconMarker from "../assets/IconMarker.png";
import { getListStationsSort } from "../redux/api_request/station_api";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; // Lấy token từ .env

interface MapboxMapProps {
  latitude?: number;
  longitude?: number;
  stations: any[];
}

const MapboxMap = ({ latitude, longitude,stations }: MapboxMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isUserLocationSet, setIsUserLocationSet] = useState(false);
  console.log({
    latitude,
    longitude,
    stations,
  })
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Nếu có station thì ưu tiên station, nếu không thì giữ vị trí user
    const defaultLat = latitude ?? currentLocation?.lat ?? 10.776889; // Hồ Chí Minh mặc định
    const defaultLng = longitude ?? currentLocation?.lng ?? 106.700987;

    // Khởi tạo bản đồ
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [defaultLng, defaultLat],
      zoom: 14,
    });

    const map = mapRef.current as mapboxgl.Map;
    
    // Thêm marker cho tất cả station
    stations.forEach((station) => {
      const markerEl = document.createElement("div");
      markerEl.style.backgroundImage = `url(${IconMarker})`;
      markerEl.style.width = "35px";
      markerEl.style.height = "35px";
      markerEl.style.backgroundSize = "cover";

      new mapboxgl.Marker(markerEl)
        .setLngLat([station.location[0], station.location[1]])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<h3>${station.name}</h3><p>${station.address}</p>`
          )
        )
        .addTo(map);
    });

    // Thêm marker vị trí hiện tại của người dùng nếu có
    if (currentLocation) {
      new mapboxgl.Marker({ color: "blue" })
        .setLngLat([currentLocation.lng, currentLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML("<h3>Vị trí của bạn</h3>"))
        .addTo(map);
    }

    return () => map.remove();
  }, [latitude, longitude, currentLocation]);

  // Lấy vị trí người dùng nếu chưa có tọa độ station
  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) return; // Nếu đã có station thì không lấy vị trí user

    // if (isUserLocationSet || !mapRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCurrentLocation({ lat, lng });
        setIsUserLocationSet(true); // Đánh dấu đã lấy vị trí user

        const map = mapRef.current as mapboxgl.Map;

        new mapboxgl.Marker({ color: "blue" })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setHTML("<h3>Vị trí của bạn</h3>"))
          .addTo(map);

        // Chỉ di chuyển bản đồ đến vị trí user nếu chưa có tọa độ station
        if (!latitude && !longitude) {
          map.flyTo({ center: [lng, lat], zoom: 14 });
        }
      },
      (error) => {
        console.error("Lỗi lấy vị trí:", error);
      },
      { enableHighAccuracy: true }
    );
  }, [isUserLocationSet]);

  return (
    <div
      ref={mapContainerRef}
      className="absolute top-0 left-0 w-full h-full"
    />
  );
};

export default MapboxMap;
