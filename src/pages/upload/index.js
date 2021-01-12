import styled from 'styled-components';
import { useDropzone, } from 'react-dropzone';
import React, { useState, useCallback, useContext, } from 'react';
import UploadProgress from './uploadProgress';
import { Context, } from '../../utils/store';
import Layout from '../../components/Layout';

const Dropzone = styled.div`
  display: ${p => p.files.length ? 'none' : 'flex'};
  cursor: pointer;
  width: 100%;
  max-width: 300px;
  min-height: 200px;
  border-radius: 4px;
  align-items: center;
  justify-content: center;
  border: dashed 3px #E4E7EB;
  margin: 30px 10px 10px 10px;
`;

export default function Uploader() {
  const { authenticated, loading } = useContext(Context);
  const [files, setFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: Boolean(files.length),
    accept: 'video/mp4,video/quicktime',
  });

  if (!authenticated && !loading) {
    return <div> Please log in to upload </div>;
  }

  return (
    <Layout>
      <div
        width='100%'
        height='100%'
        display='flex'
        align='center'
        justify='center'
      >
        <Dropzone {...getRootProps()} files={files}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <h1 level='4'> Drop here! </h1>
          ) : (
            <h1 level='4'> Upload </h1>
          )}
        </Dropzone>
        {files.map(file => <UploadProgress key={file.name} file={file} />)}
      </div>
    </Layout>
  );
}
