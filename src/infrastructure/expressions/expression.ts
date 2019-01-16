import { DataType } from '../data/common';

export type LambdaExpression<T = {}> = (x: T) => boolean;

export enum ComparisonOperator {
    Any,
    Contain,
    Equal,
    Greater,
    GreaterOrEqual,
    Less,
    LessOrEqual,
    NotEqual,
}

export interface ComparisonExpression {
    expression?: ((item: any) => boolean) | string;
    field?: string;
    operator?: ComparisonOperator;
    title?: string;
    value?: any;
    valueType?: DataType;
}

export enum LogicalOperator {
    And,
    Or,
}

export interface LogicalExpression {
    left: ConditionalExpression;
    operator: LogicalOperator;
    right: ConditionalExpression;
}

export type ConditionalExpression = ComparisonExpression | LogicalExpression;