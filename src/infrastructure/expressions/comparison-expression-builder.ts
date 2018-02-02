import { ComparisonExpression, ComparisonOperator } from './expression';

export class ComparisonExpressionBuilder {
    private createExpression(field: string, operator: ComparisonOperator, value: any): ComparisonExpression {
        return {
            field: field,
            operator: operator,
            value: value
        };
    }

    public any(field: string, value: any): ComparisonExpression {
        return this.createExpression(field, ComparisonOperator.Any, value);
    }

    public contain(field: string, value: any): ComparisonExpression {
        return this.createExpression(field, ComparisonOperator.Contain, value);
    }

    public equal(field: string, value: any): ComparisonExpression {
        return this.createExpression(field, ComparisonOperator.Equal, value);
    }

    public greater(field: string, value: any): ComparisonExpression {
        return this.createExpression(field, ComparisonOperator.Greater, value);
    }

    public greaterOrEqual(field: string, value: any): ComparisonExpression {
        return this.createExpression(field, ComparisonOperator.GreaterOrEqual, value);
    }

    public less(field: string, value: any): ComparisonExpression {
        return this.createExpression(field, ComparisonOperator.Less, value);
    }

    public lessOrEqual(field: string, value: any): ComparisonExpression {
        return this.createExpression(field, ComparisonOperator.LessOrEqual, value);
    }

    public notEqual(field: string, value: any): ComparisonExpression {
        return this.createExpression(field, ComparisonOperator.NotEqual, value);
    }
}