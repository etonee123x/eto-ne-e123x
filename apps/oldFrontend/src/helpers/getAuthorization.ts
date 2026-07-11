export const getAuthorization = () => {
  return `Basic ${Buffer.from([process.env.BASIC_USER, process.env.BASIC_PASSWORD].join(':')).toString('base64')}`;
};
