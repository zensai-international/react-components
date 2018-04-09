import { FieldAccessor } from '../data/field-accessor';

export class ObjectHelper {
    public static create(fieldAccessor: FieldAccessor, fields: string[], values: any[]): {} {
        const result = {};

        for (let i = 0; i < fields.length; i++) {
            const field = fields[i];
            const value = values[i];

            fieldAccessor.setValue(result, field, value);
        }

        return result;
    }

    public static isFunction(object: any): object is (() => void) {
        return typeof object == 'function';
    }

    public static isString(object: any): object is string {
        return typeof object == 'string';
    }
}