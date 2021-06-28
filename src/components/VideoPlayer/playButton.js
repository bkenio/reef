import { Box, } from '@chakra-ui/react';
import React, { useEffect, useState, } from 'react';
import { IoPauseOutline, IoPlayOutline, } from 'react-icons/io5';

function PlayButton({ vRef, size = '20px', disableOnClick = false }) {
  const [paused, setPaused] = useState(vRef.current.paused);

  useEffect(() => {
    const video = vRef.current;
    function handlePlay() {
      setPaused(video.paused);
    }

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePlay);
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePlay);
    };
  }, [vRef]);

  function handleClick() {
    if (!disableOnClick) {
      vRef.current.paused ? vRef.current.play() : vRef.current.pause();
    }
  }

  const options = {
    size,
    stroke: 'white',
    cursor: 'pointer',
  };

  return (
    <Box mr='2' onClick={handleClick}>
      {paused ? <IoPlayOutline {...options} /> : <IoPauseOutline {...options}/>}
    </Box>
  );
}

export default PlayButton;