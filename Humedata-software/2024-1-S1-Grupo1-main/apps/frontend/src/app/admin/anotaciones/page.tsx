"use client"
import { Protect } from "@clerk/nextjs"
import AnnotationForm from "./annotation.form"
import { trpc } from "@repo/trpc-client"
import AnnotationAdminTable from "./annotations-table"
import LoadingSkeleton from "@/components/skeletons/loading-skeleton"

const Anotaciones = () => {
  const { data: annotations, isLoading: annotationsLoading, isError: isErrorAnnotations, refetch } = trpc.note.get.useQuery({})

  const handleNewAnnotation = () => {
    refetch()
  }

  return (
    <Protect role="org:admin">
      <div className=" w-7/12 p-2">
        <AnnotationForm refetchTable={handleNewAnnotation} ></AnnotationForm>
      </div>
      <h1 className="text-lg font-bold mt-5">Anotaciones existentes</h1>
      {isErrorAnnotations && <div className="text-black text-sm xs:text-xs mb-2">Error al cargar las anotaciones</div>}
      <div className="w-full rounded-lg shadow-lg overflow-hidden">
        {annotationsLoading ? (
          <LoadingSkeleton text="anotaciones" />
        ) : (
          <AnnotationAdminTable annotations={annotations || []} refetch={refetch} />
        )}
      </div>
    </Protect>
  )
}

export default Anotaciones