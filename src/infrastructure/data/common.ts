export enum DataType {
    Date,
    Enum,
    String,
    Number
}

export enum SortDirection {
    Ascending = 1 << 0,
    Descending = 1 << 1
}

export interface SortExpression {
    direction: SortDirection;
    field: string;
}

export interface FilterExpression {
    expression: (model: any) => boolean;
    field: string;
}