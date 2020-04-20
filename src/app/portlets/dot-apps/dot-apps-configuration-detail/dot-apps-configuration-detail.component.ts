import { Component, OnInit, ViewChild } from '@angular/core';
import { DotApps, DotAppsSaveData, DotAppsSecrets } from '@shared/models/dot-apps/dot-apps.model';
import { ActivatedRoute } from '@angular/router';
import { pluck, take } from 'rxjs/operators';
import * as _ from 'lodash';
import { DotAppsResolverData } from '../dot-apps-configuration/dot-apps-configuration-resolver.service';
import { DotRouterService } from '@services/dot-router/dot-router.service';
import { DotAppsService } from '@services/dot-apps/dot-apps.service';
import { DotKeyValue } from '@shared/models/dot-key-value/dot-key-value.model';
import { DotKeyValueUtil } from '@components/dot-key-value/util/dot-key-value-util';

@Component({
    selector: 'dot-apps-configuration-detail',
    templateUrl: './dot-apps-configuration-detail.component.html',
    styleUrls: ['./dot-apps-configuration-detail.component.scss']
})
export class DotAppsConfigurationDetailComponent implements OnInit {
    @ViewChild('searchInput')
    messagesKey: { [key: string]: string } = {};
    apps: DotApps;

    dynamicVariables: DotKeyValue[];
    formData: { [key: string]: string };
    formFields: any[];
    formValid = false;

    constructor(
        private route: ActivatedRoute,
        private dotRouterService: DotRouterService,
        private dotAppsService: DotAppsService
    ) {}

    ngOnInit() {
        console.log('***messagesKey', this.messagesKey)
        this.route.data
            .pipe(pluck('data'), take(1))
            .subscribe(({ messages, app }: DotAppsResolverData) => {
                this.apps = app;
                this.formFields = this.getSecrets(app.sites[0].secrets);
                this.messagesKey = messages;

                this.dynamicVariables = [].concat(
                    this.transformSecretsToKeyValue(this.getSecrets(app.sites[0].secrets, true))
                );
            });
    }

    /**
     * Saves the secrets configuration data of the app
     *
     * @memberof DotAppsConfigurationDetailComponent
     */
    onSubmit(): void {
        this.dotAppsService
            .saveSiteConfiguration(
                this.apps.key,
                this.apps.sites[0].id,
                this.getTransformedFormData()
            )
            .pipe(take(1))
            .subscribe(() => {
                this.goToApps(this.apps.key);
            });
    }

    /**
     * Redirects to app configuration listing page
     *
     * @param string key
     * @memberof DotAppsConfigurationDetailComponent
     */
    goToApps(key: string): void {
        this.dotRouterService.gotoPortlet(`/apps/${key}`);
    }

    /**
     * Handle Save event doing if new a prepend, otherwise a replace
     * to the local collection
     * @param {DotKeyValue} variable
     * @memberof DotAppsConfigurationDetailComponent
     */
    saveDynamicVariable(variable: DotKeyValue): void {
        const indexChanged = DotKeyValueUtil.getVariableIndexChanged(variable, this.dynamicVariables);
        if (indexChanged !== null) {
            this.dynamicVariables[indexChanged] = _.cloneDeep(variable);
        } else {
            this.dynamicVariables = [].concat(variable, this.dynamicVariables);
        }
    }

    /**
     * Handle Delete event doing a removing the variable from the local collection
     * @param {DotKeyValue} variable
     * @memberof DotAppsConfigurationDetailComponent
     */
    deleteDynamicVariable(variable: DotKeyValue): void {
        this.dynamicVariables = this.dynamicVariables.filter(
            (item: DotKeyValue) => item.key !== variable.key
        );
    }

    private getTransformedFormData(): DotAppsSaveData {
        const params = {};

        for (const key of Object.keys(this.formData)) {
            params[key] = {
                hidden: this.formData[`${key}Hidden`] || false,
                value: this.formData[key].toString()
            };
        }

        this.dynamicVariables.forEach((item: DotKeyValue) => {
            params[item.key] = {
                hidden: item.hidden || false,
                value: item.value.toString()
            };
        });

        return params;
    }

    private getSecrets(
        secrets: DotAppsSecrets[],
        getDynamicFields: boolean = false
    ): DotAppsSecrets[] {
        return secrets.filter((secret: DotAppsSecrets) => secret.dynamic === getDynamicFields);
    }

    private transformSecretsToKeyValue(secrets: DotAppsSecrets[]): DotKeyValue[] {
        return secrets.map(({ name, hidden, value }: DotAppsSecrets) => {
            return { key: name, hidden: hidden, value: value };
        });
    }
}