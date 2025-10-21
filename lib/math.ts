import { enableBoundaryChecking, minus, plus, round } from "number-precision"

enableBoundaryChecking(false)

export const NPPlus = plus
export const NPMinus = minus
export const NPRound = round