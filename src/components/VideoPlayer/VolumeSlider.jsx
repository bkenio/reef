import { Slider, } from '@material-ui/core';
import React, { useEffect, useState, } from 'react';

function VolumeButton({ vRef }) {
  const [volume, setVolume] = useState(vRef.current.volume * 100);

  useEffect(() => {
    function handleVolume() { setVolume(vRef.current.volume * 100); }
    vRef.current.addEventListener('volumechange', handleVolume);
    return () => {
      vRef.current.removeEventListener('volumechange', handleVolume);
    };
  }, [vRef]);

  function handleChange(e, newValue) {
    vRef.current.volume = newValue / 100;
  }

  return (
    <Slider
      value={volume}
      onChange={handleChange}
      style={{ width: '60px', color: 'white', marginLeft: '10px' }}
    />
  );
}

export default VolumeButton;