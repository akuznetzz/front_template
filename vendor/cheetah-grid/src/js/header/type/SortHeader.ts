import {CellContext, CellRange, GridCanvasHelperAPI, ListGridAPI, SortColumnState, SortState} from "../../ts-types";
import {cellInRange, isDef} from "../../internal/utils";
import {BaseHeader} from "./BaseHeader";
import {DrawCellInfo} from "../../ts-types-internal";
import {SortHeaderStyle} from "../style/SortHeaderStyle";
import {getFontSize} from "../../internal/canvases";

export class SortHeader<T> extends BaseHeader<T> {
  get StyleClass(): typeof SortHeaderStyle {
    return SortHeaderStyle;
  }
  drawInternal(
    value: string,
    context: CellContext,
    style: SortHeaderStyle,
    helper: GridCanvasHelperAPI,
    grid: ListGridAPI<T>,
    { drawCellBase }: DrawCellInfo<T>
  ): void {
    function findSortColumnStateByRange(
      range: CellRange,
      state: SortState
    ): SortColumnState | undefined {
      for (const sortColumnState of state) {
        if (cellInRange(range, sortColumnState.col, sortColumnState.row)) {
          return sortColumnState;
        }
      }
      return undefined;
    }

    const {
      textAlign,
      textBaseline = "middle",
      color,
      bgColor,
      font,
      textOverflow,
      sortArrowColor
    } = style;

    if (bgColor) {
      drawCellBase({
        bgColor
      });
    }

    const state = grid.sortState as SortState;
    let order = undefined;
    const { col, row } = context;
    const range = grid.getCellRange(col, row);

    const sortColumnState = findSortColumnStateByRange(range, state);
    if (sortColumnState) {
      ({ order } = sortColumnState);
    }

    const ctx = context.getContext();
    const arrowSize = getFontSize(ctx, font).width * 1.2;

    helper.text(value, context, {
      textAlign,
      textBaseline,
      color,
      font,
      textOverflow,
      icons: [
        {
          name: isDef(order)
            ? order === "asc"
              ? "arrow_downward"
              : "arrow_upward"
            : undefined,
          width: arrowSize,
          color:
            helper.getColor(
              sortArrowColor || helper.theme.header.sortArrowColor,
              col,
              row,
              ctx
            ) || "rgba(0, 0, 0, 0.38)"
        }
      ]
    });
  }
}
