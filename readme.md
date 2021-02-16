# Apply Config

![Build](https://github.com/Roaders/apply-config/workflows/Build/badge.svg)

A collection of scripts to quickly provide a base config of various common setups to your project

## ESLint (with typescript and prettier)

Configure your typescript project to work with eslint simply by running:

```
npx apply-config eslint-typescript
```

This script will configure eslint to run on your project and install dependencies to lint typescript and to run prettier.

 * Verifies that `package.json` can be located
 * copies the base `.eslintrc.js` to your project folder
 * adds or updates the `lint` npm script
 * installs the required dev dependencies

The sample config is supposed to be a starting point to get you going. You can then add or edit the rules as you see fit.

## GitHub Actions

Get started with 2 simple workflows, one that runs your build on every check-in and one that pushes to NPM when you create a release

```
npx apply-config github-actions
```

 * Verifies that `package.json` can be located
 * copies `build.yml` and `release.yml` to `.github/workflows`

 ## Karma Webpack (with typescript support)

 An alternative to using angular test bed. Faster to run and much less maintenance.

 ```
 npx apply-config github-actions karma-webpack-typescript
 ```

 * Verifies that `package.json` can be located
 * asks for the location to copy `test.ts` to (defaults to `src`)
 * copies the base `karma.conf.js` to your project folder
 * copies `test.ts` to specified folder
 * adds or updates the `test` and `test:watch` npm script
 * installs the required dev dependencies
