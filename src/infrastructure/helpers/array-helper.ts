export class ArrayHelper {
    public static clone<T>(value: T[]): T[] {
        return value.slice();
    }
}