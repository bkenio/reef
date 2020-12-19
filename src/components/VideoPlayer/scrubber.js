import React, { useEffect, useState, } from 'react';
import { RangeInput, } from 'grommet';

function Duration({ vRef = {} }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (vRef.current.currentTime && vRef.current.duration) {
      const updateProgress = vRef.current.currentTime / vRef.current.duration * 100;

      if (Number.isNaN(updateProgress)) {
        setProgress(0);
      } else {
        setProgress(updateProgress);
      }
    }
  }, []);

  useEffect(() => {
    const video = vRef.current;
    function timeUpdate() { 
      const positionUpdate = (video.currentTime / video.duration) * 100;
      setProgress(positionUpdate);
    }
    video.addEventListener('timeupdate', timeUpdate);
    return () => video.removeEventListener('timeupdate', timeUpdate);
  }, [vRef]);

  function handleChange({ target }) {
    let seekPosition = vRef.current.duration * (target.value / 100);

    if (Number.isNaN(seekPosition)) {
      seekPosition = 0;
    }

    vRef.current.currentTime = seekPosition;
    setProgress(seekPosition / vRef.current.duration * 100);
  }

  return (
    <RangeInput
      value={progress}
      onChange={handleChange}
    />
  );
}

export default Duration;
