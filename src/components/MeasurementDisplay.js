import React from 'react';

export function MeasurementDisplay({ 
  measurementMode, 
  measurementPoints, 
  measurementDistance, 
  resetMeasurement 
}) {
  if (!measurementMode) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 16,
      left: 16,
      background: 'rgba(255, 255, 255, 0.95)',
      padding: 12,
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: 200,
      color: 'black'
    }}>
      <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 14, color: 'black' }}>
        Distance Measurement
      </div>
      <div style={{ marginBottom: 8, fontSize: 12, color: 'black' }}>
        Click points on the map to measure distance
      </div>
      {measurementPoints.length > 0 && (
        <>
          <div style={{ marginBottom: 8, fontSize: 12, color: 'black' }}>
            <strong>Total Distance:</strong> {measurementDistance.toFixed(2)} km
          </div>
          <div style={{ marginBottom: 8, fontSize: 12, color: 'black' }}>
            <strong>Points:</strong> {measurementPoints.length}
          </div>
          <ResetButton onClick={resetMeasurement} />
        </>
      )}
    </div>
  );
}

function ResetButton({ onClick }) {
  return (
    <button
      style={{ 
        padding: '4px 8px', 
        borderRadius: 4, 
        background: 'white', 
        border: '1px solid #ccc', 
        cursor: 'pointer', 
        fontWeight: 600,
        fontSize: 12,
        transition: 'all 0.2s ease',
        color: 'black'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = '#f0f0f0';
        e.target.style.borderColor = '#999';
        e.target.style.transform = 'translateY(-1px)';
        e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'white';
        e.target.style.borderColor = '#ccc';
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
      onClick={onClick}
    >
      Reset
    </button>
  );
} 