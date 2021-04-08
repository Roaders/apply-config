import { green, red } from 'chalk';
import { exec } from 'child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { clearLine, cursorTo } from 'readline';
import { PackageJson, PackageJsonScripts } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const detect = require('detect-json-indent');

export function writeProgressMessage(message: string, spinner = false): (success?: boolean) => void {
    let timeout: NodeJS.Timeout | undefined;

    if (spinner) {
        let dotCount = 0;
        process.stdout.write(message);

        timeout = setInterval(() => {
            switch (dotCount) {
                case 3:
                    dotCount = 0;
                    cursorTo(process.stdout, message.length);
                    clearLine(process.stdout, 1);
                    break;
                default:
                    dotCount++;
                    process.stdout.write(`.`);
            }
        }, 300);
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

const versionModiferRegExp = /^[\^~]/;

export function getDependencyVersions(packageJson: PackageJson, dependencyList: string[]): string[] {
    const dependencies = { ...packageJson.devDependencies, ...packageJson.dependencies };

    return dependencyList.map((dependencyName) => {
        const version = dependencies[dependencyName];

        return version == null ? dependencyName : `${dependencyName}@${version.replace(versionModiferRegExp, '')}`;
    });
}

export function copyScripts(source: PackageJson, scripts: string[]): Record<string, string> {
    const sourceScripts = source.scripts;

    if (scripts.length === 0) {
        return {};
    }

    if (sourceScripts == null) {
        throw new Error(`No scripts defined on source package json`);
    }

    const scriptValues = scripts.map((scriptName) => ({
        scriptName,
        scriptValue: sourceScripts[scriptName],
    }));

    const missingScripts = scriptValues
        .filter(({ scriptValue }) => scriptValue == null)
        .map(({ scriptName }) => scriptName);

    if (missingScripts.length > 0) {
        throw new Error(
            `Could not find scripts [${missingScripts.map((scriptName) => "'" + scriptName + "'").join(', ')}] to copy.`
        );
    }

    let returnScripts = {};

    scripts.forEach((scriptName) => {
        returnScripts = { ...returnScripts, [scriptName]: sourceScripts[scriptName] };
    });

    return returnScripts;
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

    packageJson.scripts = {
        ...packageJson.scripts,
        ...scripts,
    };

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, undefined, indent));

    complete();
}

export function copyConfig(srcPath: string, targetPath: string, replaceContent?: (value: string) => string): void {
    const complete = writeProgressMessage(`Copying '${basename(srcPath)}' to '${targetPath}'`);

    if (replaceContent) {
        let fileContent = readFileSync(srcPath).toString();
        fileContent = replaceContent(fileContent);
        writeFileSync(targetPath, fileContent);
    } else {
        copyFileSync(srcPath, targetPath);
    }

    complete();
}

export function loadPackageJson(
    path?: string
): {
    packageJsonPath: string;
    packageJson: PackageJson;
    indent: string;
} {
    const packageJsonPath = path || join(process.cwd(), 'package.json');

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
