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

export function* getNodeAtXpath(dom: JSDOM, xpath: string, context: Node): Generator<Node | null> {
    const results = dom.window.document.evaluate(
        xpath,
        context,
        null,
        dom.window.XPathResult.ORDERED_NODE_ITERATOR_TYPE,
    );

    let node = results.iterateNext();
    while ( !isNil(node) ) {
        yield node;
        node = results.iterateNext();
    }
}
