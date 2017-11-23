export type ComparisonExpression<T> = (x: T) => boolean;

export enum ComparisonOperator {
    Contain,
    Equal
}

export enum LogicalOperator {
    And,
    Or
}

export interface FilterExpression {
    field: string;
    operator: ComparisonOperator;
    value: any;
}