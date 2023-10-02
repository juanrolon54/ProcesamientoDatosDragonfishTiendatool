export type ArticulosResponse = {
    Resultados: Articulo[]
}

export type Articulo = {
    Descripcion: string
    CategoriaDeArticulo: String
    Clasificacion: String
    Familia: string
    Marca: string
    Codigo: string
}

export type StockYPrecioResponse = {
    Resultados: StockYPrecio[]
}

export type StockYPrecio = {
    Articulo: string,
    Stock: number,
    Precios: {
        Lista: "COSTO $" | "PUBLICO $" | "MAYOR $" | "PUBLICO U$S" | "COSTO U$S",
        Precio: number
    }[]
}

export type CategoriasResponse = {
    Resultados: Categorias[]
}

export type Categorias = {
    Descripcion: string
    Codigo: string
}
export type ClasificacionesResponse = {
    Resultados: Clasificacion[]
}

export type Clasificacion = {
    Descripcion: string
    Codigo: string
}
export type FamiliasResponse = {
    Resultados: Familia[]
}

export type Familia = {
    Descripcion: string
    Codigo: string
}

export type WooCommerceProduct = {
    "ID": string
    "Tipo": "simple"
    "SKU": string
    "Nombre": string
    "Publicado": string
    "¿Está destacado?": string
    "Visibilidad en el catálogo": string
    "Descripción corta": string
    "Descripción": string
    "Día en que empieza el precio rebajado": string
    "Día en que termina el precio rebajado": string
    "Estado del impuesto": string
    "Clase de impuesto": string
    "¿Existencias?": string
    "Inventario": number
    "Cantidad de bajo inventario": string
    "¿Permitir reservas de productos agotados?": string
    "¿Vendido individualmente?": string
    "Peso (kg)": string
    "Longitud (cm)": string
    "Anchura (cm)": string
    "Altura (cm)": string
    "¿Permitir valoraciones de clientes?": string
    "Nota de compra": string
    "Precio rebajado": number
    "Precio normal": number
    "Categorías": string
    "Etiquetas": string
    "Clase de envío": string
    "Imágenes": string
    "Límite de descargas": string
    "Días de caducidad de la descarga": string
    "Superior": string
    "Productos agrupados": string
    "Ventas dirigidas": string
    "Ventas cruzadas": string
    "URL externa": string
    "Texto del botón": string
    "Posición": string
    "Swatches Attributes": string
}

export type WooCommerceSKU = {
    SKU: "string"
}
