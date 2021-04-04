import { PackageJson } from '../src/types';
import { getDependencyVersions } from '../src/helpers';

describe('helpers', () => {
    describe('getDependencyVersions', () => {
        it('should return a list of versioned dependencies', () => {
            const packageJson: PackageJson = {
                dependencies: { one: '1.2.3', two: '2.3.4', three: '3.4.5' },
                devDependencies: { three: '3.5.7', four: '4.5.6' },
                scripts: {},
            };

            expect(getDependencyVersions(packageJson, ['two', 'three', 'four', 'five'])).toEqual([
                'two@2.3.4',
                'three@3.4.5',
                'four@4.5.6',
                'five',
            ]);
        });
    });
});
