# Apply Config

A collection of scripts to quickly provide a base config of various common setups to your project

## ESLint (with typescript and prettier)

Configure your typescript project to work with eslint simply by running:

```
npx apply-config eslint-typescript
```

This script will configure eslint to run on your project and install dependencies to lint typescript and to run prettier.
The steps taken are:

 * Verifies that `package.json` can be located
 * copies the base `.eslintrc.js` to your project folder
 * adds or updates the `lint` npm script
 * installs the required dev dependencies

The sample config is supposed to be a starting point to get you going. You can then add or edit the rules as you see fit.
