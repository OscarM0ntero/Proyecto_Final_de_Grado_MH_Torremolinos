/**
 * Puente entre el Express de src/server.ts y el TranslateLoader de la aplicación.
 *
 * Durante el SSR las traducciones se leen del disco (en producción están junto al bundle, en
 * dist/web-apartamento/browser/assets/i18n/) en vez de pedirlas por red. El que sabe dónde está
 * esa carpeta es el servidor, y el que necesita el contenido es translate-loader.ts, que también
 * se compila para el navegador y por tanto no puede importar nada de Node. Así que el servidor
 * deja aquí una función lectora al arrancar y el loader la recoge.
 *
 * El intercambio pasa por globalThis a propósito: server.ts y la aplicación son dos entradas
 * distintas del mismo build y nada garantiza que compartan la instancia de este módulo.
 */
export type LectorTraducciones = (idioma: string) => Record<string, unknown> | null;

const CLAVE_GLOBAL = '__mhTorremolinosLectorTraducciones__';

type Registro = Record<string, LectorTraducciones | undefined>;

export function registrarLectorTraducciones(lector: LectorTraducciones): void {
	(globalThis as unknown as Registro)[CLAVE_GLOBAL] = lector;
}

export function obtenerLectorTraducciones(): LectorTraducciones | null {
	return (globalThis as unknown as Registro)[CLAVE_GLOBAL] ?? null;
}
