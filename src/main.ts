import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import { provideAnimations } from '@angular/platform-browser/animations'; // Importar provideAnimations para p-galleria

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
  providers: [provideAnimations()]
})
  .catch(err => console.error(err));

