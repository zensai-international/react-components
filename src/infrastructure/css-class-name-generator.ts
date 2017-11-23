export class CssClassNameGenerator {
    private readonly _byKey: { [key: string]: string } = {};

    public generate(): string {
        return '--' + ('00000000' + (Math.random() * Math.pow(36, 8) << 0).toString(36)).slice(-8);
    }

    public generateByKey(key: string): string {
        let result = this._byKey[key];

        if (!result) {
            result = this.generate();
            this._byKey[key] = result;
        }

        return result;
    }
}