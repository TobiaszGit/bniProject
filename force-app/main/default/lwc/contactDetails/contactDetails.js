import { LightningElement, track, api } from 'lwc';
import getContact from '@salesforce/apex/BniController.getContact';

export default class ContactDetails extends LightningElement {
    @api contactid;
    @api badges = [];
    @track contact = {
        Name: '',
        FirstName: '',
        LastName: '',
        Title: '',
        Phone: '',
        Email: '',

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
        }
    };

    

    //testuj(event){
     //   console.log(JSON.stringify(this.contact));
    //}
    connectedCallback(){
        console.log('init');d
        getContact({ Id: this.contactid })
            .then(result => {
                console.log(JSON.stringify(result));
                this.contact = result;
                let specjalizacja =  this.contact.Account.Specjalizacja__c.toString().slice(0, -1).split(';');
                this.badges = specjalizacja;
               //this.contact.Account.specjalizacja =.slice(0, -1);
                //this.contact.Account.specjalizacja = this.contact.Account.Specjalizacja__c.split(';');
                console.log(specjalizacja);
            })
            .catch(error =>{
                console.log('error ' + JSON.stringify(error));
            });
    }
    handleToggleClick(){
        this.dispatchEvent(new CustomEvent('switchdetailsview'));
    }
}