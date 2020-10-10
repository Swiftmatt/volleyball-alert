/* eslint-disable
    @typescript-eslint/no-require-imports,
    @typescript-eslint/no-unsafe-assignment,
    @typescript-eslint/no-unsafe-call,
    @typescript-eslint/no-unsafe-member-access,
    @typescript-eslint/no-var-requires,
*/

const Fs = require('fs');
const Path = require('path');
const strip = require('strip-comments');
const { pathsToModuleNameMapper } = require('ts-jest/utils');

const tsConfigFile = 'tsconfig.json';
const tsConfigFilePath = Path.resolve(__dirname, tsConfigFile);

if ( !Fs.existsSync(tsConfigFilePath) ) {
    throw new Error('Unable to find tsConfigFile from Jest Config.');
}

const fileContent = Fs.readFileSync(tsConfigFilePath, 'utf8');
const fileContentWithoutComments = strip(fileContent, {});
const tsConfigWithoutComments = JSON.parse(fileContentWithoutComments);
const { paths } = tsConfigWithoutComments.compilerOptions;

module.exports = {
    moduleNameMapper: pathsToModuleNameMapper(paths, {
        prefix: '<rootDir>/',
    }),
    preset: 'ts-jest',
};
