"use client"
import "regenerator-runtime/runtime" // Importar el polyfill
import React, { useEffect, useState, useMemo } from "react"
import { trpc } from "@repo/trpc-client"
import { Protect } from "@clerk/nextjs"
import { useTable, useSortBy, Column } from "react-table"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@ui/components/table"

interface Download {
  user_id: string | null;
  organization: string;
  location_name: string;
  zone_name: string;
  parameters_names: string[];
  download_date: Date;
  time_period: string;
}

export default function DownloadTable() {
  const { data: downloadRecord, isLoading, isError } = trpc.downloadRecord.get.useQuery({ organization: undefined })
  const [downloads, setDownloads] = useState<Download[]>([])

  const { data: zonesInfo } = trpc.zone.get.useQuery()
  const zonesIdAndName = useMemo(() => {
    const mappedZoneData = zonesInfo ? zonesInfo.map(({ id, name }) => ({ id, name })) : []
    return mappedZoneData.map(zone => ({ zone_id: zone.id, zone_name: zone.name }))
  }, [zonesInfo])

  // Function to get zone_name based on zone_id
  const getZoneName = (zone_id: string) => {
    const zone = zonesIdAndName.find(z => z.zone_id === zone_id)
    return zone ? zone.zone_name : zone_id
  }

  useEffect(() => {
    if (downloadRecord) {
      const transformedDownloads = downloadRecord.map((record) => {
        const startDate = new Date(record.start_date)
        const endDate = new Date(record.end_date)
        const timePeriod = `${startDate.toLocaleString()} - ${endDate.toLocaleString()}`
        const zoneNames = record.zones_id.map(getZoneName).join(", ")

        return {
          user_id: record.user_mail,
          organization: record.organization,
          location_name: record.location_name,
          zone_name: zoneNames,
          parameters_names: record.params_id,
          time_period: timePeriod,
          download_date: new Date(record.download_date),
        }
      }).sort((a, b) => b.download_date.getTime() - a.download_date.getTime())
      setDownloads(transformedDownloads)
    }
  }, [downloadRecord, zonesIdAndName])

  const data = useMemo(() => downloads, [downloads])

  const columns: Column<Download>[] = useMemo(() => [
    { Header: "Usuario", accessor: "user_id" },
    { Header: "Organización", accessor: "organization" },
    { Header: "Ubicación", accessor: "location_name" },
    { Header: "Zona", accessor: "zone_name" },
    { Header: "Parámetros", accessor: "parameters_names", Cell: ({ cell: { value } }) => value.join(", ") },
    { Header: "Periodo de tiempo descargado", accessor: "time_period" },
    { Header: "Fecha de descarga", accessor: "download_date", Cell: ({ cell: { value } }) => new Date(value).toLocaleDateString() }
  ], [])

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow
  } = useTable<Download>({ columns, data }, useSortBy)

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (isError) {
    return <div>Error al cargar el registro de descargas.</div>
  }

  return (
    <Protect role="org:admin">
      <h1 className="text-lg font-bold mt-5">Registro de Descargas de Usuarios</h1>
      <div className="max-h-96 overflow-auto">
        <Table {...getTableProps()}>
          <TableHeader>
            {headerGroups.map(headerGroup => (
              <TableRow {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map(column => (
                  <TableHead {...column.getHeaderProps((column as any).getSortByToggleProps())}>
                    {column.render("Header")}
                    <span>
                      {(column as any).isSorted ? ((column as any).isSortedDesc ? " 🔽" : " 🔼") : ""}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row)
              return (
                <TableRow {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <TableCell {...cell.getCellProps()}>
                      {cell.render("Cell")}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
      <div className="bg-white py-2">
        <div className="text-sm text-gray-700 font-bold align-center">Total de descargas: {downloads.length}</div>
      </div>
    </Protect>
  )
}
