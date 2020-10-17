export function isNil(val: unknown): val is undefined | null {
    return val === undefined || val === null;
}

export function isTwoNumberArray(ary: number[]): ary is [number, number] {
    return ary.length === 2 && ary.every(number => !isNaN(number));
}
