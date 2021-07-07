import {
    Options,
    OptionsWithUri,
    OptionsWithUrl,
} from 'request-promise-native';
import {
    RequestError,
    StatusCodeError,
} from 'request-promise-native/errors';

import { isNil } from 'src/lib/Util';


export function onRejectJsdomFromUrl(err: RequestError | StatusCodeError): never {
    const {
        name,
        options,
    } = err;

    if ( isStatusCodeError(err) ) {
        console.error(`Status Code: ${err.statusCode}`);
    }

    const uriOrUrl = getUriOrUrl(options);
    throw new Error(`A ${name} occurred while using \`JSDOM.fromURL\` to fetch page content. (${uriOrUrl})`);
}

// eslint-disable-next-line max-statements
export function getUriOrUrl(options: Options): string {
    // eslint-disable-next-line @typescript-eslint/init-declarations
    let uriOrUrl;
    if ( isOptionsWithUri(options) ) {
        uriOrUrl = options.uri;
    }
    if ( isOptionsWithUrl(options) ) {
        uriOrUrl = options.url;
    }
    if ( !isNil(uriOrUrl) ) {
        if (typeof uriOrUrl === 'string') {
            return uriOrUrl;
        }
        if (typeof uriOrUrl === 'object') {
            return uriOrUrl.href;
        }
    }
    throw new Error('Unable to parse `uri` or `url` from options.');
}

export function isOptionsWithUri(options: Options): options is OptionsWithUri {
    return 'uri' in options;
}

export function isOptionsWithUrl(options: Options): options is OptionsWithUrl {
    return 'url' in options;
}

export function isStatusCodeError(error: Error): error is StatusCodeError {
    return error.name === 'StatusCodeError';
}
