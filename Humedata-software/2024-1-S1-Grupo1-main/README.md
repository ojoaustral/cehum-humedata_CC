
# Monorepo proyecto Humedata

## Stack

### Frontend

- [React](https://reactjs.org/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)

### Backend

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [TRPC](https://trpc.io/)
- [Prisma](https://www.prisma.io/)

### Mobile

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [NativeWind](https://www.nativewind.dev/)

### autenticación

Para la autenticación se utiliza [Clerk](https://clerk.com/)

### Infraestructura

Se utiliza amazon web services para el despliegue de la aplicación.

- Iam Identity Center

## Configuración

### Manejador de paquetes

Este proyecto utiliza [pnpm](https://pnpm.io/)

### Instalación de dependencias

Para instalar las dependencias de todos los proyectos, ejecutar el siguiente comando en la raíz del proyecto:

```bash
pnpm install
```

### Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto con todas las variables de entorno necesarias para cada proyecto.

### Iniciar el proyecto

Para iniciar el backend, ejecutar el siguiente comando en la raíz del proyecto:

```bash
pnpm backend:dev
```

Para iniciar el frontend, ejecutar el siguiente comando en la raíz del proyecto:

```bash
pnpm frontend:dev
```

Para iniciar el mobile, ejecutar el siguiente comando en la raíz del proyecto:

```bash
pnpm mobile:dev
```
