import { expect } from 'chai';
import { ClientDataSource } from '../../../src/infrastructure/data/client-data-source';
import { DataSourcePager, PageType } from '../../../src/infrastructure/data/data-source-pager';

export default describe('DataSourcePager', () => {
    function createPager(pageSize = 2) {
        const dataSource = new ClientDataSource({
            data: () => [{ value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }],
            view: { page: { index: 2, size: pageSize } },
        });
        dataSource.dataBind();

        return new DataSourcePager(dataSource);
    }

    describe('canMoveToPage', () => {
        describe('can move to first page', () => {
            it('if current page is last', () => {
                const pager = createPager();

                pager.moveToPage(PageType.Last);

                expect(pager.canMoveToPage(PageType.First)).to.equal(true);
            });

            it('if current page is first', () => {
                const pager = createPager();

                pager.moveToPage(PageType.First);

                expect(pager.canMoveToPage(PageType.First)).to.equal(false);
            });
        });

        describe('can move to last page', () => {
            it('if current page is first', () => {
                const pager = createPager();

                pager.moveToPage(PageType.First);

                expect(pager.canMoveToPage(PageType.Last)).to.equal(true);
            });

            it('if current page is last', () => {
                const pager = createPager();

                pager.moveToPage(PageType.Last);

                expect(pager.canMoveToPage(PageType.Last)).to.equal(false);
            });
        });

        describe('can move to next page', () => {
            it('if current page is first', () => {
                const pager = createPager();

                pager.moveToPage(PageType.First);

                expect(pager.canMoveToPage(PageType.Next)).to.equal(true);
            });

            it('if current page is last', () => {
                const pager = createPager();

                pager.moveToPage(PageType.Last);

                expect(pager.canMoveToPage(PageType.Next)).to.equal(false);
            });
        });

        describe('can move to previous page', () => {
            it('if current page is last', () => {
                const pager = createPager();

                pager.moveToPage(PageType.Last);

                expect(pager.canMoveToPage(PageType.Previous)).to.equal(true);
            });

            it('if current page is first', () => {
                const pager = createPager();

                pager.moveToPage(PageType.First);

                expect(pager.canMoveToPage(PageType.Previous)).to.equal(false);
            });
        });
    });

    describe('getPageInfo', () => {
        it('if total count more then page size', () => {
            [
                { pageIndex: 0, pageInfo: { firstIndex: 0, lastIndex: 1 } },
                { pageIndex: 1, pageInfo: { firstIndex: 2, lastIndex: 3 } },
                { pageIndex: 2, pageInfo: { firstIndex: 4, lastIndex: 4 } },
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
            const dataSource = new ClientDataSource({
                data: () => [],
                view: { page: { index: 0, size: 2 } },
            });
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

            expect(pager.dataSource.view.page.index).to.equal(0);
        });

        it('to last page', () => {
            const pager = createPager();

            pager.moveToPage(PageType.First);
            pager.moveToPage(PageType.Last);

            expect(pager.dataSource.view.page.index).to.equal(2);
        });

        it('to next page', () => {
            const pager = createPager();

            pager.moveToPage(PageType.First);
            pager.moveToPage(PageType.Next);

            expect(pager.dataSource.view.page.index).to.equal(1);
        });

        it('to previous page', () => {
            const pager = createPager();

            pager.moveToPage(PageType.Last);
            pager.moveToPage(PageType.Previous);

            expect(pager.dataSource.view.page.index).to.equal(1);
        });
    });
});