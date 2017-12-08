export type LambdaExpression<T> = (x: T) => boolean;

export enum ComparisonOperator {
    Contain,
    Equal,
    Greater,
    GreaterOrEqual,
    Less,
    LessOrEqual,
    NotEqual
}

export interface ComparisonExpression {
    expression?: ((model: any) => boolean) | string;
    field?: string;
    operator?: ComparisonOperator;
    value?: any;
}

export enum LogicalOperator {
    And,
    Or
}

export interface LogicalExpression {
    left: ConditionalExpression;
    operator: LogicalOperator;
    right: ConditionalExpression;
}

export type ConditionalExpression = ComparisonExpression | LogicalExpression;