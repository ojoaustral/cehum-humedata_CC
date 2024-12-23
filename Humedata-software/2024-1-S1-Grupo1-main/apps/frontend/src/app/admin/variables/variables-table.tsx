import React, { useState, useEffect } from "react"
import { trpc } from "@repo/trpc-client"
import AddNewVariableForm from "./add-variable-form"
import EditNewVariableForm from "./edit-variable-form"
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
import { Button } from "@ui/components/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu"
import { Input } from "@ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/components/table"
import {
  ChevronDownIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogOverlay, 
  DialogClose 
} from "@ui/components/dialog"
import LoadingSkeleton from "@/components/skeletons/loading-skeleton"
import { NewVariableGet, NewVariablePost, NewVariableUpdate } from "@/types/variable"
import { Cluster } from "@/types/location"


interface NewVariableTableProps {
  locations: Cluster | undefined,
  onNewVariableRefetch: () => void; // Callback for refetching zones
}

const NewVariablesTable: React.FC<NewVariableTableProps> = ({ locations, onNewVariableRefetch }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const [editingNewVariable, setEditingNewVariable] = useState<NewVariableGet | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [errorFetching, setErrorFetching] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { data: new_variables, isLoading, isError, refetch } = trpc.variable.get.useQuery()
  
  const createNewVariableMutation = trpc.variable.createVariable.useMutation({
    onSuccess: () => {
      refetch() // Refetch variables after successful creation
    },
    onError: () => {
      setErrorMsg("Error al crear variable")
    }
  })

  const updateNewVariableMutation = trpc.variable.updateVariable.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: () => {
      setErrorMsg("Error al editar variable")
    }
  })

  const deleteNewVariable = trpc.variable.deleteVariable.useMutation({
    onSuccess: () => {
      refetch()
      onNewVariableRefetch()
    },
    onError: () => {
      setErrorMsg("Error al eliminar variable")
    }
  })

  const handleAddNewVariable = async (new_variable: NewVariablePost) => {
    await createNewVariableMutation.mutateAsync(new_variable)
    setIsModalOpen(false)
  }

  const handleNewVariableEdit = (new_variable: NewVariableGet) => {
    setEditingNewVariable(new_variable)
    setIsEditModalOpen(true)
  }

  const handleNewVariableSave = async (new_variable_update: NewVariableUpdate) => {
    await updateNewVariableMutation.mutateAsync(new_variable_update)
    setIsEditModalOpen(false)
    setEditingNewVariable(null)
  }

  const handleNewVariableDelete = async (new_variable_id: string) => {
    await deleteNewVariable.mutateAsync({ variable_id: new_variable_id })
  }

  useEffect(() => {
    if (isError) {
      setErrorFetching("Error al obtener las nuevas variables")
    } 
    else if (!isError) {
      setErrorFetching(null)
    }
  }, [isError])

  // Show error message for 3 seconds (3000 ms)
  useEffect(() => {
    if (errorFetching) {
      const timer = setTimeout(() => {
        setErrorFetching(null)
      }, 3000) 
      return () => clearTimeout(timer)
    }
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null)
      }, 3000) 
      return () => clearTimeout(timer)
    }
  }, [errorFetching, errorMsg])

  const columns: ColumnDef<NewVariableGet>[] = [
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const variable = row.original
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
              <DropdownMenuItem onClick={() => handleNewVariableEdit(variable)}>Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleNewVariableDelete(variable.id)}>Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    },
    {
      accessorKey: "name",
      header: "Nombre variable",
      cell: ({ row }) => row.getValue("name")
    },

    {
      accessorKey: "locationId",
      header: "Cluster ID",
      cell: ({ row }) => row.getValue("locationId")
    },
    {
      accessorKey: "formula",
      header: "Fórmula",
      cell: ({ row }) => row.getValue("formula")
    },
    {
      accessorKey: "params",
      header: "Parámetros",
      cell: ({ row }) => new Array<string>(row.getValue("params")).join(" ")
    },
    {
      accessorKey: "createdAt",
      header: "Fecha creación",
      cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString()
    },
    {
      accessorKey: "updatedAt",
      header: "Última actualización",
      cell: ({ row }) => new Date(row.getValue("updatedAt")).toLocaleDateString()
    }
  ]

  const table = useReactTable({
    data: new_variables || [],
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
    <div className="w-full">
      {errorFetching && <div className="text-red-600 text-sm xs:text-xs mt-2">{errorFetching}</div>}
      {errorMsg && <div className="text-red-600 text-sm xs:text-xs mt-2">{errorMsg}</div>}
      <div className="flex items-center py-4">
        <Input
          id="searchNewVariableName"
          placeholder="Buscar nombre variable"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" className="ml-auto bg-primary hover:bg-primary/60 hover:text-white text-white" onClick={() => setIsModalOpen(true)}>
          Añadir nueva variable
        </Button>
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
      {isLoading ? (
        <LoadingSkeleton text="nuevas variables" />
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="p-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        }
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Sin resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
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
          id="pageSizeVariableSelect"
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

      {/* Popup para crear variable */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogOverlay />
        <DialogContent className="max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Añadir Variable</DialogTitle>
            <DialogClose onClick={() => setIsModalOpen(false)} />
          </DialogHeader>
          <AddNewVariableForm locations={locations} onSave={handleAddNewVariable} />
        </DialogContent>
      </Dialog>

      {/* Popup para editar variable */}
      {editingNewVariable && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogOverlay />
          <DialogContent className="max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar variable</DialogTitle>
              <DialogClose onClick={() => setIsEditModalOpen(false)} />
            </DialogHeader>
            <EditNewVariableForm
              locations={locations}
              newVariable={editingNewVariable}
              onSave={handleNewVariableSave}
              onCancel={() => setIsEditModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default NewVariablesTable