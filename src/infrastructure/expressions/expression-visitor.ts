import { ComparisonExpression, ConditionalExpression, LogicalExpression, LogicalOperator } from './expression';

//TODO: Need refactoring.
export interface ExpressionVisitorProps {
    onVisitComparison: (expression: ComparisonExpression) => string;
    onVisitLogical: (left: string, operator: LogicalOperator, right: string) => string;
} 

export class ExpressionVisitor {
    private readonly props: ExpressionVisitorProps;

    public constructor(props: ExpressionVisitorProps) {
        this.props = props;
    }

    protected visitComparison(expression: ComparisonExpression): string {
        return (expression.expression as string) || this.props.onVisitComparison(expression);
    }

    protected visitLogical(expression: LogicalExpression): string {
        const left = this.visit(expression.left);
        const right = this.visit(expression.right);

        return this.props.onVisitLogical(left, expression.operator, right);
    }

    public visit(expression: ConditionalExpression): string {
        let result = '';
        const logicalExpression = expression as LogicalExpression;

        if (logicalExpression.left && logicalExpression.right) {
            result = this.visitLogical(logicalExpression);
        } else {
            result = this.visitComparison(expression as ComparisonExpression);
        }

        return result;
    }
}