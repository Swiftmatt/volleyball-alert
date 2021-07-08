import { JSDOM } from 'jsdom';

import { isNil } from 'src/lib/Util';


export type XpathArgs = {
    contextNode?: Node;
    dom: JSDOM;
    xpath: string;
};


// eslint-disable-next-line max-statements
export function getFirstValueAtXpath(args: XpathArgs): string {
    const {
        contextNode: contextNodeArg,
        dom,
        xpath,
    } = args;

    const { window } = dom;
    const { document } = window;

    const contextNode = contextNodeArg ?? document;

    const xpathResult = document.evaluate(
        xpath,
        contextNode,
        null,
        window.XPathResult.ANY_TYPE,
        null,
    );

    const node = xpathResult.iterateNext();
    if ( isNil(node) ) {
        throw new Error(`Unable to find value for the given xpath. (${xpath})`);
    }

    const value = node.textContent;
    if ( isNil(value) ) {
        throw new Error(`The value found for the given xpath was null. (${xpath})`);
    }

    return value;
}

export function* getNodeAtXpath(args: XpathArgs): Generator<Node | null> {
    const {
        contextNode,
        dom,
        xpath,
    } = args;

    if ( isNil(contextNode) ) {
        throw new Error('The provided `contextNode` is null.');
    }

    const results = dom.window.document.evaluate(
        xpath,
        contextNode,
        null,
        dom.window.XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    );

    let node = results.iterateNext();
    while ( !isNil(node) ) {
        yield node;
        node = results.iterateNext();
    }
}
