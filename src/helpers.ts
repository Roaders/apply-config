import { red } from 'chalk';
import { exec } from 'child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { PackageJson, PackageJsonScripts } from './types';
import print from 'message-await';
import { promisify } from 'util';

const execAsync = promisify(exec);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const detect = require('detect-json-indent');
// eslint-disable-next-line @typescript-eslint/no-var-requires

const versionModifierRegExp = /^[\^~]/;

export function getDependencyVersions(packageJson: PackageJson, dependencyList: string[]): (string | undefined)[] {
    const dependencies = { ...packageJson.devDependencies, ...packageJson.dependencies };

    return dependencyList.map((dependencyName) => {
        const version = dependencies[dependencyName];

        return version == null ? undefined : `${dependencyName}@${version.replace(versionModifierRegExp, '')}`;
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

export async function installDependencies(dependencies: string[]): Promise<boolean> {
    const installCommand = `npm install -D ${dependencies.join(' ')}`;

    return await print(`Installing dev dependencies`, true)
        .await(execAsync(installCommand))
        .then(({ stderr, stdout }) => {
            console.log(stderr);
            console.log(stdout);
            return true;
        })
        .catch((err) => {
            console.log(` `);
            console.log(red(`Error installing dependencies:`), err);
            return false;
        });
}

export function updatePackageJsonScripts(
    scripts: PackageJsonScripts,
    message: string,
    packageJson: PackageJson,
    packageJsonPath: string,
    indent: string
): void {
    const { complete } = print(message);

    packageJson.scripts = {
        ...packageJson.scripts,
        ...scripts,
    };

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, undefined, indent));

    complete();
}

export function copyConfig(srcPath: string, targetPath: string, replaceContent?: (value: string) => string): void {
    const { complete } = print(`Copying '${basename(srcPath)}' to '${targetPath}'`);

    if (replaceContent) {
        let fileContent = readFileSync(srcPath).toString();
        fileContent = replaceContent(fileContent);
        writeFileSync(targetPath, fileContent);
    } else {
        copyFileSync(srcPath, targetPath);
    }

    complete();
}

export function loadPackageJson(path?: string): {
    packageJsonPath: string;
    packageJson: PackageJson;
    indent: string;
} {
    const packageJsonPath = path || join(process.cwd(), 'package.json');

    const { complete } = print(`Loading 'package.json'`);

    let packageJson: PackageJson;
    let indent = '';

    try {
        const stringified = readFileSync(packageJsonPath).toString();
        indent = detect(stringified);
        packageJson = JSON.parse(stringified);

        complete();
    } catch (e) {
        complete(false);
        console.log(`${red(`Error:`)} could not load package.json from '${packageJsonPath}'.`);
        console.log(`Please ensure you run command from a folder that contains a package.json.`);

        process.exit(1);
    }

    return { packageJsonPath, packageJson, indent };
}

export function isDefined<T>(value: T | null | undefined): value is T {
    return value != null;
}
