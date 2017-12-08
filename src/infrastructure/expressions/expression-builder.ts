import { ConditionalExpression, LogicalExpression, LogicalOperator } from './expression';

// TODO: Need refactoring.
export class ConditionalExpressionBuilder {
    private _result: ConditionalExpression;

    public constructor(expression?: ConditionalExpression) {
        this._result = expression;
    }

    public and(expression: ConditionalExpression): ConditionalExpressionBuilder {
        this._result = this._result
            ? ({ left: this._result, operator: LogicalOperator.And, right: expression } as LogicalExpression)
            : expression;

        return this;
    }

    public or(expression: ConditionalExpression): ConditionalExpressionBuilder {
        this._result = this._result
            ? ({ left: this._result, operator: LogicalOperator.Or, right: expression } as LogicalExpression)
            : expression;

        return this;
    }

    public build(): ConditionalExpression {
        return this._result;
    }
}