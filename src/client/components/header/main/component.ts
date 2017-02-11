import {Component} from '@angular/core';

@Component({
    selector: 'main-header',
    styleUrls: ['./styles.scss'],
    templateUrl: './template.html'
})

export class MainHeaderComponent {
    private isMenu = true;

    toggleArrow() {
        this.isMenu = !this.isMenu;
    }
}
