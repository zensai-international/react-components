import { ConditionalExpression, ComparisonExpression, ComparisonOperator, LambdaExpression } from './expression';
import { DefaultFieldAccessor, FieldAccessor } from '../data/field-accessor';
import { LogicalExpression, LogicalOperator } from '../../index';

export class ExpressionConverter {
    private _fieldAccessor: FieldAccessor = new DefaultFieldAccessor();

    private convertComparison<T>(expression: ComparisonExpression): LambdaExpression<T> {
        return item => {
            let result = null;
            let comparer = null;
            const value = this._fieldAccessor.getValue(item, expression.field);

            switch (expression.operator) {
                case ComparisonOperator.Any:
                    comparer = (expression.value instanceof Array)
                        ? x => x && x.some(y => (expression.value as any[]).some(z => z == y))
                        : x => x && x.some(y => y == expression.value);
                    break;
                case ComparisonOperator.Contain:
                    comparer = x => (x != null)
                        && (expression.value != null)
                        && (x.toString().toLowerCase().indexOf(expression.value.toLowerCase()) != -1);
                    break;
                case ComparisonOperator.Equal:
                    comparer = x => x == expression.value;
                    break;
                case ComparisonOperator.Greater:
                    comparer = x => x > expression.value;
                    break;
                case ComparisonOperator.GreaterOrEqual:
                    comparer = x => x >= expression.value;
                    break;
                case ComparisonOperator.Less:
                    comparer = x => x < expression.value;
                    break;
                case ComparisonOperator.LessOrEqual:
                    comparer = x => x <= expression.value;
                    break;
                case ComparisonOperator.NotEqual:
                    comparer = x => x != expression.value;
                    break;
            }

            // if (value instanceof Array) {
            //     result = value.some(x => comparer(x));
            // } else {
                result = comparer(value)
            // }

            return result;
        };
    }

    private convertLogical<T>(expression: LogicalExpression): LambdaExpression<T> {
        const leftExpression = this.convert<T>(expression.left);
        const rightExpression = this.convert<T>(expression.right);

        switch (expression.operator) {
            case LogicalOperator.And:
                return x => leftExpression(x) && rightExpression(x);
            case LogicalOperator.Or:
                return x => leftExpression(x) || rightExpression(x);
        }
    }

    public convert<T>(expression: ConditionalExpression): LambdaExpression<T> {
        const logicalExpression = (expression as LogicalExpression);

        if (logicalExpression.left && logicalExpression.right) {
            return this.convertLogical(logicalExpression);
        } else {
            return this.convertComparison(expression as ComparisonExpression);
        }
    }
}