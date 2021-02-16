import { blue, green } from 'chalk';
import { copyConfig, installDependencies, loadPackageJson, updatePackageJsonScripts } from '../helpers';
import { join, dirname } from 'path';
import { prompt } from 'promptly';

const configSourceFileName = 'karma.webpack.conf.js';
const configTargetFileName = 'karma.conf.js';

const testFileName = 'test.ts';

const defaultTestFolder = `src`;

export async function configureKarmaWebpack(): Promise<void> {
    console.log(blue(`Configuring karma-webpack`));

    const testPath = await prompt(`test.ts folder (defaults to '${defaultTestFolder}'):`, {
        default: defaultTestFolder,
    });

    const { packageJson, packageJsonPath, indent } = loadPackageJson();

    copyConfig(
        join(__dirname, '../../', 'config', testFileName),
        join(dirname(packageJsonPath), testPath, testFileName)
    );

    copyConfig(
        join(__dirname, '../../', 'config', configSourceFileName),
        join(dirname(packageJsonPath), configTargetFileName),
        (fileContent) => fileContent.replace(`files: []`, `files: [path.join('${testPath}', '${testFileName}')]`)
    );

    const scripts = {
        test: 'karma start --singleRun --browsers ChromeHeadless',
        'test:watch': 'karma start --no-coverage',
    };
    updatePackageJsonScripts(scripts, `Adding test script to 'package.json'`, packageJson, packageJsonPath, indent);

    const dependencies = [
        '@types/jasmine',
        'istanbul-instrumenter-loader',
        'jasmine',
        'karma',
        'karma-chrome-launcher',
        'karma-coverage',
        'karma-coverage-istanbul-reporter',
        'karma-jasmine',
        'karma-jasmine-html-reporter',
        'karma-sourcemap-loader',
        'karma-source-map-support',
        'karma-webpack@4',
        'puppeteer',
        'ts-loader',
        'webpack@4',
    ];

    const installSuccess = await installDependencies(dependencies);

    if (installSuccess) {
        console.log(` `);
        console.log(green(`Installation Complete`));
        console.log(blue(`To test your project run npm test`));
        console.log(blue(`To watch your tests run test:watch`));
    }
}
