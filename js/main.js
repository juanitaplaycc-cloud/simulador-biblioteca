"use strict";

//=========================
//Simulador Biblioteca Paramo
//Pre-entrega 5
//Autora: Juanita Callejas Castro
//
//Indice:
//1.Constantes
//2.Clase Libro
//3. Instancias (new) y arrays del simulador
// 4. Funciones de utilidad
// 5. Funciones de interfaz (DOM)
// 6. Procesos del simulador (prestamo, devolucion, busqueda, estadisticas)
// 7. Verificacion de metodos
//8. Simulador Principal
// 9. Inicio
//==========================

// 1. Constantes

const   MULTA_POR_DIA =1500; //COP por cada dia de retraso
const  DIAS_PRESTAMO = 7; //dias permitidos antes de cobrar multa
const LIMITE_PRESTAMOS =3; //libros que una persona puede tener ala vez

//2. Clase

class Libro {
 /**
     * @param {number} id - Identificador unico
     * @param {string} titulo - Nombre del libro
     * @param {string} autor - Autor del libro 
     * @param {string} categoria - Genero o tema
     * @param {number} copiasTotales -Copias qie posee la blioteca
     */
    constructor(id, titulo, autor, categoria, copiasTotales){
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.categoria = categoria;
        this.copiasTotales = copiasTotales;
        this.copiasDisponibles  =   copiasTotales;
        this.vecesPrestado = 0;
    }

    //Getter: indica si hay al menos una copia para prestar
    get disponible() {
        return this.copiasDisponibles > 0;
    }

    //Metodo de instancia: modifica el estado del objeto
    prestar() {
        if(!this.disponible) {
            return false;
        }
        this.copiasDisponibles--;
        this.vecesPrestado++;
        return true;
    }

    //Metodo de instancia: modifica el estado sin superar el total de copias
    devolver() {
        if(this.copiasDisponibles >= this.copiasTotales) {
            return false;
        }
        this.copiasDisponibles++;
        return true;
    }

    //Metodo de instancia: realiza un calculo
    calcularMulta(diasUsados) {
        const diasDeRetraso = diasUsados - DIAS_PRESTAMO;
        return diasDeRetraso > 0 ? diasDeRetraso * MULTA_POR_DIA : 0;
    }

    // Metodo de instancia: informa el estado actual
    informarEstado() {
        const estado = this.disponible ? "Disponible" : "Agotado";
        return `[${this.id}] ${this.titulo} - ${this.autor} | ${this.categoria} | Copias: ${this.copiasDisponibles}/${this.copiasTotales} | ${estado}`;
    }
}

// 3. Instancias y Arrays del simulador

const libro1 = new Libro(1, "Cien años de soledad", "Gabriel García Márquez", "Novela", 3);
const libro2 = new Libro(2, "El Principito", "Antoine de Saint-Exupéry", "Fábula", 2);
const libro3 = new Libro(3, "Rayuela", "Julio Cortázar", "Novela", 1);
const libro4 = new Libro(4, "Padre Rico, Padre Pobre", "Robert Kiyosaki", "Finanzas", 2);
const libro5 = new Libro(5, "Hábitos Atómicos", "James Clear", "Desarrollo personal", 2);
const libro6 = new Libro(6, "El coronel no tiene quien le escriba", "Gabriel García Márquez", "Novela", 1);
 
const catalogo = [libro1, libro2, libro3, libro4, libro5, libro6];
const librosPrestados = []; //libros que la persona tiene en su poder
let multasAcumuladas = 0; //total de multas de la sesion

//4. Funciones de utilidad

//Funcion flecha con return: suma las copias disponibles de una lista
const contarCopiasDisponibles =(lista) => {
    let total = 0;
    for (const libro of lista) {
        total += libro.copiasDisponibles;
    }
    return total;
};

//Funcion flecha: formatea un valor como pesos colombianos
const formatearPesos = (valor) => `$${valor.toLocaleString("es-CO")}`;

//Funcion flecha: retorna el libro mas prestado (o undefined si nadie ha prestado)
const obtenerMasPrestado = (lista) => {
    const masPrestado = lista.reduce(
        (mayor, libro) => (libro.vecesPrestado > mayor.vecesPrestado ? libro : mayor),
        lista[0]
    );
    return masPrestado.vecesPrestado > 0 ? masPrestado : undefined;
};

//Busca un libro por id y retorna el objeto
function buscarLibroPorId(lista, id) {
    return lista.find((libro) => libro.id === id);
}

//Retorna las categorias sin repetir
function obtenerCategorias(lista) {
    const categorias = [];
    for (const libro of lista) {
        if (! categorias.includes(libro.categoria)) {
            categorias.push(libro.categoria);
        }
    }
    return categorias;
}

//Construye el texto del menu de libros para el prompt
function construirMenuLibros(lista) {
    let texto = "Elige el ID del libro:\n\n";
    for (const libro of lista) {
        const marca = libro.disponible ? "" : " (agotado)";
        texto += `${libro.id}. ${libro.titulo}${marca}\n`;
    }
    texto += "\n0. Volver al menu";
    return texto;
}

// 5. Funciones de interfaz (DOM)
const obtenerElemento = (id) => document.getElementById(id);

//Pinta la tabla del catalogo con el estado actual de cada objeto
function renderizarCatalogo() {
    const cuerpo = obtenerElemento("catalogo-cuerpo");
    if (!cuerpo) return;


cuerpo.innerHTML = "";

for (const libro of catalogo) {
    const fila = document.createElement("tr");
    const datos = [
        libro.id,
        libro.titulo,
        libro.autor,
        libro.categoria,
        `${libro.copiasDisponible}/${libro.copiasTotales}`,
    ];

    for (const dato of datos) {
        const celda = document.createElement("td");
        celda.textContent = dato;
        fila.appendChild(celda);
    }

    const celdaEstado = document.createElement("td");
    const etiqueta = document.createElement("span");
    etiqueta.className = `estado ${libro.disponible ? "estado--disponible" : "estado--agotado"}`;

    etiqueta.textContent = libro.disponible ? "Disponible" : "Agotado";
    celdaEstado.appendChild(etiqueta);
    fila.appendChild(celdaEstado);

    cuerpo.appendChild(fila);
 }
}

//Actualiza las tres metricas del panel
function renderizarMetricas() {
    const copias = obtenerElemento("metrica-copias");
    const prestados = obtenerElemento("metrica-prestados");
    const multas = obtenerElemento("metrica-multas");

    if (copias) copias.textcontent = contarCopiasDisponibles(catalogo);
    if (prestados) prestados.textContent = librosPrestados.lenght;
    if (multas) multas.textContent = formatearPesos(multasAcumuladas);
}

//Refresca todo lo visual de una sola vez
function actualizarInterfaz() {
    renderizarCatalogo();
    renderizarMetricas();
}

//Registra un movimiento en consola y en la bitacora de la pagina
function registrarEvento(mensaje) {
    console.log(mensaje);

    const bitacora = obtenerElemento("bitacora");
    if (!bitacora) return;

    const vacio = bitacora.querySelector(".bitacora__vacio");
    if (vacio) vacio.remove();

    const hora = new Date().toLocaleTimeString("es-CO", {hour: "2-digit", minute: "2-digit"});
    const item = document.createElement("li");
    item.textContent = `${hora} - ${mensaje}`;
    bitacora.prepend(item);
}

// 6.Procesos del Simulador


//Muestra el catalogo completo en la consola
function mostrarCatalogo(lista) {
    console.log("====CATALOGO BIBLIOTECA PARAMO====");
    for (const libro of lista) {
        console.log(libro.informarEstado());
    }
    console.log(`Total de copias disponible: ${contarCopiasDisponibles(lista)}`);
}

//Proceso de prestamo
function procesarPrestamo() {
    if (librosPrestados.lenght >= LIMITE_PRESTAMOS) {
        alert(` Ya tienes ${LIMITE_PRESTAMOS} libros. Devuelve uno para pedir otro.`);
        return;
    }
    const entrada = prompt(construirMenuLibros(catalogo));
    if (entrada === null || entrada.trim() === "0") return;

    const id = Number(entrada);
    const libro = buscarLibroPorId(catalogo, id);

    if (!libro) {
        alert("❌ ID no valido. Escribe uno de los numeros del menu. ");
        return;
    }

    if (librosPrestados.includes(libro)) {
        alert(`⚠️ Ya tienes "${libro.titulo}" en tu poder.`);
        return;
    }

    if (libro.prestar()) {
        librosPrestados.push(libro);
        alert(`✅ Prestate "${libro.titulo}". Tienes ${DIAS_PRESTAMO} dias para devolverlo. `);
        registrarEvento(`Prestamo: "${libro.titulo}" (quedan ${libro.copiasDisponibles})`);
    } else {
        alert(`⚠️ "${libro.titulo}" esta agotado por ahora. `);
    }

    actualizarInterfaz();
}

//Proceso de devolucion
function procesarDevolucion() {
    if (librosPrestados.lenght === 0) {
        alert("No tienes libros pendientes por devolver.");
        return;
    }
    let texto = "¿Qué libro devuelves?\n\n";
    librosPrestados.forEach((libro, indice) =>{
        texto += `${indice + 1}. ${libro.titulo}\n`;
    });
    texto += "\n0. Volver al menu";

    const entrada = prompt(texto);
    if (entrada === null || entrada.trim() === "0") return;

    const posicion = Number(entrada) - 1;
    const libro = librosPrestados[posicion];

    if(!libro) {
        alert("❌ Opcion no valida. ");
        return;
    }

    const diasUsados = Number (prompt(`¿Cuántos días tuviste "${libro.titulo}"?`));

    if (!Number.isInteger(diasUsados) || diasUsados < 1) {
        alert("❌ Escribe un numero entero de dias mayor a 0.");
        return;
    }

    const multa = libro.calcularMulta(diasUsados);
    libro.devolver();
    librosPrestados.splice(posicion, 1);
    multasAcumuladas += multa;

    if (multa > 0) {
        alert(`📕 Devuelto con retraso. Multa: ${formatearPesos(multa)} COP`);
        registrarEvento(`Devolucion con retraso: "${libro.titulo}" | Multa ${formatearPesos(multa)}`);
    } else {
        alert("📗 Devuelto a tiempo. ¡Gracias! ");
        registrarEvento(`Devolucion a tiempo: "${libro.titulo}"`);
    }

    actualizarInterfaz();
}

//Busqueda por categoria usando filter
function buscarPorCategoria() {
    const categorias = obtenerCategorias(catalogo);

    let texto = "Escribe el numero de la categoria:\n\n";
    categorias.forEach((categoria, indice) => {
        texto += `${indice + 1}. ${categoria}\n`;
    });

    const entrada = prompt(texto);
    if (entrada === null) return;

    const categoria = categorias[Number(entrada) - 1];

    if (!categoria) {
        alert("❌ Categoría no válida.");
        return;
    }

    const resultados = catalogo.filter((libro) => libro.categoria === categoria);

    let mensaje = `Libros de la categoria "${categoria}":\n\n`;
    for (const libro of resultados) {
        mensaje += `- ${libro.titulo} (${libro.copiasDisponibles} disp.)\n`;
    }

    alert(mensaje);
    registrarEvento(`Busqueda por categoria: ${categoria} (${resultados.lenght} resultados)`);
}

//Estadisticas de la biblioteca
function mostrarEstadisticas() {
    const masPrestado = obtenerMasPrestado(catalogo);
    const totalPrestamos = catalogo.reduce((suma, libro) => suma + libro.vecesPrestado, 0);

    let mensaje = `ESTADISTICAS\n\n`;
    mensaje += `Copias disponibles: ${contarCopiasDisponibles(catalogo)}\n`;
    mensaje += `Prestamos realizados: ${totalPrestamos}\n`;
    mensaje += `Multas acumuladas: ${formatearPesos(multasAcumuladaas)}\n`;
    mensaje += masPrestado
    ? `Libro mas prestado: ${masPrestado.titulo} (${masPrestado.vecesPrestado} veces)` : "Aun no hay prestamos registrados.";

    alert(mensaje);
    registrarEvento("consulta de estadisticas");

}

//Resumen final con las propiedades modificadas
function mostrarResumenFinal() {
    console.log("=====RESUMEN FINAL=====");
    for (const libro of catalogo) {
        console.log(
            `${libro.titulo} -> copias: ${libro.copiasDisponibles}/${libro.copiasTotales}, veces prestado: ${libro.vecesPrestado}`
        );
    }

    console.log(`Libros sin devolver: ${librosPrestados.length}`);
    console.log(`Multas acumuladas: ${formatearPesos(multasAcumuladas)}`);
}

// 7.Verificacion de metodos
//Se usa un objeto de prueba para no alterar el catalogo real.

function verificarMetodos() {
    const libroPrueba = new Libro(99, "Libro de prueba", "Autora de prueba", "Pruebas", 1);

    console.group("Verificacion de metodos de la clase Libro");
    console.log("Estado inicial:", libroPrueba.informarEstado());

    libroPrueba.prestar();
    console.log("Despues de prestar():", libroPrueba.informarEstado());
    console.log("¿Se puede prestar otra vez?", libroPrueba.prestar());

    libroPrueba.devolver();
    console.log("Despues de devolver():", libroPrueba.informarEstado());

     console.log(`Multa por 5 días: ${formatearPesos(libroPrueba.calcularMulta(5))}`);
  console.log(`Multa por 10 días: ${formatearPesos(libroPrueba.calcularMulta(10))}`);
  console.log("Veces prestado (propiedad modificada):", libroPrueba.vecesPrestado);
  console.groupEnd();
}

//8. Simulador Principal (ciclo while + switch)

function iniciarSimulador() {
    alert ("📚 Bienvenida a la Biblioteca Páramo");
    mostrarCatalogo(catalogo);

    let opcion = "";

    while (opcion !== "6") {
        opcion = prompt(
            "MENU PRINCIPAL\n\n" +
            "1. Ver catalogo (consola)\n" +
            "2. Pedir un libro prestado\n" +
            "3. Devolver un libro\n" +
            "4. Buscar por categoria\n" +
            "5. Ver estadisticas\n" +
            "6. Salir"
        );

        if  (opcion === null) break;

        switch (opcion.trim()) {
            case "1":
                mostrarCatalogo(catalogo);
                break;
                case "2":
                    procesarPrestamo();
                    break;
                    case "3":
                        procesarDevolucion();
                        break;
                        case "4":
                            procesarPorCategoria();
                            break;
                            case "5":
                            mostrarEstadisticas();
                            break;
                            case "6":
                                alert("¡Hasta pronto! 📖");
                                    break;
                                     default:
                                alert("Opcion no valida. Elige un numero entre 1 y 6.");
        }
    }
    mostrarResumenFinal();
    registrarEvento("Simulador finalizado");
}

// 9.Inicio
//La pagina carga primero y el simulador arranca con el boton, asi el navegador no se bloquea con los prompt al abrir.

document.addEventListener("DOMContentLoaded", () => {
    actualizarInterfaz();
    verificarMetodos();

    const botonIniciar = obtenerElemento("btn-iniciar");
    const botonConsola = obtenerElemento("btn-consola");

    if (botonIniciar) {
        botonIniciar.addEventListener("click", iniciarSimulador);
    }

    if (botonConsola) {
        botonConsola.addEventListener("click", () => mostrarCatalogo(catalogo));
    }
});