import { blue, green } from 'chalk';
import {
    copyConfig,
    copyScripts,
    getDependencyVersions,
    installDependencies,
    isDefined,
    loadPackageJson,
    updatePackageJsonScripts,
} from '../helpers';
import { join, dirname } from 'path';

const configSourceFileName = 'jest.config.js';

export async function configureTsJest(): Promise<void> {
    console.log(blue(`Configuring Jest (with typescript support)...`));

    const { packageJson, packageJsonPath, indent } = loadPackageJson();

    copyConfig(
        join(__dirname, '../../', 'config', configSourceFileName),
        join(dirname(packageJsonPath), configSourceFileName)
    );

    const { packageJson: localPackageJson } = loadPackageJson(join(__dirname, '../../package.json'));
    const scripts = copyScripts(localPackageJson, ['test', 'test:watch']);
    updatePackageJsonScripts(scripts, `Adding testing script to 'package.json'`, packageJson, packageJsonPath, indent);

    const versionedDependencies = getDependencyVersions(localPackageJson, ['jest', 'ts-jest', '@types/jest']).filter(
        isDefined
    );

    const installSuccess = await installDependencies(versionedDependencies);

    if (installSuccess) {
        console.log(` `);
        console.log(green(`Installation Complete`));
        console.log(blue(`To test your project run 'npm test'`));
        console.log(blue(`To watch tests run 'test:watch'`));
    }
}
