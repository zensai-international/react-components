export class Guid {
    private readonly _value: string;

    public constructor(value: string) {
        this._value = value;
    }

    public toString() {
        return this._value;
    }
}

export enum DataType {
    Date,
    Enum,
    String,
    Number
}

export interface GroupExpression {
    fields: string[];
}

export enum SortDirection {
    Ascending = 1 << 0,
    Descending = 1 << 1
}

export interface SortExpression {
    direction: SortDirection;
    field: string;
}