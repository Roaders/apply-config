#!/usr/bin/env node

import { yellow } from 'chalk';
import { configureEsLintTypescript } from './scripts/eslint-typescript';
import { configureGithubActions } from './scripts/github-actions';
import { configureKarmaWebpack } from './scripts/karma-webpack';
import { configureTsJest } from './scripts/ts-jest';

enum Config {
    'eslint-typescript' = 'eslint-typescript',
    'github-actions' = 'github-actions',
    'karma-webpack-typescript' = 'karma-webpack-typescript',
    'jest-typescript' = 'jest-typescript',
}

type ConfigNames = keyof typeof Config;

async function applyConfig() {
    const config = (process.argv[2] as unknown) as ConfigNames;

    switch (config) {
        case 'github-actions':
            await configureGithubActions();
            break;
        case 'karma-webpack-typescript':
            await configureKarmaWebpack();
            break;
        case 'eslint-typescript':
            await configureEsLintTypescript();
            break;
        case 'jest-typescript':
            await configureTsJest();
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
