import React, { useMemo } from "react"
import { useTable, useSortBy, usePagination, Column, TableInstance, TableState } from "react-table"
import DownloadBuoysDataCSV from "../export-data"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { RawChartDataCollection } from "@/types/chart-data-types"
import transformDataToArray from "@/hooks/transform-data-to-arrays"
import { Popover, PopoverContent, PopoverTrigger } from "@ui/components/popover"
import { Button } from "@ui/components/button"
import { FiInfo } from "react-icons/fi"

interface TableProps {
  rawData: RawChartDataCollection;
  location_name: string;
  selected_zones: string[];
  parameter_ids: string[];
  zonesIdAndName: { zone_id: string | undefined, zone_name: string | undefined }[];
}

interface DataInArray {
  zona_id: string;
  zona: string;
  fecha: string;
  [key: string]: number | string;
}

const DataTable: React.FC<TableProps> = ({ rawData, location_name, selected_zones, parameter_ids, zonesIdAndName }) => {
  
  // Function to get zone_name based on zone_id
  const getZoneName = (zone_id: string) => {
    const zone = zonesIdAndName?.find(z => z.zone_id === zone_id)
    return zone ? zone.zone_name : zone_id
  }
  
  // Function to reduce data size (measurements)
  const sampleData = (dataArray: DataInArray[], step: number) => {
    return dataArray.filter((_, index) => index % step === 0)
  }

  // Transform rawData to a correct format for the table
  const tableData: DataInArray[] = useMemo(() => {
    const dataArray = transformDataToArray(rawData)
    return dataArray.map(row => ({
      zona: getZoneName(row.zona_id),
      ...row
    }))
  }, [rawData, zonesIdAndName])

  // Reduce data size
  const sampledTableData: DataInArray[] = useMemo(() => {
    const step = Math.ceil(tableData.length / 100) // Adjust 100 to control the number of rows
    return sampleData(tableData, step)
  }, [tableData])

  const columns: Column<any>[] = useMemo(
    () =>
      sampledTableData.length > 0
        ? Object.keys(sampledTableData[0] ?? {}).map((key) => ({
          Header: key,
          accessor: key as string,
          sortDescFirst: true,
        }))
        : [],
    [sampledTableData]
  )

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable<any>(
    {
      columns,
      data: sampledTableData,
      initialState: { pageIndex: 0, pageSize: 10 } as Partial<TableState<any>>, // Initial page size
    },
    useSortBy,
    usePagination
  ) as TableInstance<any> & {
    page: any[];
    canPreviousPage: boolean;
    canNextPage: boolean;
    pageOptions: number[];
    pageCount: number;
    gotoPage: (updater: number | ((pageIndex: number) => number)) => void;
    nextPage: () => void;
    previousPage: () => void;
    setPageSize: (pageSize: number) => void;
    state: { pageIndex: number; pageSize: number };
  }

  return (
    <div className="relative w-full mb-8 border border-gray-300 rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center bg-blue text-white p-4">
        <h3 className="text-center text-l font-bold">Tabla de Datos</h3>
        <div className="flex items-center space-x-2">
          <SignedIn>
            {rawData && (
              <DownloadBuoysDataCSV
                rawData={sampledTableData}
                location_name={location_name}
                selected_zones={selected_zones}
                parameter_ids={parameter_ids}
              />
            )}
          </SignedIn>
          <SignedOut>
            <Button disabled className="bg-white text-black">Descargar tabla</Button>
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-xl ml-2">
                  <FiInfo />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4 p-4">
                  <div className="text-sm text-justify">
                    <ul className="list-disc list-inside">
                      <li>Para descargar los datos, por favor inicie sesión.</li>
                    </ul>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </SignedOut>
        </div>
      </div>
      <div className="bg-white h-96 overflow-auto">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map((column: any) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider"
                    key={column.id}
                  >
                    {column.render("Header")}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
            {page.map((row, i) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"} key={row.id}>
                  {row.cells.map((cell: any) => (
                    <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" key={cell.column.id}>
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {"<<"}
          </button>
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {"<"}
          </button>
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            {">"}
          </button>
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
            {">>"}
          </button>
        </div>
        <span>
          Página{" "}
          <strong>
            {pageIndex + 1} de {pageOptions.length}
          </strong>
        </span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Mostrar {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default DataTable
