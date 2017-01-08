import {Component} from '@angular/core';

@Component({
    selector: 'main-header',
    styles: [require('./styles.css')],
    template: require('./template.html')
})

export class MainHeaderComponent {
    private isMenu = true;

    toggleArrow() {
        this.isMenu = !this.isMenu;
    }
}
