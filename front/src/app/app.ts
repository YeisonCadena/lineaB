import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { GisMapComponent } from './components/gis-map.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HttpClientModule, GisMapComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('lineab');
}
