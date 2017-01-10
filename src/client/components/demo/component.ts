import {Component} from '@angular/core';

@Component({
    selector: 'demo',
    template: require('./template.html'),
    styles: [require('./styles.scss')]
})
export class DemoComponent {
  constructor() {}
}
