import { LightningElement, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getContacts from '@salesforce/apex/BniController.getContacts';


export default class BniContactsList extends NavigationMixin(LightningElement) {
    @api topic;

    @wire(getContacts, {str: '$topic', searchByOwnerId: false}) contacts;
    

    viewDetails(event){
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: 'wlasciciel'
            },
            state:{
                ownerid: event.currentTarget.dataset.id
            }
        });
    }


}