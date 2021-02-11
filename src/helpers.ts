import { green, red } from 'chalk';
import { exec } from 'child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, isAbsolute } from 'path';
import { clearLine, cursorTo } from 'readline';
import { PackageJson, PackageJsonScripts } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const detect = require('detect-json-indent');

export function writeProgressMessage(message: string, spinner = false): (success?: boolean) => void {
    let timeout: NodeJS.Timeout | undefined;

    if (spinner) {
        let dots = 0;
        process.stdout.write(message);

        timeout = setInterval(() => {
            switch (dots) {
                case 3:
                    dots = 0;
                    cursorTo(process.stdout, message.length);
                    clearLine(process.stdout, 1);
                    break;
                default:
                    dots++;
                    process.stdout.write('.');
            }
        }, 250);
    } else {
        process.stdout.write(`${message}...`);
    }

    return (success = true) => {
        if (timeout != null) {
            clearInterval(timeout);
        }

        cursorTo(process.stdout, 0);
        clearLine(process.stdout, 1);

        if (success) {
            console.log(`${message}... ${green('\u2713')}`);
        } else {
            console.log(`${message}... ${red('\u2715')}`);
        }
    };
}

export function installDependencies(dependencies: string[]): Promise<boolean> {
    const complete = writeProgressMessage(`Installing dev dependencies`, true);

    return new Promise((resolve) => {
        const installCommand = `npm install -D ${dependencies.join(' ')}`;

        exec(installCommand, (error) => {
            complete(error == null);
            if (error) {
                console.log(` `);
                console.log(red(`Error installing dependencies:`), error);
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
}

export function updatePackageJsonScripts(
    scripts: PackageJsonScripts,
    message: string,
    packageJson: PackageJson,
    packageJsonPath: string,
    indent: string
): void {
    const complete = writeProgressMessage(message);

    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts = {
        ...packageJson.scripts,
        ...scripts,
    };

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, undefined, indent));

    complete();
}

export function copyConfig(fileName: string, destinationPath?: string): void {
    destinationPath = destinationPath || fileName;
    const configSrcPath = join(__dirname, '../', 'config', fileName);
    const configTargetPath = isAbsolute(destinationPath) ? join(process.cwd(), destinationPath) : destinationPath;

    const complete = writeProgressMessage(`Copying config to '${configTargetPath}'`);

    copyFileSync(configSrcPath, configTargetPath);

    complete();
}

export function loadPackageJson(): {
    packageJsonPath: string;
    packageJson: PackageJson;
    indent: string;
} {
    const packageJsonPath = join(process.cwd(), 'package.json');

    const complete = writeProgressMessage(`Loading 'package.json'`);

    let packageJson: PackageJson;
    let indent = '';

    try {
        const stringified = readFileSync(packageJsonPath).toString();
        indent = detect(stringified);
        packageJson = JSON.parse(stringified);
    } catch (e) {
        console.log(`${red(`Error:`)} could not load package.json from '${packageJsonPath}'.`);
        console.log(`Please ensure you run command from a folder that contains a package.json.`);
        process.exit(1);
    }

    complete();

    return { packageJsonPath, packageJson, indent };
}
