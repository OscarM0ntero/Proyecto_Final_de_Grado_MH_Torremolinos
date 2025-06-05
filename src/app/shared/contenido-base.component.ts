// Componente base de todos los componentes que permitan cargar imágenes o texto desde la base de datos
import { OnInit, Directive } from '@angular/core';
import { ContenidoWebService } from '../services/contenido-web.service';
import { Contenido, ContenidoService } from '../services/contenido.service';
import { TranslateService } from '@ngx-translate/core';
import { ImagenesService } from '../services/imagenes.service';

@Directive()
export abstract class ContenidoBaseComponent implements OnInit {

  contenidos: Contenido[] = [];

  images: any[] = [];

  lang: string = 'es';

  constructor(
    private readonly contenido: ContenidoService,
    private readonly contenidoWeb: ContenidoWebService,
    protected readonly imagenes: ImagenesService,
    protected readonly translate: TranslateService,
    protected readonly nombrePagina: string
  ) { }

  async ngOnInit(): Promise<void> {
    await this.contenidoWeb.cargarContenidoPagina(this.nombrePagina);
    this.contenidos = this.contenidoWeb.getContenidosPagina(this.nombrePagina);
    this.actualizarContenido();

    this.translate.onLangChange.subscribe(() => {
      this.actualizarContenido();
    });

    this.imagenes.loadImages(this.nombrePagina).subscribe((imgs) => {
      this.images = imgs;
    });

    this.contenido.recarga$.subscribe(async (pagina) => {
      console.log('[ContenidoRecarga] Recibido:', pagina);

      if (pagina === this.nombrePagina) {
        console.log('[ContenidoRecarga] Coincide con', this.nombrePagina);
        await this.contenidoWeb.cargarContenidoPagina(pagina, true);
        this.actualizarContenido();
      }
    });

    const lang = localStorage.getItem('lang');
    if (lang)
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
