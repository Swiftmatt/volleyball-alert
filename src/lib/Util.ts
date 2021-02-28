const ARRAY_LENGTH_OF_TWO = 2;


export function isNil(val: unknown): val is undefined | null {
    return val === undefined || val === null;
}

export function isTwoNumberArray(ary: number[]): ary is [number, number] {
    return ary.length === ARRAY_LENGTH_OF_TWO && ary.every(number => !isNaN(number));
}
