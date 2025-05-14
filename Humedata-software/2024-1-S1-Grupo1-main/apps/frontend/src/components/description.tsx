import Image from "next/image"

const Description = () => {

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:p-6 xl:p-8 my-6 flex justify-between" >
      <p className="w-4/12 text-justify dark:text-white">
        Has entrado al visualizador web de <b>Humedat@s, plataforma en tiempo real para el monitoreo de calidad de aguas</b> de humedales de Chile.
      </p>
      <Image
        src={"/assets/humedat@s.jpg"}
        alt="Imagen de una Boya"
        width={500}
        height={500}
      />
    </div>
  )
}

export default Description