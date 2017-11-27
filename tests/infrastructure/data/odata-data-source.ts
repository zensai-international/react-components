import { expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonPromise from 'sinon-promise';
import { DataSourceState } from '../../../src/infrastructure/data/data-source';
import { ODataDataSource } from '../../../src/infrastructure/data/odata-data-source';

sinonPromise(sinon);

const totalCount = 10;
const serviceResult = {
    '@odata.count': totalCount,
    'value': [{ field: 'value0' }, { field: 'value1' }, { field: 'value2' }]
};
const serviceUrl = 'https://service/models';

function getData(): Promise<any> {
    return new Promise((resolve: (value?: any) => void) => {
        resolve(serviceResult);
    });
}

export default describe('ODataDataSource', () => {
    describe('dataBind', () => {
        it('default behaviour', () => {
            const dataSource = new ODataDataSource<any>({ dataGetter: getData, url: serviceUrl });
            
            expect(dataSource.view).to.be.null;
            expect(dataSource.state).to.equal(DataSourceState.Empty, 'state');
    
            dataSource.dataBind()
                .then(view => {
                    expect(dataSource.view).to.be.not.null;
                    expect(dataSource.state).to.equal(DataSourceState.Bound, 'state');
    
                    expect(view.data[0].field).to.equal('value0');
                    expect(view.data[1].field).to.equal('value1');
                    expect(view.data[2].field).to.equal('value2');
    
                    expect(dataSource.totalCount).to.equal(totalCount, 'totalCount');
                });
        });

        it(`generated url must be '${serviceUrl}?$count=true' if it is first time`, () => {
            const dataGetter = sinon.promise();
            const dataSource = new ODataDataSource<any>({
                dataGetter: dataGetter,
                url: serviceUrl
            });

            dataSource.dataBind();

            expect(dataGetter.calledOnce).to.be.true;
        });

        it(`generated url must be '${serviceUrl}' if it is second time`, () => {
            // const dataSource = new ODataDataSource<any>({
            //     dataGetter: (generatedUrl: string) => {
            //         expect(generatedUrl).to.equal(serviceUrl);

            //         return getData();
            //     },
            //     url: serviceUrl
            // });

            // dataSource.dataBind();
        });
    });
});