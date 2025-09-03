export const getAuthorization = () =>
  `Basic ${Buffer.from([process.env.BASIC_USER, process.env.BASIC_PASSWORD].join(':')).toString('base64')}`;
