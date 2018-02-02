import { ComparisonExpressionBuilder } from './comparison-expression-builder';
import { ConditionalExpression, LogicalExpression, LogicalOperator } from './expression';

export class ConditionalExpressionBuilder {
    private _comparisonExpressionBuilder: ComparisonExpressionBuilder;
    private _result: ConditionalExpression;

    public constructor(expression?: ConditionalExpression) {
        this._comparisonExpressionBuilder = new ComparisonExpressionBuilder();
        this._result = expression;
    }

    private add(expressionBuilder: (builder: ComparisonExpressionBuilder) => ConditionalExpression, operator: LogicalOperator, next?: (builder: ConditionalExpressionBuilder) => void): ConditionalExpressionBuilder {
        let expression = expressionBuilder(this._comparisonExpressionBuilder)

        if (next) {
            const builder = new ConditionalExpressionBuilder(expression);

            next(builder);

            expression = builder.build();
        }

        this._result = this._result
            ? ({ left: this._result, operator: operator, right: expression } as LogicalExpression)
            : expression;

        return this;
    }

    public and(expressionBuilder: (builder: ComparisonExpressionBuilder) => ConditionalExpression, next?: (builder: ConditionalExpressionBuilder) => ConditionalExpression): ConditionalExpressionBuilder {
        return this.add(expressionBuilder, LogicalOperator.And, next);
    }

    public or(expressionBuilder: (builder: ComparisonExpressionBuilder) => ConditionalExpression, next?: (builder: ConditionalExpressionBuilder) => ConditionalExpression): ConditionalExpressionBuilder {
        return this.add(expressionBuilder, LogicalOperator.Or, next);
    }

    public build(): ConditionalExpression {
        return this._result;
    }
}