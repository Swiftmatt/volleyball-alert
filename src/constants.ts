import * as Path from 'path';


export const ENV_FILE_NAME = '.env';

export const PROJECT_ROOT_PATH = Path.resolve(__dirname, '../');
export const ENV_FILE_PATH = Path.resolve(PROJECT_ROOT_PATH, ENV_FILE_NAME);
