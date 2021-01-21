import get from 'lodash.get';
import set from 'lodash.set';
import defaultsDeep from 'lodash.defaultsdeep';

export default (context, schema, defaults) => {
  const missingAttributes = {};

  // Function that generates a loop. This exists because it's a recursive loop
  const createLoop = (prefix = '') => (object) => {
    const key = `${prefix}${object.key}`;

    // Deal with sub-schema
    if (Object.hasOwnProperty.call(object, 'schema')) {
      // Reduce the sub-schema (with this reducer), using the current accumulator as a base
      return object.schema.forEach(createLoop(`${key}.`));
    }

    // Check if the value exists in context
    const value = get(context, key);

    // Skip if the value exists and it's not an image
    if (object.type !== 'image' && value !== undefined) {
      return;
    }

    // Skip images if they have an ID (ie. has come from chec assets API)
    if (object.type === 'image' && value && typeof value === 'object' && value.id) {
      return;
    }

    // Grab a value from defaults to use in-place
    set(missingAttributes, key, get(defaults, key));
  }

  schema.schema.forEach(createLoop());

  // Apply the new values to our context and return that
  return defaultsDeep(missingAttributes, context);
}
