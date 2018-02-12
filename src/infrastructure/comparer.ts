import { SortDirection } from './data/common';

export class Comparer {
    public static readonly instance: Comparer = new Comparer();

    private static toComparedValue(value: any): any {
        if (typeof value == 'string') {
            return value.toLowerCase();
        }

        return (value === false) ? 1 : ((value === true) ? 2 : value);
    }

    public compare(x: any, y: any, direction: SortDirection = SortDirection.Ascending): number {
        const xValue = Comparer.toComparedValue(x);
        const yValue = Comparer.toComparedValue(y);

        if ((xValue == null) && (yValue != null)) return (direction == SortDirection.Ascending) ? -1 : 1;
        if ((xValue != null) && (yValue == null)) return (direction == SortDirection.Ascending) ? 1 : -1;
        if (xValue > yValue) return (direction == SortDirection.Ascending) ? 1 : -1;
        if (xValue < yValue) return (direction == SortDirection.Ascending) ? -1 : 1;

        return 0;
    }

    public combine(comparers: (() => number)[]): number {
        let result = 0;

        for (let i = 0; i < comparers.length; i++) {
            const comparer = comparers[i];

            result = comparer();

            if (result != 0) break;
        }

        return result;
    }
}