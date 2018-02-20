import { expect } from 'chai';
import { SortDirection } from '../../src/infrastructure/data/common';
import { Comparer } from '../../src/infrastructure/comparer';

const comparer = Comparer.instance;

export default describe('Comparer', () => {
    describe('compare', () => {
        describe('with different sort direction', () => {
            it('if sort direction is "Ascending"', () => {
                [
                    { x: 1, y: -1, result: 1 },
                    { x: 1, y: 1, result: 0 },
                    { x: -1, y: 1, result: -1 },
                ].forEach(testCase => {
                    const result = comparer.compare(testCase.x, testCase.y, SortDirection.Ascending);

                    expect(result).to.equal(testCase.result, `x: ${testCase.x}, y: ${testCase.y}`);
                });
            });

            it('if sort direction is "Descending"', () => {
                [
                    { x: 1, y: -1, result: -1 },
                    { x: 1, y: 1, result: 0 },
                    { x: -1, y: 1, result: 1 },
                ].forEach(testCase => {
                    const result = comparer.compare(testCase.x, testCase.y, SortDirection.Descending);

                    expect(result).to.equal(testCase.result, `x: ${testCase.x}, y: ${testCase.y}`);
                });
            });
        });

        it('with different cases', () => {
            [
                // common
                { x: null, y: null, result: 0 },
                // boolean
                { x: true, y: true, result: 0 },
                { x: true, y: false, result: 1 },
                { x: true, y: null, result: 1 },
                { x: false, y: true, result: -1 },
                { x: false, y: false, result: 0 },
                { x: false, y: null, result: 1 },
                { x: null, y: true, result: -1 },
                { x: null, y: false, result: -1 },
                // object
                { x: {}, y: null, result: 1 },
                { x: null, y: {}, result: -1 },
                // string
                { x: 'value0', y: 'value0', result: 0 },
                { x: 'VALUE0', y: 'value0', result: 0 },
                { x: 'value0', y: 'value1', result: -1 },
                { x: 'value0', y: null, result: 1 },
                { x: 'value1', y: 'value0', result: 1 },
                { x: null, y: 'value1', result: -1 },
            ].forEach((testCase, i) => {
                const result = comparer.compare(testCase.x, testCase.y);

                expect(result).to.equal(testCase.result, `${i} - x: ${testCase.x}, y: ${testCase.y}`);
            });
        });
    });
});