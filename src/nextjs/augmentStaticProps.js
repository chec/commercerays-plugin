import createGetStaticProps from './createGetStaticProps';

const augmentStaticProps = (schema, defaults = {}, commerceConfig = {}) => async (staticProps = {}) => {
  const getStaticProps = createGetStaticProps(schema, defaults, commerceConfig);
  const parentProps = await getStaticProps();

  return {
    ...staticProps,
    ...parentProps,
    props: {
      ...(staticProps.props || {}),
      ...parentProps.props,
    }
  }
}

export default augmentStaticProps;
