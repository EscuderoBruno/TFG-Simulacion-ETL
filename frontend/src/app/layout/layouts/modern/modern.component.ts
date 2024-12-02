import { CommonModule } from '@angular/common';  // Importa CommonModule
import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import { FuseHorizontalNavigationComponent, FuseNavigationService, FuseVerticalNavigationComponent } from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { Navigation } from 'app/core/navigation/navigation.types';
import { LanguagesComponent } from 'app/layout/common/languages/languages.component';
import { MessagesComponent } from 'app/layout/common/messages/messages.component';
import { NotificationsComponent } from 'app/layout/common/notifications/notifications.component';
import { QuickChatComponent } from 'app/layout/common/quick-chat/quick-chat.component';
import { SearchComponent } from 'app/layout/common/search/search.component';
import { ShortcutsComponent } from 'app/layout/common/shortcuts/shortcuts.component';
import { UserComponent } from 'app/layout/common/user/user.component';
import { Subject, takeUntil } from 'rxjs';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { RouterModule } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';


@Component({
    selector     : 'modern-layout',
    templateUrl  : './modern.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [CommonModule, FuseLoadingBarComponent, NgIf, FuseVerticalNavigationComponent, FuseHorizontalNavigationComponent, MatButtonModule, MatIconModule, LanguagesComponent, FuseFullscreenComponent, SearchComponent, ShortcutsComponent, MessagesComponent, NotificationsComponent, UserComponent, RouterOutlet, QuickChatComponent, RouterModule, MatMenuModule, MatDividerModule],
})
export class ModernLayoutComponent implements OnInit, OnDestroy
{
    isScreenSmall: boolean;
    navigation: Navigation;
    currentUser: any;  // Propiedad para almacenar los datos del usuario
    isUserMenuOpen = false; // Variable para controlar la visibilidad del menú desplegable
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    navigationItems: FuseNavigationItem[] = [];

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _navigationService: NavigationService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _authService: AuthService // Inyectamos AuthService
    )
    {
        this.setNavigationItems(); // Inicializamos los elementos de navegación aquí
    }

    private setNavigationItems(): void {
        // Siempre añade los elementos comunes
        this.navigationItems = [
            {
                id: 'simulaciones',
                title: 'Simulaciones',
                type: 'basic',
                link: '/simulaciones',
                icon: 'heroicons_outline:adjustments-horizontal'
            },
            {
                id: 'sensores',
                title: 'Sensores',
                type: 'basic',
                link: '/sensores',
                icon: 'heroicons_outline:map'
            },
            {
                id: 'conexiones',
                title: 'Conexiones',
                type: 'basic',
                link: '/conexiones',
                icon: 'heroicons_outline:server-stack'
            }    
        ];

        // Añade "Gestión usuarios" solo si el usuario es admin
        if (this._authService.isAdmin()) {
            this.navigationItems.push({
                id: 'gestion_usuarios',
                title: 'Gestión usuarios',
                type: 'basic',
                link: '/gestion_usuarios',
                icon: 'heroicons_outline:users'
            });
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number
    {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {   
        // Subscribe to navigation data
        this._navigationService.navigation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((navigation: Navigation) =>
            {
                this.navigation = navigation;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });

        // Obtener el usuario actualmente autenticado
        this.currentUser = this._authService.getCurrentUser();  // Llama al método para obtener el usuario
        console.log('Usuario actual:', this.currentUser);  // Imprime el usuario en la consola
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
        }
    }

    signOut() {
        this._authService.signOut();
    }
}
