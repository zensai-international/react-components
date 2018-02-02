import { Event } from '../event';
import { ConditionalExpression } from '../expressions/expression';
import { ConditionalExpressionBuilder } from '../expressions/conditional-expression-builder';

export class FilterContext {
    private _expression: ConditionalExpression;
    private _expressionByKey: { [key: number]: ConditionalExpression };
    private _onChange: Event<ConditionalExpression>;

    public constructor() {
        this._expressionByKey = {};

        this._onChange = new Event<ConditionalExpression>();

        this._expression = this.buildResultExpression();
    }

    private buildResultExpression(): ConditionalExpression {
        const expressionBuilder = new ConditionalExpressionBuilder();

        for (let key in this._expressionByKey) {
            const expression = this._expressionByKey[key];

            if (expression) {
                expressionBuilder.and(() => expression);
            }
        }

        return expressionBuilder.build();
    }

    public add(key: any, expression: ConditionalExpression) {
        this._expressionByKey[key] = expression;

        this._expression = this.buildResultExpression();

        this.onChange.trigger(this._expression);
    }

    public delete(keys: any[]) {
        for (const key of keys) {
            this._expressionByKey[key] = null;
        }

        this._expression = this.buildResultExpression();

        this.onChange.trigger(this._expression);
    }

    public get(key: any): ConditionalExpression {
        return this._expressionByKey[key];
    }

    public get expression(): ConditionalExpression {
        return this._expression;
    }

    public get onChange(): Event<any> {
        return this._onChange;
    }
}