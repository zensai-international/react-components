import { ComparisonExpression, ComparisonOperator, LambdaExpression } from './expression';
import { DefaultFieldAccessor, FieldAccessor } from '../data/field-accessor';

export class ExpressionConverter {
    private _fieldAccessor: FieldAccessor = new DefaultFieldAccessor();

    public toComparison<T>(expression: ComparisonExpression): LambdaExpression<T> {
        return item => {
            let result = null;
            let comparer = null;
            const value = this._fieldAccessor.getValue(item, expression.field);

            switch (expression.operator) {
                case ComparisonOperator.Contain:
                    comparer = x => (x != null)
                        && (expression.value != null)
                        && (x.toString().toLowerCase().indexOf(expression.value.toLowerCase()) != -1);
                    break;
                case ComparisonOperator.Equal:
                    comparer = x => x == expression.value;
                    break;
            }

            if (value instanceof Array) {
                result = value.some(x => comparer(x));
            } else {
                result = comparer(value)
            }

            return result;
        };
    }
}