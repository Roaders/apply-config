import { PackageJson } from '../src/types';
import { copyScripts, getDependencyVersions } from '../src/helpers';

describe('helpers', () => {
    describe('getDependencyVersions', () => {
        it('should return a list of versioned dependencies', () => {
            const packageJson: PackageJson = {
                dependencies: { one: '1.2.3', two: '2.3.4', three: '3.4.5' },
                devDependencies: { three: '3.5.7', four: '4.5.6' },
            };

            expect(getDependencyVersions(packageJson, ['two', 'three', 'four', 'five'])).toEqual([
                'two@2.3.4',
                'three@3.4.5',
                'four@4.5.6',
                'five',
            ]);
        });
    });

    describe('copyScripts', () => {
        it('should copy scripts from source to target', () => {
            const sourcePackageJson: PackageJson = {
                scripts: { build: 'tsc', test: 'jest', 'test:watch': 'jest --watch' },
            };

            const returnedScripts = copyScripts(sourcePackageJson, ['test', 'test:watch']);

            expect(returnedScripts).toEqual({
                test: 'jest',
                'test:watch': 'jest --watch',
            });
        });

        it('should throw error if script not found', () => {
            const sourcePackageJson: PackageJson = {
                scripts: { build: 'tsc', test: 'jest', 'test:watch': 'jest --watch' },
            };

            expect(() => copyScripts(sourcePackageJson, ['missingScript', 'missingOtherScript'])).toThrowError(
                "Could not find scripts ['missingScript', 'missingOtherScript'] to copy."
            );
        });

        it('should throw error if no scripts defined on source', () => {
            const sourcePackageJson: PackageJson = {};

            expect(() => copyScripts(sourcePackageJson, ['missingScript', 'missingOtherScript'])).toThrowError(
                'No scripts defined on source package json'
            );
        });

        it('should not throw error when no scripts defined on source and no scripts passed', () => {
            const sourcePackageJson: PackageJson = {};

            const returnedScripts = copyScripts(sourcePackageJson, []);

            expect(returnedScripts).toEqual({});
        });
    });
});
