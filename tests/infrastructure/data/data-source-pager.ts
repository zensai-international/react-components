import { expect } from 'chai';
import * as Mocha from 'mocha';
import { ClientDataSource } from '../../../src/infrastructure/data/client-data-source';
import { DataSourcePager, PageType } from '../../../src/infrastructure/data/data-source-pager';

describe('DataSourcePager', () => {
    function createPager(pageSize?: number) {
        const dataSource = new ClientDataSource(
            [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }],
            { pageSize: pageSize || 2, pageIndex: 2 }
        );
        dataSource.dataBind();

        return new DataSourcePager(dataSource);
    }

    describe('canMoveToPage', () => {
        describe('can move to first page', () => {
            it('if current page is last', () => {
                const pager = createPager();
    
                pager.moveToPage(PageType.Last);
    
                expect(pager.canMoveToPage(PageType.First)).equal(true);
            });
    
            it('if current page is first', () => {
                const pager = createPager();
    
                pager.moveToPage(PageType.First);
    
                expect(pager.canMoveToPage(PageType.First)).equal(false);
            });
        });

        describe('can move to last page', () => {
            it('if current page is first', () => {
                const pager = createPager();
    
                pager.moveToPage(PageType.First);
    
                expect(pager.canMoveToPage(PageType.Last)).equal(true);
            });
    
            it('if current page is last', () => {
                const pager = createPager();
    
                pager.moveToPage(PageType.Last);
    
                expect(pager.canMoveToPage(PageType.Last)).equal(false);
            });
        });

        describe('can move to next page', () => {
            it('if current page is first', () => {
                const pager = createPager();
    
                pager.moveToPage(PageType.First);
    
                expect(pager.canMoveToPage(PageType.Next)).equal(true);
            });
    
            it('if current page is last', () => {
                const pager = createPager();
    
                pager.moveToPage(PageType.Last);
    
                expect(pager.canMoveToPage(PageType.Next)).equal(false);
            });
        });

        describe('can move to previous page', () => {
            it('if current page is last', () => {
                const pager = createPager();
    
                pager.moveToPage(PageType.Last);
    
                expect(pager.canMoveToPage(PageType.Previous)).equal(true);
            });
    
            it('if current page is first', () => {
                const pager = createPager();
    
                pager.moveToPage(PageType.First);
    
                expect(pager.canMoveToPage(PageType.Previous)).equal(false);
            });
        });

        it('if first page size is 1 and page size is 2', () => {
            const dataSource = new ClientDataSource(
                [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }],
                { firstPageSize: 1, pageSize: 2, pageIndex: 1 }
            );    
            const pager = new DataSourcePager(dataSource);

            dataSource.dataBind();

            expect(pager.canMoveToPage(PageType.Next)).equal(true);
        });
    });

    describe('getPageInfo', () => {
        it('if total count more then page size', () => {
            [
                { pageIndex: 0, pageInfo: { firstIndex: 0, lastIndex: 1 }},
                { pageIndex: 1, pageInfo: { firstIndex: 2, lastIndex: 3 }},
                { pageIndex: 2, pageInfo: { firstIndex: 4, lastIndex: 4 }}
            ].forEach(x => {
                const pager = createPager();

                const pageInfo = pager.getPageInfo(x.pageIndex);

                expect(pageInfo.firstIndex).to.equal(x.pageInfo.firstIndex, 'firstIndex');
                expect(pageInfo.lastIndex).to.equal(x.pageInfo.lastIndex, 'lastIndex');
            });
        });

        it('if total count less then page size', () => {
            const pager = createPager(10);

            const pageInfo = pager.getPageInfo(0);

            expect(pageInfo.firstIndex).to.equal(0, 'firstIndex');
            expect(pageInfo.lastIndex).to.equal(4, 'lastIndex');
        });

        it('if data source is empty', () => {
            const dataSource = new ClientDataSource([], { pageSize: 2, pageIndex: 0 });
            const pager = new DataSourcePager(dataSource);

            dataSource.dataBind();

            const pageInfo = pager.getPageInfo(0);

            expect(pageInfo.firstIndex).to.equal(0, 'firstIndex');
            expect(pageInfo.lastIndex).to.equal(0, 'lastIndex');
        });
    });

    describe('moveToPage', () => {
        it('to first page', () => {
            const pager = createPager();

            pager.moveToPage(PageType.Last);
            pager.moveToPage(PageType.First);

            expect(pager.dataSource.view.pageIndex).to.equal(0);
        });

        it('to last page', () => {
            const pager = createPager();

            pager.moveToPage(PageType.First);
            pager.moveToPage(PageType.Last);

            expect(pager.dataSource.view.pageIndex).to.equal(2);
        });

        it('to next page', () => {
            const pager = createPager();

            pager.moveToPage(PageType.First);
            pager.moveToPage(PageType.Next);

            expect(pager.dataSource.view.pageIndex).to.equal(1);
        });

        it('to previous page', () => {
            const pager = createPager();

            pager.moveToPage(PageType.Last);
            pager.moveToPage(PageType.Previous);

            expect(pager.dataSource.view.pageIndex).to.equal(1);
        });
    });
});