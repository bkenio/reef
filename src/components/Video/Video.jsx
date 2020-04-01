import moment from 'moment';
import { gql } from 'apollo-boost';
import React, { useEffect } from 'react';

import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import { Loader, Container } from 'semantic-ui-react';

const pickUrl = ({ versions }) => {
  const loadOrder = ['libx264-2160p', 'libx264-1440p', 'libx264-1080p', 'libx264-720p'];
  for (const desiredPreset of loadOrder) {
    for (const { preset, link } of versions) {
      if (desiredPreset === preset && link) {
        return link;
      }
    }
  }
};

export default props => {
  const GET_VIDEO = gql`
    {
      video(id: "${props.id}") {
        id
        title
        views
        createdAt
        user {
          id
          avatar
          displayName
        }
        versions {
          link
          status
          preset
        }
      }
    }
  `;

  useEffect(() => {
    console.log('refetching video');
    refetch();
  }, []);

  const { loading, data, refetch } = useQuery(GET_VIDEO, {
    notifyOnNetworkStatusChange: true,
  });

  if (loading) {
    return <Loader active inline='centered' style={{ marginTop: '30px' }} />;
  }
  if (data) {
    const outerDivStyle = {
      backgroundColor: '#000000',
      height: 'calc(100vh - 100px)',
      maxHeight: 'calc((9 / 16) * 100vw',
    };

    const link = pickUrl(data.video);

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div>
          <div style={outerDivStyle}>
            <video width='100%' height='100%' controls autoPlay>
              <source src={link} type='video/mp4' />
            </video>
          </div>
          <div>
            <Container style={{ marginTop: '20px' }}>
              <div>
                <h2>{data.video.title}</h2>
                <p>
                  {`${data.video.views} views • ${moment(
                    parseInt(data.video.createdAt),
                  ).fromNow()}`}
                </p>
              </div>
              <div
                style={{
                  display: 'flex',
                  marginTop: '10px',
                  height: '75px',
                }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: '10px',
                  }}>
                  <img
                    as={Link}
                    to={`/users/${data.video.user.id}`}
                    width={50}
                    height={50}
                    alt='profile'
                    src={data.video.user.avatar}
                    style={{
                      borderRadius: '50%',
                      cursor: 'pointer',
                    }}
                  />
                </div>
                <div style={{ height: '100%' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      height: '50%',
                    }}>
                    {data.video.user.displayName}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      height: '50%',
                    }}>
                    {data.video.user.followers || '0'} followers
                  </div>
                </div>
              </div>
            </Container>
          </div>
        </div>
      </div>
    );
  }
};
