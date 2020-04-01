import { LightningElement, track } from 'lwc';
import getContact from '@salesforce/apex/BniController.getContact';
export default class OwnerDetails extends LightningElement {

    ownerId;
    @track contact = {
        Id: '',
        Name: '',
        FirstName: '',
        LastName: '',
        Title: '',
        Phone: '',
        Email: '',
        AccountId: '',

        Account: {
            NIP__c: '',
            Name: '',
            Website: '',
            BillingStreet: '',
            BillingCity: '',
            BillingCountry: '',
            BillingPostalCode: '',
            BillingState: '',
            Specjalizacja__c: ''
        },
        BNI_OwnerId__r: {
            Name:''
        }
    };

    connectedCallback(){
        console.log('init');
        this.ownerId = new URL(window.location.href).searchParams.get('ownerid');
        getContact({ Id: this.ownerId })
            .then(result => {
                console.log(JSON.stringify(result));
                this.contact = result;
            })
            .catch(error =>{
                console.log('error ' + JSON.stringify(error));
            });
    }
}