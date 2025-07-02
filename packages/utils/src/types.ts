// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type Any = any;
export type Assign<T, U> = Omit<T, keyof U> & U;
export type Booleanish = boolean | "true" | "false";
export type Dict<T = Any> = Record<string, T>;
export type Callable<T = Any> = (...args: T[]) => Any;
export type HTMLProps<T extends keyof React.JSX.IntrinsicElements> = PropsOf<T>;
export type IncludeContainerType = boolean | "if-empty";
export type List<T = Any> = T[];
export type MaybeFunction<T> = T | (() => T);
export type Nullable<T> = T | null | undefined;
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type Props = Dict;
export type PropsOf<T extends React.ElementType> = React.ComponentPropsWithRef<T>;
export type TupleTypes<T extends List> = T[number];
export type UnionToIntersection<U> = (U extends Any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type VoidFunction<T = Any> = (...args: T[]) => void;
