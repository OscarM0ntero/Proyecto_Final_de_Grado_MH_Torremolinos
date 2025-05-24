import { Injectable, OnInit } from '@angular/core';
import { ContenidoService, Contenido } from './contenido.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ContenidoWebService implements OnInit{

  private contenidosPorPagina = new Map<string, Contenido[]>();

  lang: string = 'es';

  constructor(
    private contenidoService: ContenidoService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    const lang = localStorage.getItem('lang');
    if(lang)
      this.lang = lang;
  }

  async cargarContenidoPagina(pagina: string): Promise<void> {
    if (!this.contenidosPorPagina.has(pagina)) {
      const datos = await this.contenidoService.getContenido(pagina).toPromise();
      if (datos) {
        this.contenidosPorPagina.set(pagina, datos);
      }
    }
  }

  getContenidosPagina(pagina: string): Contenido[] {
    return this.contenidosPorPagina.get(pagina) ?? [];
  }  

  getTexto(id_contenido: number, pagina: string): string {
    const lang = this.translate.currentLang || this.lang;
    const lista = this.contenidosPorPagina.get(pagina);
    const item = lista?.find(c => c.id_contenido === id_contenido);
    return (item as any)?.[`texto_${lang}`] ?? '';
  }

  getTitulo(id_contenido: number, pagina: string): string {
    const lang = this.translate.currentLang || this.lang;
    const lista = this.contenidosPorPagina.get(pagina);
    const item = lista?.find(c => c.id_contenido === id_contenido);
    return (item as any)?.[`titulo_${lang}`] ?? '';
  }
}
