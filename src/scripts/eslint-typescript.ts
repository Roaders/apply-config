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

    const extensions = `.ts,.d.ts,.js`;

    const scripts = {
        lint: `eslint . --ext ${extensions}`,
        'lint:fix': `eslint . --ext ${extensions} --fix`,
    };
    updatePackageJsonScripts(scripts, `Adding linting script to 'package.json'`, packageJson, packageJsonPath, indent);

    const dependencies = [
        'eslint@7.7',
        'eslint-config-prettier@6.11',
        'eslint-config-standard@14.1',
        'eslint-plugin-import@2.22',
        'eslint-plugin-node@11.1',
        'eslint-plugin-prettier@3.1',
        'eslint-plugin-promise@4.2',
        '@typescript-eslint/eslint-plugin@3.10',
        '@typescript-eslint/parser@3.10',
        'prettier@2.1',
    ];

    const installSuccess = await installDependencies(dependencies);

    if (installSuccess) {
        console.log(` `);
        console.log(green(`Installation Complete`));
        console.log(blue(`To lint your project run 'npm run lint'`));
        console.log(blue(`To attempt to auto fix any issues run 'npm run lint:fix'`));
    }
}
