import React, { useEffect, useState } from 'react';
import Commerce from '@chec/commerce.js';
import { CommerceContext } from '@chec/react-commercejs-hooks';
import CommerceRaysContext from './context';
import connect from '../connect';
import resolveResourcesInContext from '../resolveResourcesInContext';

const withCommerceRay = (schema, defaults) => (Component) => ({
  merchant: merchantProp,
  preview,
  rayContext: initialContext,
  ...props
}) => {
  const [ commerce, setCommerce ] = useState();

  // Track a known Chec API public key
  const [ publicKey, setPublicKey ] = useState(process.env.NEXT_PUBLIC_CHEC_PUBLIC_KEY);

  // Track merchant information that's likely to be needed
  const [ merchant, setMerchant ] = useState(merchantProp)

  // Track the "parent" window (provided by Postmate)
  const [ parent, setParent ] = useState();

  // Track the current context/config for the ray, and whether there is any context at all
  const [ rayContext, setRayContext ] = useState(initialContext);
  // We track whether there's context separately to reduce side-effects
  const [ hasContext, setHasContext ] = useState(Boolean(initialContext));
  const updateContext = (context) => {
    if (!context) {
      return;
    }

    setRayContext(context);
    setHasContext(true);
  }

  useEffect(() => {
    // Skip creating Commerce.js if there's no key or we already have a Commerce.js instance
    if (!publicKey || commerce) {
      return;
    }

    const sdk = new Commerce(
      publicKey,
      false,
      { url: process.env.NEXT_PUBLIC_CHEC_API_DOMAIN || 'https://api.chec.io' },
    );
    setCommerce(sdk);

    if (!merchant) {
      sdk.merchants.about().then((loadedMerchant) => {
        setMerchant(loadedMerchant)
      })
    }
  }, [publicKey]);

  // Watch for changes with the iFrame messaging API if the deployment supports previews
  if (preview) {
    useEffect(async () => {
      // Connect to the parent window with our schema and default values, and accept metadata provided by the parent
      setParent(await connect(schema, defaults, updateContext, ({
        publicKey: providedKey,
        merchant: providedMerchant,
        apiUrl,
      }) => {
        // Create a Commerce.js instance
        const sdk = new Commerce(providedKey, false, {
          url: apiUrl || 'https://api.chec.io',
        });
        setCommerce(sdk);
        setPublicKey(providedKey);

        if (providedMerchant && !merchant) {
          setMerchant(providedMerchant);
        }
      }));
    }, []);

    // Create a side effect for indicating when the site is loading or not
    useEffect(() => {
      // We can't do anything if we don't have a parent frame to notify
      if (!parent) {
        return;
      }

      if (merchant && rayContext) {
        parent.emit('loaded');
        return;
      }

      parent.emit('loading');
    }, [merchant, hasContext, parent])

    // For local dev, a chec public key might be set. If so, we don't require a connection to the editor and can just
    // use given defaults for the context
    if (process.env.NEXT_PUBLIC_CHEC_PUBLIC_KEY) {
      useEffect(async () => {
        updateContext(await resolveResourcesInContext(commerce, schema, defaults));
      }, [ commerce ]);
    }
  }

  // Display something when there's no merchant or ray information available
  if (!merchant || !rayContext) {
    if (preview) {
      // The editor should hide this while loading is happening...
      return <div className="preview-loading">The preview is loading...</div>
    }
    // return <RayError />;
    return <div>This site is broken somehow</div>
  }

  return (
    <CommerceContext.Provider value={commerce}>
      <CommerceRaysContext.Provider value={rayContext}>
        <Component {...props} merchant={merchant} />
      </CommerceRaysContext.Provider>
    </CommerceContext.Provider>
  );
}

export default withCommerceRay;
