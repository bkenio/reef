import React from 'react';

function FullScreenButton({ vRef }) {
  return (
    <svg 
      className='h-6 w-6 cursor-pointer mx-1'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      stroke='white'
      onClick={() => {
        vRef.current.requestFullscreen();
      }}
    >
      <path 
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
      />      
    </svg>
  );
}

export default FullScreenButton;