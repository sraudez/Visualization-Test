import React from 'react';

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 20,
  padding: '0 20px',
};

const buttonStyle = (open) => ({
  padding: '10px 20px',
  minWidth: '180px',
  backgroundColor: open ? '#dc3545' : '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
});

const titleStyle = {
  color: '#333',
  margin: 0,
  flex: 1,
  textAlign: 'center',
};

const spacerStyle = { width: '140px' };

export function AppHeader({ controlBarOpen, setControlBarOpen }) {
  const handleToggleControls = () => {
    setControlBarOpen(!controlBarOpen);
  };

  return (
    <div style={headerStyle}>
      <button onClick={handleToggleControls} style={buttonStyle(controlBarOpen)}>
        {controlBarOpen ? 'Hide Controls' : 'Show Controls'}
      </button>

      <h1 style={titleStyle}>Urban Health and Livability Visualization</h1>

      <div style={spacerStyle} />
    </div>
  );
}