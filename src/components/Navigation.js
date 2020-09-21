import SearchBar from './SearchBar';
import styled from 'styled-components';
import React, { useContext } from 'react';
import Grid from '@material-ui/core/Grid';
import favicon from '../../public/favicon.ico';
import IconButton from '@material-ui/core/IconButton';
import UploadIcon from '@material-ui/icons/PublishOutlined';
import PersonOutlinedIcon from '@material-ui/icons/PersonOutlined';
import VideoLibraryIcon from '@material-ui/icons/VideoLibraryOutlined';

import { Link } from 'react-router-dom';
import { Box } from '@material-ui/core';
import { UserContext } from '../contexts/UserContext';

const GridCon = styled(Grid)`
  height: 50px;
  display: flex;
  align-items: center;
  background-color: #23272a;
  justify-content: space-between;
`;

const Logo = styled.img`
  width: 50px;
  height: auto;
  display: flex;
  cursor: pointer;
  object-fit: cover;
  align-items: center;
  justify-content: center;
`;

export default function Navigation() {
  const { user } = useContext(UserContext);

  return (
    <GridCon container>
      <Grid item xs={2}>
        <Link to='/'>
          <Logo src={favicon} />
        </Link>
      </Grid>
      <Grid item xs={2}>
        <SearchBar />
      </Grid>
      <Grid item xs={2}>
        <Grid container justify='flex-end'>
          <Box>
            {user && (
              <IconButton component={Link} to='/upload' color='primary'>
                <UploadIcon />
              </IconButton>
            )}
          </Box>
          <Box>
            {user && user.id && (
              <IconButton component={Link} to={`/u/${user.username}`} color='primary'>
                <VideoLibraryIcon />
              </IconButton>
            )}
          </Box>
          <Box>
            {user ? (
              <IconButton to='/account' component={Link} color='primary'>
                <PersonOutlinedIcon />
              </IconButton>
            ) : (
                <IconButton to='/login' component={Link} color='primary'>
                  <PersonOutlinedIcon />
                </IconButton>
              )}
          </Box>
        </Grid>
      </Grid>
    </GridCon>
  );
}
