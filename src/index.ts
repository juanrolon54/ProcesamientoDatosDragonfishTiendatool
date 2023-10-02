import { Articulo, ArticulosResponse, CategoriasResponse, ClasificacionesResponse, FamiliasResponse, StockYPrecioResponse, WooCommerceProduct, WooCommerceSKU } from "./types"

console.clear()
console.log('Dragonfish --> TiendaTool \n')

const ARTICULOS: ArticulosResponse = await Bun.file('./src/json/Articulos.json').json()
const STOCKYPRECIO: StockYPrecioResponse = await Bun.file('./src/json/StockYPrecio.json').json()
const CATEGORIAS: CategoriasResponse = await Bun.file('./src/json/Categorias.json').json()
const CLASIFICACIONES: ClasificacionesResponse = await Bun.file('./src/json/Clasificacion.json').json()
const FAMILIAS: FamiliasResponse = await Bun.file('./src/json/Familia.json').json()
const ALREADYEXISTINGWOOCOMMERCEPRODUCTS = (await Bun.file('./src/json/existing_products_in_woocommerce.json').json() as WooCommerceSKU[]).map(i=>String(i.SKU))

// console.log(STOCKYPRECIO.Resultados.forEach(stockyprecio => {
//     let precio = stockyprecio.Precios.find(precio => precio.Lista == "PUBLICO $")?.Precio
//     console.log("$"+precio, ARTICULOS.Resultados.find(i=>i.Codigo==stockyprecio.Articulo)?.Descripcion)
// }))

//CATEGORIA -> CLASIFICACION -> FAMILIA

function relationsTreeFromArticulos(articulos: Articulo[]): treeNode {

    let tree: any = {}

    for (let articulo of articulos) {
        //@ts-ignore
        if (!tree[articulo.CategoriaDeArticulo as any]) {
            tree[articulo.CategoriaDeArticulo as any] = {}
        }
        if (!tree[articulo.CategoriaDeArticulo as any][articulo.Clasificacion as any]) {
            tree[articulo.CategoriaDeArticulo as any][articulo.Clasificacion as any] = {}
        }
        if (!tree[articulo.CategoriaDeArticulo as any][articulo.Clasificacion as any][articulo.Familia as any]) {
            tree[articulo.CategoriaDeArticulo as any][articulo.Clasificacion as any][articulo.Familia as any] = {}
        }

    }

    return tree
}

type treeNode = { [key: string]: treeNode }
const taxonomyRelations: treeNode = relationsTreeFromArticulos(ARTICULOS.Resultados);

let categorias = Object.fromEntries(CATEGORIAS.Resultados.map(i => {
    return [i.Codigo, i.Descripcion]
}))
let clasificaciones = Object.fromEntries(CLASIFICACIONES.Resultados.map(i => {
    return [i.Codigo, i.Descripcion]
}))
let familias = Object.fromEntries(FAMILIAS.Resultados.map(i => {
    return [i.Codigo, i.Descripcion]
}))

function createWooCommerceFriendlyArticleCategories(articulo: Articulo) {

    function escapeCommas(str: string) {
        return str.split(",").join("\\,")
    }

    function echoTerms(...args: string[]) {
        if (args.length === 0) {
            return '';
        }

        let terms = args.map(e => e.trim()).filter(Boolean)

        const result = [terms[0]];
        let combinedString = terms[0];

        for (let i = 1; i < terms.length; i++) {
            combinedString += ` > ${terms[i]}`;
            result.push(combinedString);
        }

        return result.map(escapeCommas).join(', ');
    }

    let terms = [
        categorias[articulo.CategoriaDeArticulo as string] || "",
        clasificaciones[articulo.Clasificacion as string] || "",
        familias[articulo.Familia as string] || "",
    ].filter(i => i != "")

    return echoTerms(...terms)
}
function imageFromRUMBOSRL(articulo: Articulo) {
    let imageURL = `https://www.rumbosrl.com.ar/uploads/products/images/large/${articulo.Codigo}.png`
    return imageURL
}
async function writeImageFromRUMBOSRL(articulo: Articulo) {
    if (await Bun.file(`images/${articulo.Codigo}.png`).exists()) return
    try {
        let imageResponse = await fetch(imageFromRUMBOSRL(articulo))
        if (imageResponse.ok) {
            let imageBlob = await imageResponse.blob();
            console.log(true, articulo.Codigo)
            await Bun.write(`images/${articulo.Codigo}.png`, imageBlob)
        } else {
            let imageResponse = await fetch(imageFromRUMBOSRL(articulo) + "_1")
            if (imageResponse.ok) {
                let imageBlob = await imageResponse.blob();
                console.log(true, articulo.Codigo)
                await Bun.write(`images/${articulo.Codigo}.png`, imageBlob)
            } else {
                console.log(false, articulo.Codigo)
            }
        }
    } catch (e) {
        console.log(false, articulo.Codigo)
    }
}
async function testImage(articulo: Articulo) {
    let url = imageFromRUMBOSRL(articulo)
    const response = await fetch(url)
    console.log(response.ok, articulo.Codigo)
    return response.ok ? url : ""
}

function newWooCommerceProduct(articulo: Articulo): WooCommerceProduct {
    const SKU = articulo.Codigo;
    
    const thisStockYPrecio = STOCKYPRECIO.Resultados.find(syp => syp.Articulo == articulo.Codigo)
    
    const INVENTARIO = thisStockYPrecio?.Stock ?? 1111111
    const PRECIO = thisStockYPrecio?.Precios.find(i => i.Lista == 'PUBLICO $')?.Precio ?? 1111111
    const CATEGORIASSTRING = createWooCommerceFriendlyArticleCategories(articulo)
    
    const NOMBRE = articulo.Descripcion
    //const IMAGEN = `https://tiendatool.com/wp-content/uploads/2023/09/${articulo.Codigo}.png`
    const IMAGEN = ""
    
    return {
        "ID": "",
        "Tipo": "simple",
        "SKU": SKU,
        "Nombre": NOMBRE,
        "Publicado": "1",
        "¿Está destacado?": "0",
        "Visibilidad en el catálogo": "visible",
        "Descripción corta": "",
        "Descripción": `[vc_row][vc_column][vc_column_text]Motosierra sencilla, económica, fácil de poner en marcha y fácil de usar, perfecta para tareas de corte ligero como la preparación de leña y la poda ligera. Ideal para pequeñas propiedades rurales. Su bomba de inyección ayuda en el arranque, mientras que su tamaño compacto y baja vibración significan más comodidad y mejor manejo para el usuario. Las funciones inteligentes de la motosierra 120, como la aceleración de respuesta rápida, ayudan a aumentar su productividad al reducir el tiempo de inactividad.\n\n<h4>Detalles de producto</h4>\n\n<ul>\n\n 	<li>Cilindrada: 35 c.c.</li>\n\n 	<li>Potencia: 1.44 Kw</li>\n\n 	<li>Velocidad máx.: 11000 rpm</li>\n\n 	<li>Capacidad de combustible: 0.25 lts</li>\n\n 	<li>Tamaño de Espada: 16""</li>\n\n 	<li>Paso de la cadena: 3/8"" LP</li>\n\n 	<li>Calibre: 1.3 mm</li>\n\n 	<li>Origen: China</li>\n\n 	<li>Peso Bruto: 7.15 Kg</li>\n\n</ul>\n\n[/vc_column_text][/vc_column][/vc_row][vc_row][vc_column][vc_tta_accordion active_section=""0""][vc_tta_section title=""Especificaciones técnicas"" tab_id=""1689192497545-d4489a26-6459""][vc_row_inner equal_height=""yes""][vc_column_inner width=""1/2"" css="".vc_custom_1689193255658{margin-bottom: 0px !important;}""][vc_column_text]Cilindrada: 35 c.c.\n\nPotencia: 1.44 Kw\n\nVelocidad máx.: 11000 rpm\n\nCapacidad de combustible: 0.25 lts\n\nTamaño de Espada:16""[/vc_column_text][/vc_column_inner][vc_column_inner width=""1/2""][vc_column_text]Paso de la cadena: 3/8"" LP\n\nCalibre: 1.3 mm\n\nOrigen: China\n\nPeso Bruto: 7.15 Kg[/vc_column_text][/vc_column_inner][/vc_row_inner][/vc_tta_section][vc_tta_section title=""Contenidos relacionados"" tab_id=""1689192497555-1a7f9476-9392""][vc_row_inner equal_height=""yes""][vc_column_inner width=""1/3"" css="".vc_custom_1689259676385{padding-top: 20px !important;padding-bottom: 20px !important;}""][et_video_lightbox style=""lightbox-image"" animation="""" video=""https://www.youtube.com/watch?v=xaW7SggoTqo"" image=""1766""][/vc_column_inner][vc_column_inner width=""1/3"" css="".vc_custom_1689259685932{padding-top: 20px !important;padding-bottom: 20px !important;}""][et_video_lightbox style=""lightbox-image"" animation="""" video=""https://www.youtube.com/watch?v=xaW7SggoTqo"" image=""1766""][/vc_column_inner][vc_column_inner width=""1/3"" css="".vc_custom_1689259694829{padding-top: 20px !important;padding-bottom: 20px !important;}""][et_video_lightbox style=""lightbox-image"" animation="""" video=""https://www.youtube.com/watch?v=xaW7SggoTqo"" image=""1766""][/vc_column_inner][/vc_row_inner][/vc_tta_section][/vc_tta_accordion][/vc_column][/vc_row]`,
        "Día en que empieza el precio rebajado": "",
        "Día en que termina el precio rebajado": "",
        "Estado del impuesto": "taxable",
        "Clase de impuesto": "",
        "¿Existencias?": "1",
        "Inventario": INVENTARIO,
        "Cantidad de bajo inventario": "",
        "¿Permitir reservas de productos agotados?": "0",
        "¿Vendido individualmente?": "0",
        "Peso (kg)": "",
        "Longitud (cm)": "",
        "Anchura (cm)": "",
        "Altura (cm)": "",
        "¿Permitir valoraciones de clientes?": "0",
        "Nota de compra": "",
        "Precio rebajado": PRECIO,
        "Precio normal": PRECIO,
        "Categorías": CATEGORIASSTRING,
        "Etiquetas": "",
        "Clase de envío": "",
        "Imágenes": IMAGEN,
        "Límite de descargas": "",
        "Días de caducidad de la descarga": "",
        "Superior": "",
        "Productos agrupados": "",
        "Ventas dirigidas": "",
        "Ventas cruzadas": "",
        "URL externa": "",
        "Texto del botón": "",
        "Posición": "0",
        "Swatches Attributes": "",
    }
}


let newWooCommerceProducts = ARTICULOS.Resultados
    .filter(i => i.Codigo !== "SEÑA" && !ALREADYEXISTINGWOOCOMMERCEPRODUCTS.includes(i.Codigo))
    .map(articulo => newWooCommerceProduct(articulo))

await Bun.write('./out/newWooCommerceProducts.json', JSON.stringify(newWooCommerceProducts))
