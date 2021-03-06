import { Component, OnInit } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';

import { Principal, AccountService, JhiLanguageHelper } from 'app/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/index';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { IProfile, Profile } from 'app/shared/model/profile.model';
import { ProfileService } from '../../entities/profile/profile.service';

@Component({
    selector: 'jhi-settings',
    templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
    error: string;
    success: string;
    settingsAccount: any;
    languages: any[];
    profileId: number;
    isAdmin: boolean;

    constructor(
        private account: AccountService,
        private principal: Principal,
        private languageService: JhiLanguageService,
        private languageHelper: JhiLanguageHelper,
        private profileService: ProfileService
    ) {}

    ngOnInit() {
        this.principal.identity().then(account => {
            this.settingsAccount = this.copyAccount(account);
        });
        this.languageHelper.getAll().then(languages => {
            this.languages = languages;
        });

        this.isAdmin = this.principal.hasAnyAuthorityOf(['ROLE_ADMIN']);

        this.findProfileByUserId();
    }

    save() {
        this.account.save(this.settingsAccount).subscribe(
            () => {
                this.error = null;
                this.success = 'OK';
                this.principal.identity(true).then(account => {
                    this.settingsAccount = this.copyAccount(account);
                });
                this.languageService.getCurrent().then(current => {
                    if (this.settingsAccount.langKey !== current) {
                        this.languageService.changeLanguage(this.settingsAccount.langKey);
                    }
                });
            },
            () => {
                this.success = null;
                this.error = 'ERROR';
            }
        );
    }

    copyAccount(account) {
        return {
            activated: account.activated,
            email: account.email,
            firstName: account.firstName,
            langKey: account.langKey,
            lastName: account.lastName,
            login: account.login,
            imageUrl: account.imageUrl
        };
    }

    findProfileByUserId() {
        /*this.profileService.findByUserId(this.principal.getId()).subscribe(
            (res: HttpResponse<IProfile>) => (this.profileid = res.body.id)
        );*/

        this.profileService.getProfileId.subscribe(value => (this.profileId = value));

        if (this.profileId === 0) {
            this.profileService
                .query({
                    'userId.equals': this.principal.getId()
                })
                .subscribe((res: HttpResponse<IProfile[]>) => {
                    this.profileId = res.body[0].id;
                    this.profileService.setProfileId(this.profileId);
                });
        }
    }
}
