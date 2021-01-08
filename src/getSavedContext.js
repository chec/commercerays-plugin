import fetch from 'cross-fetch';

export default async function getSavedContext(rayId, secretKey, domain = 'https://api.chec.io') {
  const response = await fetch(`${domain}/v1/rays/${rayId}`, {
    headers: {
      'X-Authorization': secretKey,
      'Accept': 'application/json'
    }
  })

  if (response.status !== 200) {
    throw new Error('Could not load the ray from the API');
  }

  return (await response.json()).config;
}
