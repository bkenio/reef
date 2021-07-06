import { Box, Flex, Heading, Progress, Button, } from '@chakra-ui/react';
import axios from 'axios';
import { useState, useCallback, } from 'react';
import { useDropzone, } from 'react-dropzone';
import chunkFile from '../utils/chunkFile';

export default function Upload({ refetch }) {
  const [files, setFiles] = useState([]);
  const [bytesUploaded, setBytesUploaded] = useState({});

  async function uploadChunks(chunks, urls) {
    const results = await Promise.all(chunks.map((chunk, i) => {
      console.log(`uploading part ${i} to ${urls[i]}`);
      return axios.put(urls[i], chunk, {
        onUploadProgress: e => {
          setBytesUploaded(prevState => ({ ...prevState, [i]: e.loaded }));
        },
      });
    }));

    return results.reduce((acc, { headers }, i) => {
      acc.push({ ETag: headers.etag, PartNumber: i+1 });
      return acc;
    }, []);
  }

  // uploads handles chunking up a file, getting signed urls, and uploading all parts
  async function startUpload(file) {
    console.log('Chunking video');
    const chunks = chunkFile(file);
    console.log('Chunks', chunks.length);
  
    console.log('Fetching upload urls', file);
    const uploadBody =  JSON.stringify({
      type: file.type,
      chunks: chunks.length,
    });
    console.log(uploadBody);
    const uploadResponse = fetch('/api/uploads', {
      method: 'POST',
      body:uploadBody,
    });
  
    const { uploadId, key, videoId, urls } = await (await uploadResponse).json();
  
    console.log('Uploading files parts');
    const parts = await uploadChunks(chunks, urls);
  
    console.log('Completing video upload');
    console.log({ uploadId, key, videoId, urls, parts });
  
    const video = document.createElement('video');
    video.setAttribute('src', window.URL.createObjectURL(file));
    video.onloadeddata = event => {
      const meta = event.srcElement; // TODO :: This is deprecated
      const body = {
        key,
        parts,
        videoId,
        uploadId,
        duration: meta.duration,
        title: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
      };
      fetch('/api/videos', {
        method: 'POST',
        body: JSON.stringify(body),
      }).then(() => {
        setBytesUploaded({});
        setFiles([]);
        if (refetch) refetch();
      }).catch((error) => {
        console.log(error);
        setBytesUploaded({});
        setFiles([]);
        if (refetch) refetch();
      });
    };
  }

  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles);
    startUpload(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const totalBytesLoaded = Object.values(bytesUploaded).reduce((acc, cv) => {
    acc += cv;
    return acc;
  }, 0);
  const progress = parseInt(((totalBytesLoaded / files[0]?.size || 0) * 100).toFixed(0));

  return (
    <Flex>
      <Box w='full'>
        <Box {...getRootProps()} w='min'>
          <input {...getInputProps()} accept='video/mp4' multiple={false} disabled={Boolean(files.length)} />
          {!progress && <Button> Upload </Button>}
        </Box>
        <Box my='1' w='full'>
          {files.length ? <Heading size='sm' p='1' align='center'>{progress}% Uploaded</Heading> : null}
          {files.length ? <Progress hasStripe isAnimated value={progress} /> : null}
        </Box>
      </Box>
    </Flex>
  );
}