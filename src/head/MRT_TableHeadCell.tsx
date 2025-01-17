import React, { DragEvent, FC, ReactNode } from 'react';
import { Box, TableCell, Theme, alpha, lighten, useTheme } from '@mui/material';
import { MRT_TableHeadCellColumnActionsButton } from './MRT_TableHeadCellColumnActionsButton';
import { MRT_TableHeadCellFilterContainer } from './MRT_TableHeadCellFilterContainer';
import { MRT_TableHeadCellFilterLabel } from './MRT_TableHeadCellFilterLabel';
import { MRT_TableHeadCellGrabHandle } from './MRT_TableHeadCellGrabHandle';
import { MRT_TableHeadCellResizeHandle } from './MRT_TableHeadCellResizeHandle';
import { MRT_TableHeadCellSortLabel } from './MRT_TableHeadCellSortLabel';
import type { MRT_Header, MRT_TableInstance } from '..';

interface Props {
  header: MRT_Header;
  table: MRT_TableInstance;
}

export const MRT_TableHeadCell: FC<Props> = ({ header, table }) => {
  const theme = useTheme();
  const {
    getState,
    options: {
      enableColumnActions,
      enableColumnDragging,
      enableColumnOrdering,
      enableColumnResizing,
      enableGrouping,
      enableMultiSort,
      muiTableHeadCellProps,
    },
    setCurrentHoveredColumn,
  } = table;
  const { density, currentDraggingColumn, currentHoveredColumn } = getState();
  const { column } = header;
  const { columnDef } = column;
  const { columnDefType } = columnDef;

  const mTableHeadCellProps =
    muiTableHeadCellProps instanceof Function
      ? muiTableHeadCellProps({ column, table })
      : muiTableHeadCellProps;

  const mcTableHeadCellProps =
    columnDef.muiTableHeadCellProps instanceof Function
      ? columnDef.muiTableHeadCellProps({ column, table })
      : columnDef.muiTableHeadCellProps;

  const tableCellProps = {
    ...mTableHeadCellProps,
    ...mcTableHeadCellProps,
  };

  const headerElement = ((columnDef?.Header instanceof Function
    ? columnDef?.Header?.({
        header,
        table,
      })
    : columnDef?.Header) ?? columnDef.header) as ReactNode;

  const getIsLastLeftPinnedColumn = () => {
    return (
      column.getIsPinned() === 'left' &&
      table.getLeftLeafHeaders().length - 1 === column.getPinnedIndex()
    );
  };

  const getIsFirstRightPinnedColumn = () => {
    return column.getIsPinned() === 'right' && column.getPinnedIndex() === 0;
  };

  const getTotalRight = () => {
    return (
      (table.getRightLeafHeaders().length - 1 - column.getPinnedIndex()) * 150
    );
  };

  const handleDragEnter = (_e: DragEvent) => {
    if (enableColumnOrdering && currentDraggingColumn) {
      setCurrentHoveredColumn(columnDefType === 'data' ? column : null);
    }
  };

  const tableHeadCellRef = React.useRef<HTMLTableCellElement>(null);

  const draggingBorder =
    currentDraggingColumn?.id === column.id
      ? `1px dashed ${theme.palette.divider}`
      : currentHoveredColumn?.id === column.id
      ? `2px dashed ${theme.palette.primary.main}`
      : undefined;

  const draggingBorders = draggingBorder
    ? {
        borderLeft: draggingBorder,
        borderRight: draggingBorder,
        borderTop: draggingBorder,
      }
    : undefined;

  return (
    <TableCell
      align={columnDefType === 'group' ? 'center' : 'left'}
      colSpan={header.colSpan}
      onDragEnter={handleDragEnter}
      ref={tableHeadCellRef}
      {...tableCellProps}
      sx={(theme: Theme) => ({
        backgroundColor:
          column.getIsPinned() && columnDefType !== 'group'
            ? alpha(lighten(theme.palette.background.default, 0.04), 0.95)
            : 'inherit',
        backgroundImage: 'inherit',
        boxShadow: getIsLastLeftPinnedColumn()
          ? `4px 0 4px -2px ${alpha(theme.palette.common.black, 0.1)}`
          : getIsFirstRightPinnedColumn()
          ? `-4px 0 4px -2px ${alpha(theme.palette.common.black, 0.1)}`
          : undefined,
        fontWeight: 'bold',
        left:
          column.getIsPinned() === 'left'
            ? `${column.getStart('left')}px`
            : undefined,
        overflow: 'visible',
        opacity:
          currentDraggingColumn?.id === column.id ||
          currentHoveredColumn?.id === column.id
            ? 0.5
            : 1,
        p:
          density === 'compact'
            ? columnDefType === 'display'
              ? '0 0.5rem'
              : '0.5rem'
            : density === 'comfortable'
            ? columnDefType === 'display'
              ? '0.5rem 0.75rem'
              : '1rem'
            : columnDefType === 'display'
            ? '1rem 1.25rem'
            : '1.5rem',
        pb: columnDefType === 'display' ? 0 : undefined,
        position:
          column.getIsPinned() && columnDefType !== 'group'
            ? 'sticky'
            : undefined,
        pt:
          columnDefType === 'group'
            ? 0
            : density === 'compact'
            ? '0.25'
            : density === 'comfortable'
            ? '.75rem'
            : '1.25rem',
        right:
          column.getIsPinned() === 'right' ? `${getTotalRight()}px` : undefined,
        transition: `all ${enableColumnResizing ? 0 : '0.2s'} ease-in-out`,
        userSelect: enableMultiSort && column.getCanSort() ? 'none' : undefined,
        verticalAlign: 'text-top',
        zIndex:
          column.getIsResizing() || currentDraggingColumn?.id === column.id
            ? 3
            : column.getIsPinned() && columnDefType !== 'group'
            ? 2
            : 1,
        ...(tableCellProps?.sx as any),
        ...draggingBorders,
        maxWidth: `min(${column.getSize()}px, fit-content)`,
        minWidth: `max(${column.getSize()}px, ${columnDef.minSize ?? 30}px)`,
        width: header.getSize(),
      })}
    >
      {header.isPlaceholder ? null : columnDefType === 'display' ? (
        headerElement
      ) : (
        <Box
          sx={{
            alignItems: 'flex-start',
            display: 'flex',
            justifyContent:
              columnDefType === 'group' ? 'center' : 'space-between',
            position: 'relative',
            width: '100%',
          }}
        >
          <Box
            onClick={column.getToggleSortingHandler()}
            sx={{
              alignItems: 'center',
              cursor:
                column.getCanSort() && columnDefType !== 'group'
                  ? 'pointer'
                  : undefined,
              display: 'flex',
              flexWrap: 'nowrap',
              whiteSpace:
                (columnDef.header?.length ?? 0) < 24 ? 'nowrap' : 'normal',
            }}
          >
            {headerElement}
            {columnDefType === 'data' && column.getCanSort() && (
              <MRT_TableHeadCellSortLabel header={header} table={table} />
            )}
            {columnDefType === 'data' && column.getCanFilter() && (
              <MRT_TableHeadCellFilterLabel header={header} table={table} />
            )}
          </Box>
          <Box sx={{ whiteSpace: 'nowrap' }}>
            {columnDefType === 'data' &&
              ((enableColumnDragging &&
                columnDef.enableColumnDragging !== false) ||
                (enableColumnOrdering &&
                  columnDef.enableColumnOrdering !== false) ||
                (enableGrouping && columnDef.enableGrouping !== false)) && (
                <MRT_TableHeadCellGrabHandle
                  column={column}
                  table={table}
                  tableHeadCellRef={tableHeadCellRef}
                />
              )}
            {(enableColumnActions || columnDef.enableColumnActions) &&
              columnDef.enableColumnActions !== false &&
              columnDefType !== 'group' && (
                <MRT_TableHeadCellColumnActionsButton
                  header={header}
                  table={table}
                />
              )}
          </Box>
          {column.getCanResize() && (
            <MRT_TableHeadCellResizeHandle header={header} table={table} />
          )}
        </Box>
      )}
      {columnDefType === 'data' && column.getCanFilter() && (
        <MRT_TableHeadCellFilterContainer header={header} table={table} />
      )}
    </TableCell>
  );
};
