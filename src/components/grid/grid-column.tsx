import { GridColumn as GridColumnBase, GridColumnProps } from './grid-column-base';
import { GridBodyRow, GridBodyRowProps } from "./grid-body-row";
import * as React from "React";
import { EventsStore } from "../../infrastructure/event-store";

export class GridColumn extends GridColumnBase<GridColumnProps> {
}

export interface GridExpandContentColumnProps extends GridColumnProps {
    renderDetails: (rowType: { new(): GridBodyRow<GridBodyRowProps, any> }, index: number, model: any) => JSX.Element[];
    eventsStore: EventsStore;
}

export class GridExpandContentColumn extends GridColumnBase<GridExpandContentColumnProps> {
    public static defaultProps: Partial<GridExpandContentColumnProps> = {
        body:{template:(column, model)=> GridExpandContentColumn.renderDefaultExpander(column as GridExpandContentColumn, model)},
        isSortable: false
    };

    constructor(props){
        super(props);
    }

    private static renderDefaultExpander(column: GridExpandContentColumn, model: any) : string | JSX.Element | JSX.Element[]{
        return <GridExpandCollapseIcon isExpanded={false} eventsStore={column.props.eventsStore} model={model}  />
    }
}

interface GridExpandCollapseIconProps {
    isExpanded: boolean;
    eventsStore: EventsStore;
    model: any;

}

class GridExpandCollapseIcon extends React.Component<GridExpandCollapseIconProps, { isExpanded: boolean}> {

    constructor(props) {
        super(props)
        this.state = {isExpanded: this.props.isExpanded}
    }

    public render() {
        return <a href="#" onClick={() => {
                this.setState({isExpanded: !this.state.isExpanded}, () =>{
                    this.props.eventsStore.onExpandOrCollapseContent.trigger(this, this.props.model)
                });
            }}>
            {this.state.isExpanded ? "-" : "+"}
        </a>;
        
    }
}