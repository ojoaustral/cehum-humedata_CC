import React, { useState, useEffect } from "react"
import { trpc } from "@repo/trpc-client"
import AddClusterForm from "./add-cluster-form"
import EditClusterForm from "./edit-cluster-form"
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

interface ClusterGet {
  id: string; // Cluster ID
  name: string; // Cluster name
  organizationId: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ClusterPost {
  name: string; // Cluster name
  organization: string; // Organization ID
  latitude: number;
  longitude: number;
}

interface ClusterUpdate {
  id: string;
  data: {
    name?: string; // Cluster name
    latitude?: number;
    longitude?: number;
  }
}

interface ClusterTableProps {
  onZoneRefetch: () => void; // Callback for refetching zones
  orgId: string | null | undefined;
}

const ClustersTable: React.FC<ClusterTableProps> = ({ onZoneRefetch, orgId }) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [editingCluster, setEditingCluster] = useState<ClusterGet | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [errorFetching, setErrorFetching] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { data: clusters, isLoading, isError, refetch } = trpc.location.get.useQuery() // Clusters are called locations in backend
  
  const createClusterMutation = trpc.location.createLocation.useMutation({
    onSuccess: () => {
      refetch() // Refetch clusters after successful creation
    },
    onError: () => {
      setErrorMsg("Error al crear cluster")
    }
  })

  const updateClusterMutation = trpc.location.updateLocation.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: () => {
      setErrorMsg("Error al editar cluster")
    }
  })

  const deleteCluster = trpc.location.deleteLocation.useMutation({
    onSuccess: () => {
      refetch()
      onZoneRefetch() // Refetch zones after deleting a cluster
    },
    onError: () => {
      setErrorMsg("Error al eliminar cluster")
    }
  })

  const handleAddCluster = async (cluster: ClusterPost) => {
    await createClusterMutation.mutateAsync(cluster)
    setIsModalOpen(false)
  }

  const handleClusterEdit = (cluster: ClusterGet) => {
    setEditingCluster(cluster)
    setIsEditModalOpen(true)
  }

  const handleClusterSave = async (clusterUpdate: ClusterUpdate) => {
    await updateClusterMutation.mutateAsync(clusterUpdate)
    setIsEditModalOpen(false)
    setEditingCluster(null)
  }

  const handleClusterDelete = async (clusterId: string) => {
    await deleteCluster.mutateAsync({ id: clusterId })
  }

  useEffect(() => {
    if (isError) {
      setErrorFetching("Error al obtener los clusters")
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

  const columns: ColumnDef<ClusterGet>[] = [
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const cluster = row.original
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
              <DropdownMenuItem onClick={() => handleClusterEdit(cluster)}>Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleClusterDelete(cluster.id)}>Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    },
    {
      accessorKey: "name",
      header: "Nombre cluster",
      cell: ({ row }) => row.getValue("name")
    },
    {
      accessorKey: "id",
      header: "Cluster ID",
      cell: ({ row }) => row.getValue("id")
    },
    {
      accessorKey: "latitude",
      header: "Latitud",
      cell: ({ row }) => row.getValue("latitude")
    },
    {
      accessorKey: "longitude",
      header: "Longitud",
      cell: ({ row }) => row.getValue("longitude")
    },
    {
      accessorKey: "organizationId",
      header: "Organización ID",
      cell: ({ row }) => row.getValue("organizationId")
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
    data: clusters || [],
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
          id="searchClusterName"
          placeholder="Buscar nombre cluster"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" className="ml-auto bg-primary hover:bg-primary/60 hover:text-white text-white" onClick={() => setIsModalOpen(true)}>
          Añadir cluster
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
        <LoadingSkeleton text="clusters" />
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
          id="pageSizeClusterSelect"
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

      {/* Popup para crear cluster */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Cluster</DialogTitle>
            <DialogClose onClick={() => setIsModalOpen(false)} />
          </DialogHeader>
          <AddClusterForm orgId={orgId} onSave={handleAddCluster} />
        </DialogContent>
      </Dialog>

      {/* Popup para editar cluster */}
      {editingCluster && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar cluster</DialogTitle>
              <DialogClose onClick={() => setIsEditModalOpen(false)} />
            </DialogHeader>
            <EditClusterForm cluster={editingCluster} onSave={handleClusterSave} onCancel={() => setIsEditModalOpen(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default ClustersTable