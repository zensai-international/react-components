import { Event } from '../event';
import { ConditionalExpression } from '../expressions/expression';
import { ConditionalExpressionBuilder } from '../expressions/conditional-expression-builder';

export class FilterContext {
    private _expressionByKey: { [key: number]: ConditionalExpression };
    private _onChange: Event<ConditionalExpression>;

    public constructor() {
        this._expressionByKey = {};

        this._onChange = new Event<ConditionalExpression>();
    }

    public add(key: any, expression: ConditionalExpression) {
        this._expressionByKey[key] = expression;

        this.onChange.trigger(this.build());
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
            this._expressionByKey[key] = null;
        }

        this.onChange.trigger(this.build());
    }

    public get(key: any): ConditionalExpression {
        return this._expressionByKey[key];
    }

    public get onChange(): Event<ConditionalExpression> {
        return this._onChange;
    }
}