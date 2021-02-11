export type PackageJsonScripts = { [name: string]: string | undefined };

export type PackageJson = {
    scripts: PackageJsonScripts | undefined;
};
