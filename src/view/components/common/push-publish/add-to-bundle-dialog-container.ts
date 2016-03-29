import {Component, ChangeDetectionStrategy, Input, Output, EventEmitter} from "angular2/core";
import {CORE_DIRECTIVES} from "angular2/common";
import {AddToBundleDialogComponent} from "./add-to-bundle-dialog-component";
import {BehaviorSubject} from "rxjs/Rx";
import {BundleService, IBundle} from "../../../../api/services/bundle-service";

@Component({
  selector: 'cw-add-to-bundle-dialog-container',
  directives: [CORE_DIRECTIVES, AddToBundleDialogComponent],
  template: `
  <cw-add-to-bundle-dialog-component
  [bundleStores]="bundleService.bundles$ | async"
  [hidden]="hidden"
  [errorMessage]="errorMessage | async"
  (cancel)="hidden = true; close.emit($event); errorMessage = null;"
  (addToBundle)="addToBundle($event)"
  ></cw-add-to-bundle-dialog-component>`
  , changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddToBundleDialogContainer {
  @Input() assetId:string
  @Input() hidden:boolean = false

  @Output() close:EventEmitter<{isCanceled:boolean}> = new EventEmitter(false)
  @Output() cancel:EventEmitter<boolean> = new EventEmitter(false)

  errorMessage:BehaviorSubject<string> = new BehaviorSubject(null)
  bundlesLoaded:boolean = false
  
  constructor(public bundleService:BundleService) {
    
  }

  ngOnChanges(change){
    if (change.hidden && !this.hidden && !this.bundlesLoaded) {
      console.log("AddToBundlehDialogContainer", "ngOnChanges", change.hidden.currentValue, change.hidden.previousValue)
      this.bundlesLoaded = true
      this.bundleService.loadBundleStores()
    }
  }

  addToBundle(bundle:IBundle) {
    this.bundleService.addRuleToBundle(this.assetId, bundle).subscribe((result:any)=> {
      if (!result.errors) {
        this.close.emit({isCanceled:false})
        this.errorMessage = null
      } else {
        this.errorMessage.next("Sorry there was an error please try again")
      }
    })
  }

}

