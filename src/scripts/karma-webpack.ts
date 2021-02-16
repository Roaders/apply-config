import { blue, green } from 'chalk';
import { copyConfig, installDependencies, loadPackageJson, updatePackageJsonScripts } from '../helpers';
import { join, dirname } from 'path';

const configSourceFileName = 'karma.webpack.conf.js';
const configTargetFileName = 'karma.conf.js';

export async function configureKarmaWebpack(): Promise<void> {
    console.log(blue(`Configuring karma-webpack`));

    const { packageJson, packageJsonPath, indent } = loadPackageJson();

    copyConfig(
        join(__dirname, '../../', 'config', configSourceFileName),
        join(dirname(packageJsonPath), configTargetFileName)
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
        console.log(green(`Please add test files to the 'files' array in '${configTargetFileName}'`));
        console.log(blue(`To test your project run npm test`));
        console.log(blue(`To watch your tests run test:watch`));
    }
}
