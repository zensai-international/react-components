const PossibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';

export class CssClassNameGenerator {
    private readonly _byKey: { [key: string]: string } = {};

    public generate(): string {
        let result = '';

        for (let i = 0; i < 10; i++) {
            result += PossibleChars.charAt(Math.floor(Math.random() * PossibleChars.length));
        }

        return result;
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