import Postmate from 'postmate';

async function connect(schema, defaults, onContextUpdate, connectHandler = () => {}) {
  // Returns a promise that resolves to the "parent"
  return new Postmate.Model({
    schema: () => schema,
    defaults: () => defaults,
    setContext(context) {
      onContextUpdate(context);
    },
    onConnect(metadata) {
      connectHandler(metadata);
    }
  });
}

export default connect;
