const jwt = require('jsonwebtoken');

const users = require('./loaders/users');
const videos = require('./loaders/videos');
const uploads = require('./loaders/uploads');

module.exports = (event) => {
  console.log('event', event);
  let user = {};

  // Handles local server
  if (event.req) event = event.req;

  if (event.headers && event.headers.cookie) {
    const cookies = event.headers.cookie.split(';');

    const { idToken } = cookies.reduce((acc, c) => {
      if (c.includes('idToken=')) acc['idToken'] = c.split('idToken=')[1];
      if (c.includes('accessToken='))
        acc['accessToken'] = c.split('accessToken=')[1];
      if (c.includes('refreshToken='))
        acc['refreshToken'] = c.split('refreshToken=')[1];
      return acc;
    }, {});

    if (idToken) user = jwt.decode(idToken);
  }

  console.log('user', user);
  if (!Object.keys(user).length) throw new error('failed to authenticate user');

  return {
    user,
    users,
    videos,
    uploads,
  };
};
