import { blue, green } from 'chalk';
import { copyConfig, installDependencies, loadPackageJson, updatePackageJsonScripts } from '../helpers';
import { join, dirname } from 'path';

const configSourceFileName = 'eslint-config.js';
const configTargetFileName = '.eslintrc.js';

export async function configureEsLintTypescript(): Promise<void> {
    console.log(blue(`Configuring ESLint (with typescript support)...`));

    const { packageJson, packageJsonPath, indent } = loadPackageJson();

    copyConfig(
        join(__dirname, '../../', 'config', configSourceFileName),
        join(dirname(packageJsonPath), configTargetFileName)
    );

    const scripts = {
        lint: 'eslint . --ext .ts,.js',
        'lint:fix': 'eslint . --ext .ts,.js --fix',
    };
    updatePackageJsonScripts(scripts, `Adding linting script to 'package.json'`, packageJson, packageJsonPath, indent);

    const dependencies = [
        'eslint',
        'eslint-config-prettier',
        'eslint-config-standard',
        'eslint-plugin-import',
        'eslint-plugin-node',
        'eslint-plugin-prettier',
        'eslint-plugin-promise',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'prettier',
    ];

    const installSuccess = await installDependencies(dependencies);

    if (installSuccess) {
        console.log(` `);
        console.log(green(`Installation Complete`));
        console.log(blue(`To lint your project run 'npm run lint'`));
        console.log(blue(`To attempt to auto fix any issues run 'npm run lint:fix'`));
    }
}
