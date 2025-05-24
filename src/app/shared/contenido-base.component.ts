import { OnInit, Directive } from '@angular/core';
import { ContenidoWebService } from '../services/contenido-web.service';
import { Contenido } from '../services/contenido.service';
import { TranslateService } from '@ngx-translate/core';

@Directive()
export abstract class ContenidoBaseComponent implements OnInit {

  contenidos: Contenido[] = [];

  lang: string = 'es';

  constructor(
    private readonly contenidoWeb: ContenidoWebService,
    private readonly translate: TranslateService,
    private readonly nombrePagina: string
  ) { }

  async ngOnInit(): Promise<void> {
    await this.contenidoWeb.cargarContenidoPagina(this.nombrePagina);
    this.contenidos = this.contenidoWeb.getContenidosPagina(this.nombrePagina);
    this.actualizarContenido();

    this.translate.onLangChange.subscribe(() => {
      this.actualizarContenido();
    });

    const lang = localStorage.getItem('lang');
    if(lang)
      this.lang = lang;
  }

  protected getTexto(id: number): string {
    const lang = this.translate.currentLang || this.lang;
    const item = this.contenidos.find(c => c.id_contenido === id);
    return (item as any)?.[`texto_${lang}`] ?? '';
  }

  protected getTitulo(id: number): string {
    const lang = this.translate.currentLang || this.lang;
    const item = this.contenidos.find(c => c.id_contenido === id);
    return (item as any)?.[`titulo_${lang}`] ?? '';
  }

  protected getContenido(id: number): { titulo: string; texto: string } {
    const lang = this.translate.currentLang || this.lang;
    const item = this.contenidos.find(c => c.id_contenido === id);
    return {
      titulo: (item as any)?.[`titulo_${lang}`] ?? '',
      texto: (item as any)?.[`texto_${lang}`] ?? ''
    };
  }

  // Para que cada hijo implemente cómo usar los datos cargados
  protected abstract actualizarContenido(): void;
}
