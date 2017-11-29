import * as React from 'react';
import * as ReactDom from 'react-dom';
import { GridColumn, GridExpandContentColumn } from '../src/components/grid/grid-column';
// import { GridDetailsColumn } from '../src/components/grid/grid-details-column';
import { InfiniteScrollPager } from '../src/components/pager/infinite-scroll-pager';
import { Grid, DefaultStyle as GridDefaultStyle } from '../src/components/grid/grid';
import { ClientDataSource } from '../src/infrastructure/data/client-data-source';
import { DataViewMode } from '../src/infrastructure/data/data-source';
import { EventsStore } from "../src/infrastructure/event-store";

import { GridBodyRow, GridBodyRowProps } from "../src/components/grid/grid-body-row";


//import { GridColumn as GridColumnBase, GridColumnProps } from '../src/components/grid/grid-column-base';

function getData(count: number): any[] {
    const result = [];

    for (let i = 0; i < count; i++) {
        result.push({ description: `description${i}`, title: `title${i}`, subItems:[
            {description: `${i}-d`, title: `${i}-t`},
            {description: `${i*2}-d`, title: `${i*2}-t`},
            {description: `${i*3}-d`, title: `${i*3}-t`}
        ] })
    }

    return result;
}

const data = getData(1000);
const dataSource = new ClientDataSource({ dataGetter: () => data, pageSize: 50, viewMode: DataViewMode.FromFirstToCurrentPage });
const eventStore = new EventsStore();




function renderSubRows(rowType: { new(): GridBodyRow<GridBodyRowProps, any> }, eventStore: EventsStore, index: number, model: any) : JSX.Element[] {
    const Row = rowType;
    const columns = [
            new GridColumn({body:{ template: () => "" } }),
            new GridColumn({field:"title", title:"Title"}),
            new GridColumn({field:"description", title:"description"})
        ];
    const childDataSource = new ClientDataSource<any>({dataGetter: ()=> model.subItems });
    childDataSource.dataBind();

    return model.subItems.map(v=>
         <Row columns={columns} dataSource={childDataSource} eventsStore={eventStore}
                         style={GridDefaultStyle.body.dataRow} index={index} model={v}/>
     )


}

ReactDom.render(
    <InfiniteScrollPager dataSource={dataSource}>
        <Grid autoBind={true} dataSource={dataSource} eventsStore={eventStore} >
            <GridExpandContentColumn renderDetails = {(rowType: { new(): GridBodyRow<GridBodyRowProps, any> }, index: number, model: any) => renderSubRows(rowType, eventStore, index, model) }
                                     eventsStore={eventStore} />

            <GridColumn field="title" title="Title" />
            <GridColumn field="description" title="Description" />
            <GridColumn
                isSortable={false}
                body={{ template: (_, x) => (<a href="#">{x.title}</a>)}}
                title="Link" />
        </Grid>
    </InfiniteScrollPager>,
    document.getElementById('grid')
);