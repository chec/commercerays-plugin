import createGetStaticProps from './createGetStaticProps';

const augmentStaticProps = (schema, defaults = {}) => async (staticProps = {}) => {
  const getStaticProps = createGetStaticProps(schema, defaults);
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
