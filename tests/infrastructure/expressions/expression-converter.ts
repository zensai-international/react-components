import { expect } from 'chai';
import { ComparisonExpression, ComparisonOperator } from '../../../src/infrastructure/expressions/expression';
import { ExpressionConverter } from '../../../src/infrastructure/expressions/expression-converter';

export default describe('ExpressionConverter', () => {
    describe('convert', () => {
        describe('if operator is "any"', () => {
            const expressionConverter = new ExpressionConverter();
            const item = { field0: ['value0'] };

            function createFilterExpression(value: any): ComparisonExpression {
                return {
                    field: 'field0',
                    operator: ComparisonOperator.Any,
                    value,
                };
            }

            it('if result is true', () => {
                const filterExpression = createFilterExpression('value0');

                const comparisonExpression = expressionConverter.convert(filterExpression);

                expect(comparisonExpression(item)).is.true;
            });

            it('if result is false', () => {
                const filterExpression = createFilterExpression('value1');

                const comparisonExpression = expressionConverter.convert(filterExpression);

                expect(comparisonExpression(item)).is.false;
            });
        });

        describe('if operator is "contain"', () => {
            const expressionConverter = new ExpressionConverter();
            const item = { field0: 'xxxyyyzzz' };

            function createFilterExpression(value: any): ComparisonExpression {
                return {
                    field: 'field0',
                    operator: ComparisonOperator.Contain,
                    value,
                };
            }

            it('if result is true and value is start part', () => {
                const filterExpression = createFilterExpression('xxx');

                const comparisonExpression = expressionConverter.convert(filterExpression);

                expect(comparisonExpression(item)).equal(true);
            });

            it('if result is true and value is middle part', () => {
                const filterExpression = createFilterExpression('yyy');

                const comparisonExpression = expressionConverter.convert(filterExpression);

                expect(comparisonExpression(item)).equal(true);
            });

            it('if result is true and value is middle part (upper case)', () => {
                const filterExpression = createFilterExpression('YYY');

                const comparisonExpression = expressionConverter.convert(filterExpression);

                expect(comparisonExpression(item)).equal(true);
            });

            it('if result is true and value is end part', () => {
                const filterExpression = createFilterExpression('zzz');

                const comparisonExpression = expressionConverter.convert(filterExpression);

                expect(comparisonExpression(item)).equal(true);
            });

            it('if result is false', () => {
                const filterExpression = createFilterExpression('xxxxxxxxx');

                const comparisonExpression = expressionConverter.convert(filterExpression);

                expect(comparisonExpression(item)).equal(false);
            });

            it('if result is false and value is null', () => {
                const filterExpression = createFilterExpression(null);

                const comparisonExpression = expressionConverter.convert(filterExpression);

                expect(comparisonExpression(item)).equal(false);
            });
        });

        describe('if operator is "contain" and field is array', () => {
            const expressionConverter = new ExpressionConverter();
            const item = { fields: [{ field0: 'xxxyyyzzz' }] };

            function createFilterExpression(value: any): ComparisonExpression {
                return {
                    field: 'fields.field0',
                    operator: ComparisonOperator.Contain,
                    value,
                };
            }

            it('if result is true and value is start part', () => {
                const filterExpression = createFilterExpression('xxx');

                const comparisonExpression = expressionConverter.convert(filterExpression);

                expect(comparisonExpression(item)).equal(true);
            });

            it('if result is true and value is middle part', () => {
                const filterExpression = createFilterExpression('yyy');

                const comparisonExpression = expressionConverter.convert(filterExpression);

                expect(comparisonExpression(item)).equal(true);
            });

            it('if result is true and value is end part', () => {
                const filterExpression = createFilterExpression('zzz');

                const comparisonExpression = expressionConverter.convert(filterExpression);

                expect(comparisonExpression(item)).equal(true);
            });
        });
    });
});