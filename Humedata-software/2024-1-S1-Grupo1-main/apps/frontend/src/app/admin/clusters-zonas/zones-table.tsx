import React, { useState, useEffect } from "react"
import { trpc } from "@repo/trpc-client"
import AddZoneForm from "./add-zone-form"
import EditZoneForm from "./edit-zone-form"
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
import Image from "next/image"
import { InfoCircledIcon } from "@radix-ui/react-icons"
import { Popover, PopoverTrigger, PopoverContent } from "@ui/components/popover"

interface ZoneGet {
  id: string; // Zone ID
  name: string; // Zone name
  locationId: string; // Cluster ID
  max_latitude: number | null;
  max_longitude: number | null;
  min_latitude: number | null;
  min_longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ZonePost {
  name: string; // Zone name
  locationId: string; // Cluster ID
  max_latitude: number;
  max_longitude: number;
  min_latitude: number;
  min_longitude: number;
}

interface ZoneUpdate {
  id: string;
  data: {
    name?: string;
    locationId?: string;
    max_latitude?: number;
    max_longitude?: number;
    min_latitude?: number;
    min_longitude?: number;
  }
}

const ZonesTable = () => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [editingZone, setEditingZone] = useState<ZoneGet | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [errorFetching, setErrorFetching] = useState<string | null>(null)
  const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { data: zones, isLoading, isError, refetch } = trpc.zone.get.useQuery()
  const { data: clusters } = trpc.location.get.useQuery()

  const createZoneMutation = trpc.zone.createZone.useMutation({
    onSuccess: () => {
      refetch() // Refetch zones after successful creation
    },
    onError: () => {
      setErrorMsg("Error al crear zona")
    }
  })

  const updateZoneMutation = trpc.zone.updateZone.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: () => {
      setErrorMsg("Error al editar zona")
    }
  })

  const deleteZone = trpc.zone.deleteZone.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: () => {
      setErrorMsg("Error al eliminar zona")
    }
  })

  const handleAddButtonClick = () => {
    if (clusters?.length === 0) {
      setIsErrorPopupOpen(true)
    } else {
      setIsModalOpen(true)
    }
  }

  const handleAddZone = async (zone: ZonePost) => {
    await createZoneMutation.mutateAsync(zone)
    setIsModalOpen(false)
  }

  const handleZoneEdit = (zone: ZoneGet) => {
    setEditingZone(zone)
    setIsEditModalOpen(true)
  }

  const handleZoneSave = async (zoneUpdate: ZoneUpdate) => {
    await updateZoneMutation.mutateAsync(zoneUpdate)
    setIsEditModalOpen(false)
    setEditingZone(null)
  }

  const handleZoneDelete = async (zoneId: string) => {
    await deleteZone.mutateAsync({ id: zoneId })
  }

  const getClusterNameById = (id: string): string => {
    const cluster = clusters?.find(cluster => cluster.id === id)
    return cluster ? cluster.name : "Desconocido"
  }

  useEffect(() => {
    if (isError) {
      setErrorFetching("Error al obtener las zonas")
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

  const columns: ColumnDef<ZoneGet>[] = [
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const zone = row.original
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
              <DropdownMenuItem onClick={() => handleZoneEdit(zone)}>Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleZoneDelete(zone.id)}>Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    },
    {
      accessorKey: "name",
      header: "Nombre zona",
      cell: ({ row }) => row.getValue("name")
    },
    {
      accessorKey: "id",
      header: "Zona ID",
      cell: ({ row }) => row.getValue("id")
    },
    {
      accessorKey: "locationName",
      header: "Nombre cluster",
      cell: ({ row }) => getClusterNameById(row.getValue("locationId"))
    },
    {
      accessorKey: "locationId",
      header: "Cluster ID",
      cell: ({ row }) => row.getValue("locationId")
    },
    {
      accessorKey: "max_latitude",
      header: "Latitud máxima",
      cell: ({ row }) => row.getValue("max_latitude")
    },
    {
      accessorKey: "min_latitude",
      header: "Latitud mínima",
      cell: ({ row }) => row.getValue("min_latitude")
    },
    {
      accessorKey: "max_longitude",
      header: "Longitud máxima",
      cell: ({ row }) => row.getValue("max_longitude")
    },
    {
      accessorKey: "min_longitude",
      header: "Longitud mínima",
      cell: ({ row }) => row.getValue("min_longitude")
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
    data: zones || [],
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
          id="searchZoneName"
          placeholder="Buscar nombre zona"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Popover>
          <PopoverTrigger asChild>
            <button className="ml-auto p-1 rounded-full hover:bg-gray-200">
              <InfoCircledIcon className="h-5 w-5 text-gray-600" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4">
            <div>
              <p className="text-sm mb-2">Por defecto, la imagen de una zona es:</p>
              <div className="w-full h-40 relative">
                <Image
                  src="/assets/humedat@s.jpg"
                  alt="Imagen de un humedat@"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div> 
          </PopoverContent>
        </Popover>
        <Button variant="outline" className="ml-2 bg-primary hover:bg-primary/60 hover:text-white text-white" onClick={handleAddButtonClick}>
          Añadir zona
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
        <LoadingSkeleton text="zonas" />
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

      {/* Popup para crear zona */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Zona</DialogTitle>
            <DialogClose onClick={() => setIsModalOpen(false)} />
          </DialogHeader>
          <AddZoneForm  onSave={handleAddZone} />
        </DialogContent>
      </Dialog>

      {/* Popup para editar zona */}
      {editingZone && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar zona</DialogTitle>
              <DialogClose onClick={() => setIsEditModalOpen(false)} />
            </DialogHeader>
            <EditZoneForm zone={editingZone} onSave={handleZoneSave} onCancel={() => setIsEditModalOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Popup mensaje de error */}
      <Dialog open={isErrorPopupOpen} onOpenChange={setIsErrorPopupOpen}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogClose onClick={() => setIsErrorPopupOpen(false)} />
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm">No hay clusters disponibles para crear una zona. Por favor, cree un cluster primero.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ZonesTable