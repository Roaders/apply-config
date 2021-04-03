export type PackageJsonScripts = Record<string, string | undefined>;

export type PackageJson = {
    scripts: PackageJsonScripts | undefined;
    dependencies: Record<string, string | undefined>;
    devDependencies: Record<string, string | undefined>;
};
