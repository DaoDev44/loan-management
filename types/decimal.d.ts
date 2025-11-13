declare module 'decimal.js' {
  export = Decimal
  export as namespace Decimal

  declare class Decimal {
    constructor(value: Decimal.Value)

    // Static properties
    static readonly ROUND_UP: 0
    static readonly ROUND_DOWN: 1
    static readonly ROUND_CEIL: 2
    static readonly ROUND_FLOOR: 3
    static readonly ROUND_HALF_UP: 4
    static readonly ROUND_HALF_DOWN: 5
    static readonly ROUND_HALF_EVEN: 6
    static readonly ROUND_HALF_CEIL: 7
    static readonly ROUND_HALF_FLOOR: 8

    // Instance properties
    readonly s: number
    readonly e: number
    readonly d: number[]

    // Instance methods
    plus(value: Decimal.Value): Decimal
    minus(value: Decimal.Value): Decimal
    times(value: Decimal.Value): Decimal
    dividedBy(value: Decimal.Value): Decimal
    toDecimalPlaces(digits: number): Decimal
    isZero(): boolean
    lte(value: Decimal.Value): boolean
    toNumber(): number
    toString(): string
    valueOf(): string
    toFixed(): string
    toFixed(digits: number): string
    toFixed(digits: number, rounding: Decimal.Rounding): string

    // Additional common methods
    pow(value: Decimal.Value): Decimal
    sqrt(): Decimal
    abs(): Decimal
    absoluteValue(): Decimal
    ceil(): Decimal
    floor(): Decimal
    round(): Decimal
    comparedTo(value: Decimal.Value): number
    cmp(value: Decimal.Value): number
    equals(value: Decimal.Value): boolean
    eq(value: Decimal.Value): boolean
    greaterThan(value: Decimal.Value): boolean
    gt(value: Decimal.Value): boolean
    greaterThanOrEqualTo(value: Decimal.Value): boolean
    gte(value: Decimal.Value): boolean
    lessThan(value: Decimal.Value): boolean
    lt(value: Decimal.Value): boolean
    lessThanOrEqualTo(value: Decimal.Value): boolean
    negated(): Decimal
    neg(): Decimal
    clampedTo(min: Decimal.Value, max: Decimal.Value): Decimal
    clamp(min: Decimal.Value, max: Decimal.Value): Decimal
    isNaN(): boolean

    // Static methods
    static max(...values: Decimal.Value[]): Decimal
    static min(...values: Decimal.Value[]): Decimal
    static sum(...values: Decimal.Value[]): Decimal
    static set(config: Partial<Decimal.Config>): Decimal.Constructor
    static config(config: Partial<Decimal.Config>): Decimal.Constructor
    static clone(config?: Partial<Decimal.Config>): Decimal.Constructor
    static isDecimal(object: any): object is Decimal
  }

  declare namespace Decimal {
    export type Constructor = typeof Decimal
    export type Instance = Decimal
    export type Rounding = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
    export type Modulo = Rounding | 9
    export type Value = string | number | Decimal

    export interface Config {
      precision?: number
      rounding?: Rounding
      toExpNeg?: number
      toExpPos?: number
      minE?: number
      maxE?: number
      crypto?: boolean
      modulo?: Modulo
      defaults?: boolean
    }
  }

  export { Decimal }
  export default Decimal
}
