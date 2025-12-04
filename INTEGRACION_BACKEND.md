# Integración Frontend-Backend

Este documento describe cómo el frontend Next.js se integra con el backend Flask.

## Configuración

### Variables de Entorno

El frontend está configurado para conectarse al backend a través de la variable de entorno `NEXT_PUBLIC_API_URL`:

```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

Esta configuración se encuentra en los archivos:
- `.env`
- `.env.local`

### Puerto del Backend

El backend Flask debe estar corriendo en `http://localhost:5000` para que el frontend pueda consumir los endpoints.

## Estructura de la API

El archivo `lib/api.ts` contiene todos los métodos para consumir el backend. Los endpoints están organizados en las siguientes categorías:

### 1. Products API (`productsApi`)

#### Endpoints Disponibles:
- **GET /products** - Obtener todos los productos con filtros opcionales
  - Query params: `category_id`, `min_price`, `max_price`, `search`, `available_only`
  - Respuesta backend: `{products: [], count: number, status: string}`
  - Frontend recibe: `{products: [], total: number, page: number, pages: number}`

- **GET /products/:id** - Obtener un producto específico
  - Respuesta backend: `{product: {...}, status: string}`
  - Frontend recibe: `product` (objeto directo)

- **POST /products** - Crear un nuevo producto
  - Body: JSON con datos del producto
  - Respuesta backend: `{product: {...}, message: string, status: string}`
  - Frontend recibe: `product` (objeto directo)

### 2. Categories API (`categoriesApi`)

#### Endpoints Disponibles:
- **GET /categories** - Obtener todas las categorías
  - Respuesta backend: `{categories: [], count: number, status: string}`
  - Frontend recibe: `categories[]` (array directo)

- **GET /categories/tree** - Obtener árbol jerárquico de categorías
  - Respuesta backend: `{category_tree: [], status: string}`
  - Frontend recibe: `category_tree[]` (array directo)

- **POST /categories** - Crear nueva categoría
  - Body: `{name: string, parent_id?: number}`
  - Respuesta backend: `{category: {...}, message: string, status: string}`
  - Frontend recibe: `category` (objeto directo)

### 3. Orders API (`ordersApi`)

#### Endpoints Disponibles:
- **GET /orders** - Obtener todas las órdenes con filtros
  - Query params: `user_id`, `status`
  - Respuesta backend: `{orders: [], count: number, status: string}`
  - Frontend recibe: `orders[]` (array directo)

- **GET /orders/:id** - Obtener una orden específica
  - Respuesta backend: `{order: {...}, status: string}`
  - Frontend recibe: `order` (objeto directo)

- **GET /orders/summary** - Obtener resumen estadístico de órdenes
  - Respuesta backend: `{summary: {...}, status: string}`
  - Frontend recibe: `summary` (objeto directo)

- **POST /orders** - Crear nueva orden
  - Body: `{user_id: number, items: [{product_id: number, quantity: number}]}`
  - Respuesta backend: `{order: {...}, message: string, status: string}`
  - Frontend recibe: `order` (objeto directo)

- **PUT /orders/:id/status** - Actualizar estado de orden
  - Body: `{status: string}`
  - Respuesta backend: `{order: {...}, message: string, status: string}`
  - Frontend recibe: `order` (objeto directo)

### 4. Images API (`imagesApi`)

#### Endpoints Disponibles:
- **GET /images/:id** - Obtener imagen binaria
  - Retorna la imagen directamente (binary data)

- **GET /images/product/:productId** - Obtener metadatos de imágenes de un producto
  - Respuesta backend: `{images: [{idImagen, idProducto, originalUrl}], count: number, status: string}`
  - Frontend recibe: `images[]` (array directo)

- **POST /images** - Subir imagen
  - Body: FormData con `file`, `idProducto`, `idImagen` (opcional), `originalUrl` (opcional)
  - Respuesta backend: `{image: {...}, status: string}`
  - Frontend recibe: `image` (objeto directo)

### 5. Users API (`usersApi`)

#### Endpoints Disponibles:
- **GET /users** - Obtener todos los usuarios
  - Respuesta backend: `{users: [], count: number, status: string}`
  - Frontend recibe: `users[]` (array directo)

- **GET /users/:id** - Obtener un usuario específico
  - Respuesta backend: `{user: {...}, status: string}`
  - Frontend recibe: `user` (objeto directo)

- **POST /users** - Crear nuevo usuario
  - Body: JSON con datos del usuario
  - Respuesta backend: `{user: {...}, message: string, status: string}`
  - Frontend recibe: `user` (objeto directo)

## Manejo de Respuestas

El frontend ha sido configurado para:

1. **Desempaquetar respuestas automáticamente**: Todas las respuestas del backend que vienen en formato `{data: {...}, status: string}` son desempaquetadas para que los componentes reciban directamente los datos.

2. **Simular paginación**: Como el backend no implementa paginación, el frontend simula esta funcionalidad en `productsApi.getAll()` usando los parámetros `page` y `limit`.

3. **Manejo de errores**: Todos los endpoints manejan errores y muestran datos mock en caso de fallo para facilitar el desarrollo.

## Hooks Personalizados

El frontend utiliza SWR para el manejo de estado y caché de datos:

### `hooks/use-products.ts`
- `useProducts(params)` - Obtiene lista de productos
- `useProduct(id)` - Obtiene un producto específico
- `useCategories()` - Obtiene todas las categorías
- `useCategoryTree()` - Obtiene árbol de categorías

### `hooks/use-orders.ts`
- `useOrders(params)` - Obtiene lista de órdenes
- `useOrder(id)` - Obtiene una orden específica
- `useOrdersSummary()` - Obtiene resumen de órdenes

## Iniciar el Proyecto

### Backend (Flask)
```bash
cd C:\Users\bairo\OneDrive\Documentos\2025-2\Bases de datos NoSQL\proyecto\NoSQL_PrimeraEntrega
python run.py
# El backend debe correr en http://localhost:5000
```

### Frontend (Next.js)
```bash
cd C:\Users\bairo\OneDrive\Documentos\2025-2\Bases de datos NoSQL\proyecto\FrontEndMarketPlace
npm run dev
# El frontend correrá en http://localhost:3000
```

## Notas Importantes

1. **CORS**: Asegúrate de que el backend tenga CORS configurado para permitir peticiones desde `http://localhost:3000`

2. **Formato de Datos**: Todos los IDs en las URLs deben ser numéricos excepto para usuarios que usan strings.

3. **Imágenes**: Las imágenes se sirven directamente desde `/images/:id` como binarios, mientras que los metadatos se obtienen desde `/images/product/:productId`

4. **Autenticación**: El sistema incluye funciones para manejar tokens JWT en localStorage (`setAuthToken`, `getAuthToken`), pero la autenticación completa aún está en desarrollo.

## Testing de la Integración

Para verificar que la integración funciona correctamente:

1. Asegúrate de que el backend esté corriendo
2. Inicia el frontend
3. Navega a `/products` para ver el catálogo
4. Verifica que las categorías se cargan en el sidebar
5. Prueba filtrar productos por categoría
6. Abre un producto específico para ver los detalles

Si aparecen datos mock (placeholders), significa que el frontend no puede conectarse al backend. Verifica la URL en `.env.local` y que el backend esté corriendo.

