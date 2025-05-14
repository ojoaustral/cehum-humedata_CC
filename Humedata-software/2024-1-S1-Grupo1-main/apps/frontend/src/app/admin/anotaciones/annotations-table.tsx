import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { trpc } from "@repo/trpc-client"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogOverlay, 
  DialogClose 
} from "@ui/components/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/components/table"
import { ChevronDownIcon, DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Button } from "@ui/components/button"
import { Input } from "@ui/components/input"
import EditNoteForm from "./edit-note-form"

interface AnnotationGet {
  id: string;
  zoneId: string;
  params_id: string[];
  start_date: Date | null;
  end_date: Date | null;
  content: string | null;
  tag: string | null;
  type: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface AnnotationUpdate {
  id: string;
  params_id?: string[];
  content?: string;
  start_date?: Date;
  end_date?: Date;
  type?: "public" | "private";
  tag?: string;
}

interface AnnotationsTableProps {
  annotations: AnnotationGet[];
  refetch: () => void;
}

const AnnotationAdminTable: React.FC<AnnotationsTableProps> = ({ annotations, refetch }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [editingNote, setEditingNote] = useState<AnnotationGet | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { data: zonesInfo } = trpc.zone.get.useQuery()
  
  const mappedZoneData = zonesInfo ? zonesInfo.map(({ id, name }) => ({ id, name })) : []
  const zonesIdAndName = mappedZoneData?.map(zone => ({ zone_id: zone.id, zone_name: zone.name }))

  // Function to get zone_name based on zone_id
  const getZoneName = (zone_id: string) => {
    const zone = zonesIdAndName?.find(z => z.zone_id === zone_id)
    return zone ? zone.zone_name : zone_id
  }

  const updateNoteMutation = trpc.note.updateNote.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: () => {
      setErrorMsg("Error al editar anotación")
    }
  })

  const deleteNote = trpc.note.deleteNote.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: () => {
      setErrorMsg("Error al eliminar anotación")
    }
  })

  const handleNoteEdit = (note: AnnotationGet) => {
    setEditingNote(note)
    setIsEditModalOpen(true)
  }

  const handleNoteSave = async (noteUpdate: AnnotationUpdate) => {
    await updateNoteMutation.mutateAsync(noteUpdate)
    setIsEditModalOpen(false)
    setEditingNote(null)
  }

  const handleNoteDelete = async (noteId: string) => {
    await deleteNote.mutateAsync({ id: noteId })
  }

  // Show error message for 3 seconds (3000 ms)
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null)
      }, 3000) 
      return () => clearTimeout(timer)
    }
  }, [errorMsg])

  const columns: ColumnDef<AnnotationGet>[] = [
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const annotation = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleNoteEdit(annotation)}>Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleNoteDelete(annotation.id)}>Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => row.getValue("id"),
    },
    {
      accessorKey: "zoneName",
      header: "Nombre zona",
      cell: ({ row }) => getZoneName(row.getValue("zoneId")),
      enableSorting: true,
    },
    {
      accessorKey: "zoneId",
      header: "Zona ID",
      cell: ({ row }) => row.getValue("zoneId"),
    },
    {
      accessorKey: "content",
      header: "Contenido",
      cell: ({ row }) => row.getValue("content"),
    },
    {
      accessorKey: "tag",
      header: "Etiqueta",
      cell: ({ row }) => row.getValue("tag"),
      enableSorting: true,
    },
    {
      accessorKey: "start_date",
      header: "Fecha inicio",
      cell: ({ row }) => row.getValue("start_date") ? format(new Date(row.getValue("start_date")), "dd/MM/yyyy HH:mm") : "",
      enableSorting: true,
    },
    {
      accessorKey: "end_date",
      header: "Fecha término",
      cell: ({ row }) => row.getValue("end_date") ? format(new Date(row.getValue("end_date")), "dd/MM/yyyy HH:mm") : "",
      enableSorting: true,
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => {
        const type = row.getValue("type")
        return type === "public" ? "Pública" : "Privada"
      },
    },
    {
      accessorKey: "params_id",
      header: "Parámetros",
      cell: ({ row }) => {
        const params = row.getValue("params_id") as string[]
        return params.join(", ")
      },
    },
    {
      accessorKey: "createdAt",
      header: "Fecha creación",
      cell: ({ row }) => format(new Date(row.getValue("createdAt")), "dd/MM/yyyy"),
      enableSorting: true,
    },
    {
      accessorKey: "updatedAt",
      header: "Última actualización",
      cell: ({ row }) => format(new Date(row.getValue("updatedAt")), "dd/MM/yyyy"),
      enableSorting: true,
    },
  ]

  const table = useReactTable({
    data: annotations || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
  })

  return (
    <div className="w-full pr-1 pl-1">
      {errorMsg && <div className="text-red-600 text-sm xs:text-xs mt-2">{errorMsg}</div>}
      <div className="flex justify-between items-center py-4">
        <Input
          id="searchNoteTag"
          placeholder="Buscar por etiqueta"
          value={(table.getColumn("tag")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("tag")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-4 bg-primary hover:bg-primary/60 hover:text-white text-white">
              Columnas <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                const header = column.columnDef.header
                const headerName = typeof header === "string" ? header : column.id
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {headerName}
                  </DropdownMenuCheckboxItem>
                )
              })
            }
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="p-2" onClick={header.column.getToggleSortingHandler()}>
                      {header.isPlaceholder ? null : (
                        <>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " 🔼",
                            desc: " 🔽",
                          }[header.column.getIsSorted() as string] ?? null}
                        </>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
        <span className="text-xs">
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
        </span>
        <select
          id="pageSizeZoneSelect"
          className="text-xs"
          value={pagination.pageSize}
          onChange={e => {
            setPagination(prev => ({
              ...prev,
              pageSize: Number(e.target.value),
              pageIndex: 0 // Reset to first page
            }))
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Mostrar {pageSize}
            </option>
          ))}
        </select>
      </div>

      {/* Popup para editar anotación */}
      {editingNote && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar zona</DialogTitle>
              <DialogClose onClick={() => setIsEditModalOpen(false)} />
            </DialogHeader>
            <EditNoteForm note={editingNote} onSave={handleNoteSave} onCancel={() => setIsEditModalOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default AnnotationAdminTable