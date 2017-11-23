import { ComparisonExpression } from './expression';

export class ExpressionBuilder<T> {
    private _expression: ComparisonExpression<T>;

    private internalAnd(expression: ComparisonExpression<T>): ExpressionBuilder<T> {
        this._expression = this._expression
            ? (expression ? (x => y => x(y) && expression(y))(this._expression) : this._expression)
            : expression;

        return this;
    }

    public and(expressions: ComparisonExpression<T>[]): ExpressionBuilder<T> {
        for (let i = 0; i < expressions.length; i++) {
            this.internalAnd(expressions[i]);
        }

        return this;
    }

    public build(): ComparisonExpression<T> {
        return this._expression || function () { return true; };
    }
}