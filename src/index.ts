#!/usr/bin/env node

import { yellow } from 'chalk';
import { configureEsLintTypescript } from './scripts/eslint-typescript';

enum Config {
    'eslint-typescript' = 'eslint-typescript',
}

type ConfigNames = keyof typeof Config;

async function applyConfig() {
    const config = (process.argv[2] as unknown) as ConfigNames;

    switch (config) {
        case 'eslint-typescript':
            await configureEsLintTypescript();
            break;
        default:
            handleIncorrectConfig(config);
    }
}

function handleIncorrectConfig(script: never) {
    if (!script) {
        console.log(
            yellow(`Please provide a valid config name to apply. Valid values are: ${Object.values(Config).join(', ')}`)
        );
    } else {
        console.log(yellow(`'${script}' is not a valid config. Valid values are: ${Object.values(Config).join(', ')}`));
    }
}

applyConfig();
