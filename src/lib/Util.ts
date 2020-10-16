export function isNil(val: unknown): val is undefined | null {
    return val === undefined || val === null;
}
