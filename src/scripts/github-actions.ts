import { blue, green } from 'chalk';
import { readdirSync } from 'fs';
import { join } from 'path';
import { copyConfig, loadPackageJson, updatePackageJsonScripts } from '../helpers';
import makeDir from 'make-dir';

export function configureGithubActions(): void {
    console.log(blue(`Copying sample GitHub Actions workflows`));

    const { packageJson, packageJsonPath, indent } = loadPackageJson();

    const workflowsPath = join('.github', 'workflows');
    const sourceFolder = join(__dirname, '../../', workflowsPath);
    const targetFolder = join(process.cwd(), workflowsPath);
    const files = readdirSync(sourceFolder);

    makeDir(targetFolder);

    files.forEach((fileName) => {
        copyConfig(join(sourceFolder, fileName), join(targetFolder, fileName));
    });

    const scripts = {
        prepublishOnly: 'npm run build --if-present && npm run test --if-present && npm run lint --if-present',
    };
    updatePackageJsonScripts(
        scripts,
        `Adding prepublishOnly script to 'package.json'`,
        packageJson,
        packageJsonPath,
        indent
    );

    console.log(green(`Copying Complete`));
    console.log(blue(`Please generate an npm access token and add it to your repository secrets as 'NPM_TOKEN'`));
    console.log(
        blue(
            `If you are unable to push workflow files to GitHub create a new Personal Access Token with the 'workflow' scope.`
        )
    );
}
