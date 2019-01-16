import { LogicalExpression, LogicalOperator } from '../../index';
import { DefaultFieldAccessor, FieldAccessor } from '../data/field-accessor';
import { ComparisonExpression, ComparisonOperator, ConditionalExpression, LambdaExpression } from './expression';

export class ExpressionConverter {
    private _fieldAccessor: FieldAccessor = new DefaultFieldAccessor();

    private convertComparison<T = {}>(expression: ComparisonExpression): LambdaExpression<T> {
        return item => {
            let result = null;
            let comparer = null;
            const value = this._fieldAccessor.getValue(item, expression.field);

            switch (expression.operator) {
                case ComparisonOperator.Any:
                    comparer = (expression.value instanceof Array)
                        ? x => x && (expression.value as any[]).some(y => x instanceof Array ? (x as any[]).some(z => z == y) : x == y)
                        : x => x && (x instanceof Array) ? x.some(y => y == expression.value) : x == expression.value;

                    if (!(value instanceof Array)) {
                        comparer = (oldComparer => y => oldComparer([y]))(comparer);
                    }

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
                default:
                    comparer = x => (expression.expression as (item: any) => boolean)(item);
            }

            if (value instanceof Array) {
                result = value.some(x => comparer(x));
            } else {
                result = comparer(value);
            }

            return result;
        };
    }

    private convertLogical<T = {}>(expression: LogicalExpression): LambdaExpression<T> {
        const leftExpression = this.convert<T>(expression.left);
        const rightExpression = this.convert<T>(expression.right);

        switch (expression.operator) {
            case LogicalOperator.And:
                return x => leftExpression(x) && rightExpression(x);
            case LogicalOperator.Or:
                return x => leftExpression(x) || rightExpression(x);
        }
    }

    public convert<T = {}>(expression: ConditionalExpression): LambdaExpression<T> {
        if (!expression) {
            return () => true;
        }

        const logicalExpression = (expression as LogicalExpression);

        return (logicalExpression.left && logicalExpression.right)
            ? this.convertLogical(logicalExpression)
            : this.convertComparison(expression as ComparisonExpression);
    }
}