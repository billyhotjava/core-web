import { TestBed } from '@angular/core/testing';

import { DotTemplateCreateEditResolver } from './dot-template-designer.resolver';

xdescribe('DotTemplateDesignerService', () => {
    let service: DotTemplateCreateEditResolver;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DotTemplateCreateEditResolver);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});