import Commerce from '@chec/commerce.js';
import getSavedContext from '../getSavedContext';
import resolveResourcesInContext from '../resolveResourcesInContext';

export default function createGetStaticProps(schema) {
  return async () => {
    const preview = process.env.COMMERCEJS_RAYS_MODE === 'preview';
    const domain = process.env.NEXT_PUBLIC_CHEC_API_DOMAIN || 'https://api.chec.io';

    let merchant = null;
    if (!preview) {
      const commerce = new Commerce(process.env.NEXT_PUBLIC_CHEC_PUBLIC_KEY, false, {
        url: domain,
      });
      merchant = await commerce.merchants.about();
    }

    const rayContext = preview ? null : await getSavedContext(
      process.env.COMMERCEJS_RAY_ID,
      process.env.CHEC_SECRET_KEY,
      domain,
    ).then((context) => context && resolveResourcesInContext(
      new Commerce(process.env.NEXT_PUBLIC_CHEC_PUBLIC_KEY, false, {
        url: domain,
      }),
      schema,
      context,
    ));

    return {
      props: {
        merchant,
        preview,
        rayContext,
      },
      // Revalidate the config in development mode so regeneration will occur
      revalidate: preview ? 1 : undefined,
    };
  }
}
