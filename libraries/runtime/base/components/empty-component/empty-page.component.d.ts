import { OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { App } from '@wm/core';
import { SecurityService } from '@wm/security';
import { AppManagerService } from '../../services/app.manager.service';
export declare class EmptyPageComponent implements OnInit {
    private route;
    private securityService;
    private router;
    private app;
    private appManger;
    constructor(route: ActivatedRoute, securityService: SecurityService, router: Router, app: App, appManger: AppManagerService);
    ngOnInit(): void;
}
