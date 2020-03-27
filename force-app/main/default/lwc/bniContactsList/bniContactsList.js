import { LightningElement, api, wire } from 'lwc';
import getContacts from '@salesforce/apex/BniController.getContacts';


export default class BniContactsList extends LightningElement {
    @api topic;

    @wire(getContacts, {str: '$topic', searchByUserId: false}) contacts;
    

    handleToggleClick(event){
        this.dispatchEvent(new CustomEvent('switchdetailsview', {detail: event.currentTarget.dataset.id}));
    }


}