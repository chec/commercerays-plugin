import set from 'lodash.set';
import get from 'lodash.get';
import defaultsDeep from 'lodash.defaultsdeep';

/**
 * Runs through the schema and finds any "product" fields so that we automatically switch IDs in the context to be
 * actual objects - on the server side if possible
 *
 * @param {Commerce} commerce
 * @param {Object} schema
 * @param {Object} context
 * @returns {*}
 */
export default async function resolveResourcesInContext (commerce, schema, context) {
  if (!commerce) {
    return null;
  }

  // Find attributes in the schema that should be loaded with Commerce.js (ie. products)
  const createReducer = (prefix = '') => (accumulator, object) => {
    const key = `${prefix}${object.key}`;

    // Deal with sub-schema
    if (Object.hasOwnProperty.call(object, 'schema')) {
      // Reduce the sub-schema (with this reducer), using the current accumulator as a base
      return object.schema.reduce(createReducer(`${key}.`), accumulator);
    }

    // Skip entries that aren't loaded through Commerce.js
    if (!['product'].includes(object.type)) {
      return accumulator;
    }

    const value = get(context, key);

    // Skip entries that don't have any value set in the context
    if (!value) {
      return accumulator;
    }

    // Merge in the commerce.js loadable entry
    return [
      ...accumulator,
      {
        key,
        type: object.type,
        value,
      }
    ]
  }

  const loadableResources = schema.schema.reduce(createReducer(), []);
  const newValues = {};
  const promises = [];

  // Load the resources with Commerce.js and set them in the context
  loadableResources.forEach((resource) => {
    switch (resource.type) {
      case 'product':
        if (typeof resource.value !== 'string') {
          return;
        }
        promises.push((async () => {
          set(newValues, resource.key, await commerce.products.retrieve(resource.value))
        })());
    }
  })

  await Promise.all(promises);

  // Return a new object with our new values, and the original context as the "default" values
  return defaultsDeep(newValues, context);
}
