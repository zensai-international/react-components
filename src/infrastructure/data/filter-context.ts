import { Event } from '../event';
import { ConditionalExpression } from '../expressions/expression';
import { ConditionalExpressionBuilder } from '../expressions/conditional-expression-builder';

export class FilterContext {
    private _expressionByKey: Map<any, ConditionalExpression>;
    private _onChange: Event<ConditionalExpression>;

    public constructor() {
        this._expressionByKey = new Map();

        this._onChange = new Event<ConditionalExpression>();
    }

    protected handleChange() {
        const expression = this.build();

        this.onChange.trigger(expression);
    }

    public add(key: any, expression: ConditionalExpression) {
        this._expressionByKey.set(key, expression);

        this.handleChange();
    }

    public build(excludeKeys?: any[]): ConditionalExpression {
        const expressionBuilder = new ConditionalExpressionBuilder();

        for (let key in this._expressionByKey) {
            if ((excludeKeys == null) || (excludeKeys.indexOf(key) == -1)) {
                const expression = this._expressionByKey[key];

                if (expression) {
                    expressionBuilder.and(() => expression);
                }
            }
        }

        return expressionBuilder.build();
    }

    public delete(keys: any[]) {
        for (const key of keys) {
            this._expressionByKey.delete(key);
        }

        this.handleChange();
    }

    public get(key: any): ConditionalExpression {
        return this._expressionByKey.get(key);
    }

    public get expressionKeys(): any {
        return Array.from(this._expressionByKey.keys());
    }

    public get onChange(): Event<ConditionalExpression> {
        return this._onChange;
    }
}