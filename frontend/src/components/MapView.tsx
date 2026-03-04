import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { getComplaints } from '../api';
import 'leaflet/dist/leaflet.css';

interface Complaint {
  complaint_id: string;
  title: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
}

const getMarkerColor = (status: string) => {
  switch (status) {
    case 'resolved':
      return '#10b981';
    case 'in_progress':
      return '#3b82f6';
    case 'assigned':
      return '#f59e0b';
    default:
      return '#ef4444';
  }
};

export const MapView: React.FC<{ center?: [number, number] }> = ({ center = [28.7041, 77.1025] }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await getComplaints({ latitude: center[0], longitude: center[1] });
        setComplaints(data);
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [center]);

  if (loading) {
    return <div className="w-full h-96 flex items-center justify-center bg-gray-100">Loading map...</div>;
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
      <MapContainer center={center as LatLngExpression} zoom={13} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        
        {complaints.map(complaint => (
          <Marker
            key={complaint.complaint_id}
            position={[complaint.latitude, complaint.longitude] as LatLngExpression}
            icon={L.circleMarker([complaint.latitude, complaint.longitude], {
              radius: 6,
              fillColor: getMarkerColor(complaint.status),
              color: getMarkerColor(complaint.status),
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8,
            } as any)}
          >
            <Popup>
              <div className="w-48">
                <h3 className="font-semibold text-sm">{complaint.title}</h3>
                <p className="text-xs text-gray-600">{complaint.complaint_id}</p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{complaint.category}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {complaint.status}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
