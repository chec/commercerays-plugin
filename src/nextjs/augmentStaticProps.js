import createGetStaticProps from './createGetStaticProps';

const augmentStaticProps = (schema) => async (staticProps = {}) => {
  const getStaticProps = createGetStaticProps(schema);
  const defaults = await getStaticProps();

  return {
    ...staticProps,
    ...defaults,
    props: {
      ...(staticProps.props || {}),
      ...defaults.props,
    }
  }
}

export default augmentStaticProps;
