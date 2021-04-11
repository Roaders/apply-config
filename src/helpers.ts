import { green, red } from 'chalk';
import { exec } from 'child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import { clearLine, cursorTo } from 'readline';
import { PackageJson, PackageJsonScripts } from './types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const detect = require('detect-json-indent');

export type ProgressMessage = {
    complete: (success?: boolean, updateMessage?: string) => void;
    log: (message: string, ...optional: unknown[]) => void;
    updateMessage: (message: string, spinner?: boolean) => void;
    getMessage: () => string;
};

export function writeProgressMessage(
    message: string,
    spinner = false,
    format?: (message: string) => string
): ProgressMessage {
    let timeout: NodeJS.Timeout | undefined;
    let isComplete = false;

    const formatMessage = format || ((value) => value);

    let dotCount = 3;

    function generateMessage() {
        const dots = Array.from({ length: dotCount })
            .map(() => '.')
            .join('');
        return formatMessage(message + dots);
    }

    function resetCursor() {
        cursorTo(process.stdout, 0);
        clearLine(process.stdout, 1);
    }

    function writeMessage() {
        process.stdout.write(generateMessage());
    }

    function startTimer() {
        dotCount = 0;
        writeMessage();

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
    }

    if (spinner) {
        startTimer();
    } else {
        writeMessage();
    }

    function updateMessage(messageUpdate: string, spinner?: boolean) {
        if (isComplete) {
            throw new Error(`Progress Message is complete`);
        }
        if (spinner === true && timeout == null) {
            startTimer();
        } else if (spinner === false && timeout != null) {
            dotCount = 0;
            clearInterval(timeout);
            timeout = undefined;
        }

        message = messageUpdate;
        resetCursor();
        writeMessage();
    }

    function log(logMessage: string, ...optional: unknown[]) {
        if (isComplete) {
            throw new Error(`Progress Message is complete`);
        }
        resetCursor();
        console.log(logMessage, ...optional);
        writeMessage();
    }

    function complete(success = true, updateMessage?: string) {
        isComplete = true;
        if (timeout != null) {
            clearInterval(timeout);
        }

        dotCount = 3;

        resetCursor();
        message = updateMessage || message;

        if (success) {
            console.log(`${generateMessage()} ${green('\u2713')}`);
        } else {
            console.log(`${generateMessage()} ${red('\u2715')}`);
        }
    }

    function getMessage() {
        return message;
    }

    return { complete, log, updateMessage, getMessage };
}

const versionModifierRegExp = /^[\^~]/;

export function getDependencyVersions(packageJson: PackageJson, dependencyList: string[]): string[] {
    const dependencies = { ...packageJson.devDependencies, ...packageJson.dependencies };

    return dependencyList.map((dependencyName) => {
        const version = dependencies[dependencyName];

        return version == null ? dependencyName : `${dependencyName}@${version.replace(versionModifierRegExp, '')}`;
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
    const complete = writeProgressMessage(`Installing dev dependencies`, true).complete;

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
    const complete = writeProgressMessage(message).complete;

    packageJson.scripts = {
        ...packageJson.scripts,
        ...scripts,
    };

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, undefined, indent));

    complete();
}

export function copyConfig(srcPath: string, targetPath: string, replaceContent?: (value: string) => string): void {
    const complete = writeProgressMessage(`Copying '${basename(srcPath)}' to '${targetPath}'`).complete;

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

    const complete = writeProgressMessage(`Loading 'package.json'`).complete;

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
