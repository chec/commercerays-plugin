<h1 align="center">
  CommerceRays plugin
</h1>
<p align="center">
  An SDK for interfacing with the Commerce Ray dashboard to create rays that can be live edited and deployed with custom
  configuration
</p>

<p align="center">
  <a href="https://npmjs.org/package/@chec/commercerays-plugin">
    <img src="https://img.shields.io/npm/v/@chec/commercerays-plugin.svg" alt="Version" />
  </a>
  <a href="https://npmjs.org/package/@chec/commercerays-plugin">
    <img src="https://img.shields.io/npm/dw/@chec/commercerays-plugin.svg" alt="Downloads/week" />
  </a>
    <a href="https://github.com/chec/commerce.js/blob/master/packages/commercerays-plugin/package.json">
    <img src="https://img.shields.io/npm/l/@chec/commercerays-plugin" alt="License" />
  </a>
  <br>
  <a href="https://commercejs.com">commercejs.com</a> | <a href="https://twitter.com/commercejs">@commercejs</a> | <a href="http://slack.commercejs.com">Slack</a>
</p>

## Project status

This plugin is currently a work in progress. This code has been made open source as we intend to allow custom themes to
be contributed to Commerce Rays, although this is not currently possible. As CommerceRays evolves, this plugin is likely
to change significantly

## Installation

Use your favourite package manager:

```shell
yarn add @chec/commercerays-plugin
# OR
npm install --save @chec/commercerays-plugin
```

## Core concept

CommerceRays are websites that have custom theme configuration provided by an API. This theme configuration is defined
by a schema, and can be edited from within the Chec Dashboard (the "editor"). Projects that use this plugin are 
referred to as "themes", and deployed websites that combine a user-edited configuration and your theme are referred to 
as "rays". Many different types of configuration are supported by the editor, and are detailed in the [Writing your 
schema](#writing-your-schema) section below.

## Usage

Currently, NextJS is the only natively supported JS framework.

### NextJS

#### Hooking into getStaticProps

The NextJS integration provided by this plugin is intended for use with NextJS pages. The plugin will hook into 
`getStaticProps` and ensures that relevant data is fetched on the server side. You may either use `createGetStaticProps` 
to generate a `getStaticProps` function, or use the provided `augmentStaticProps` function

`pages/index.js`:
```js
import { createGetStaticProps } from '@chec/commercerays-plugin/nextjs';
import schema from './schema.json';

const getStaticProps = createGetStaticProps(schema);
export getStaticProps;
```

or

```js
import { augmentStaticProps } from '@chec/commercerays-plugin/nextjs';
import schema from './schema.json';

export function getStaticProps() {
  // Custom code...
  
  return augmentStaticProps(schema)({
    // Usual return value of getStaticProps goes here
  })
}
```

#### Applying the CommerceRay context

Next, you need to apply the CommerceRays React context to your page component. This is provided as a HOC as it relies on
props provided by `getStaticProps`:

`pages/index.js`:
```js
import { withCommerceRays } from '@chec/commercerays-plugin/nextjs';

// Imported theme schema and theme defaults
import schema from './schema.json';
import defaultConfig from './defaults.json';

function IndexPage() {
  return (
    <>
      <Head>
        <title>My page</title>
      </Head>
      Hello world
    </>
  );
}

// You may also provide any default values for your schema here 
export default withCommerceRays(schema, defaultConfig)(IndexPage);
```

#### Accessing configuration values

As the user chooses values for your theme configuration (or the defaults should be used as a fallback) you will need to
access them to alter the look of the page. A React hook is provided for this, which can be used in any React component
that is a child of the page that you applied the `withCommerceRays` HOC to:

```js
import { useCommerceRay } from '@chec/commercerays-plugin/nextjs'

export function MyComponent() {
  const { myConfigurationProperty } = useCommerceRay();
  
  // ...
}
```

## Writing your schema

// TODO
