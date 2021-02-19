/**
 * WARNING - If this file is moved from `./src`, the app will break.
 * See usages of `__dirname` below.
 */

import * as Path from 'path';


export const ENV_FILE_NAME = '.env';

export const SRC_PATH = Path.resolve(__dirname);
export const PROJECT_ROOT_PATH = Path.resolve(SRC_PATH, '../');
export const ENV_FILE_PATH = Path.resolve(PROJECT_ROOT_PATH, ENV_FILE_NAME);
