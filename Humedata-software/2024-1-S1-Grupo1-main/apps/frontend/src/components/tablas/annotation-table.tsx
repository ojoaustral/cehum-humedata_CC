import React, { useMemo } from "react"
import { useTable, useSortBy, usePagination, Column, HeaderGroup, TableInstance, TableState } from "react-table"
import { trpc } from "@repo/trpc-client"
import LoadingSkeleton from "../skeletons/loading-skeleton"

interface AnnotationTableProps {
  selectedZones: string[];
  startDate: Date | undefined;
  endDate: Date | undefined;
  zonesIdAndName: { zone_id: string | undefined, zone_name: string | undefined }[];
}

interface Annotation {
  id: string;
  zone_name: string | undefined;
  zoneId: string;
  type: string;
  content: string | null;
  tag: string | null;
  start_date: Date | null;
  end_date: Date | null;
  params_id: string[];
}

const AnnotationTable: React.FC<AnnotationTableProps> = ({ selectedZones, startDate, endDate, zonesIdAndName }) => {
  const { data: annotations, isLoading: annotationsLoading, isError: annotationsError } = trpc.note.get.useQuery({ zones_ids: selectedZones, start_date: startDate, end_date: endDate })

  // Function to get zone_name based on zone_id
  const getZoneName = (zone_id: string) => {
    const zone = zonesIdAndName?.find(z => z.zone_id === zone_id)
    return zone ? zone.zone_name : zone_id
  }

  // Filter annotations by selectedZones
  const filteredAnnotations: Annotation[] = useMemo(() => {
    if (!annotations) return []
    return annotations
      .map(annotation => ({
        ...annotation,
        zone_name: getZoneName(annotation.zoneId)
      }))
  }, [annotations, selectedZones, zonesIdAndName])

  const columns: Column<Annotation>[] = useMemo(
    () => [
      {
        Header: "NOMBRE ZONA",
        accessor: "zone_name",
        sortDescFirst: true,
      },
      {
        Header: "ETIQUETA",
        accessor: "tag",
        sortDescFirst: true,
      },
      {
        Header: "CONTENIDO",
        accessor: "content",
        sortDescFirst: true,
      },
      {
        Header: "FECHA INICIO",
        accessor: "start_date",
        sortDescFirst: true,
        Cell: ({ value }) => value ? new Date(value).toLocaleString() : "", // Format date
        sortType: (rowA: any, rowB: any, columnId: any) => {
          const dateA = new Date(rowA.values[columnId])
          const dateB = new Date(rowB.values[columnId])
          return dateA.getTime() - dateB.getTime()
        },
      },
      {
        Header: "FECHA TÉRMINO",
        accessor: "end_date",
        sortDescFirst: true,
        Cell: ({ value }) => value ? new Date(value).toLocaleString() : "", // Format date
        sortType: (rowA: any, rowB: any, columnId: any) => {
          const dateA = new Date(rowA.values[columnId])
          const dateB = new Date(rowB.values[columnId])
          return dateA.getTime() - dateB.getTime()
        },
      },
      {
        Header: "PARÁMETROS CONSIDERADOS",
        accessor: "params_id",
        sortDescFirst: true,
        Cell: ({ value }) => value.join(", "), // Mostrar array como cadena
      },
      {
        Header: "TIPO",
        accessor: "type",
        sortDescFirst: true,
        Cell: ({ value }) => {
          const type = value
          return type === "public" ? "Pública" : "Privada"
        },
      },
    ],
    []
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
  } = useTable<Annotation>(
    {
      columns,
      data: filteredAnnotations,
      initialState: { pageIndex: 0, pageSize: 10 } as Partial<TableState<Annotation>>, // Initial page size
    },
    useSortBy,
    usePagination
  ) as TableInstance<Annotation> & {
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

  if (annotationsLoading) {
    return (
      <div className="w-full border border-gray-300 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue text-white p-4">
          <h3 className="text-l font-bold">Tabla de Anotaciones</h3>
        </div>
        <LoadingSkeleton text="anotaciones" />
      </div>
    )
  }

  if (annotationsError) {
    return (
      <div className="w-full border border-gray-300 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-blue text-white p-4">
          <h3 className="text-l font-bold">Tabla de Anotaciones</h3>
        </div>
        <div className="text-red-600 text-sm xs:text-xs">Error al cargar anotaciones.</div>
      </div>
    )
  }

  return (
    <div className="w-full border border-gray-300 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-blue text-white p-4">
        <h3 className="text-l font-bold">Tabla de Anotaciones</h3>
      </div>
      <div className="bg-white h-96 overflow-auto">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {headerGroups.map((headerGroup: HeaderGroup<Annotation>) => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps((column as any).getSortByToggleProps())}
                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider"
                    key={column.id}
                  >
                    {column.render("Header")}
                    <span>
                      {(column as any).isSorted ? ((column as any).isSortedDesc ? " 🔽" : " 🔼") : ""}
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

export default AnnotationTable
