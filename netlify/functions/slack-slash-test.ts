import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  console.log(event);

  return {
    statusCode: 200,
    body: 'ok',
  };
};
