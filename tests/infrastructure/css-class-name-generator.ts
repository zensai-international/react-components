import { expect } from 'chai';
import { CssClassNameGenerator } from '../../src/infrastructure/css-class-name-generator';

export default describe('ClassNameGenerator', () => {
    describe('generate', () => {
        it('result is different', () => {
            let classNameGenerator = new CssClassNameGenerator();

            let className0 = classNameGenerator.generate();
            let className1 = classNameGenerator.generate();

            expect(className0).is.not.null;
            expect(className1).is.not.null;
            expect(className0).to.not.equal(className1);
        });
    });

    describe('generateByKey', () => {
        it('result is the same', () => {
            let classNameGenerator = new CssClassNameGenerator();

            let className0 = classNameGenerator.generateByKey('0');
            let className1 = classNameGenerator.generateByKey('0');

            expect(className0).is.not.null;
            expect(className1).is.not.null;
            expect(className0).to.equal(className1);
        });
    });
});