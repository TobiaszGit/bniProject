import { LightningElement, api, track, wire } from 'lwc';
import getContacts from '@salesforce/apex/BniController.getContacts';

export default class ContactFinder extends LightningElement {
    @api topics = '';
    

    @wire(getContacts, {topicName: '$topics'}) contacts;

    updateTopics(event){
        this.topics = event.target.topics;
    }
    
    showContacts(event){
        window.clearTimeout(this.delayTimeout);
        const topics = event.target.value;
        this.delayTimeout = setTimeout(() => {
        this.topics = topics;
        }, 300);
    }

    hasContacts(){
        console.log(contacts.data.length);
        if(contacts.data.length > 0){
            return true;
        }
        return false;
    }

    

}