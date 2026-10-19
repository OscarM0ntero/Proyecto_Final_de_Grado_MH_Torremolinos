// Componente base de todos los componentes que permitan cargar imágenes o texto desde la base de datos
import { OnInit, OnDestroy, Directive, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { ContenidoWebService } from '../services/contenido-web.service';
import { Contenido, ContenidoService } from '../services/contenido.service';
import { TranslateService } from '@ngx-translate/core';
import { ImagenesService } from '../services/imagenes.service';

@Directive()
export abstract class ContenidoBaseComponent implements OnInit, OnDestroy {

  contenidos: Contenido[] = [];
  images: any[] = [];
  lang: string = 'es';

  private subs: Subscription[] = [];
  private readonly plataforma = inject(PLATFORM_ID);

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

    this.subs.push(
      this.translate.onLangChange.subscribe(() => {
        this.actualizarContenido();
      }),
      this.imagenes.loadImages(this.nombrePagina).subscribe((imgs) => {
        this.images = imgs;
      }),
      this.contenido.recarga$.subscribe(async (pagina) => {
        if (pagina === this.nombrePagina) {
          await this.contenidoWeb.cargarContenidoPagina(pagina, true);
          this.actualizarContenido();
        }
      })
    );

    // localStorage no existe en el servidor. Sin esta guarda el ngOnInit lanzaba
    // "localStorage is not defined" durante el SSR y la pagina se quedaba a medio
    // renderizar. Hasta ahora no se notaba porque @angular/ssr rechazaba la cabecera Host
    // y caia a renderizado en cliente antes de llegar aqui (ver allowedHosts en server.ts).
    if (isPlatformBrowser(this.plataforma)) {
      const lang = localStorage.getItem('lang');
      if (lang) this.lang = lang;
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
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
