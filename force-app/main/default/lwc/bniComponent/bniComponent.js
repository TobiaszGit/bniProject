import { LightningElement, api, track, wire } from 'lwc';
import getTopics from '@salesforce/apex/BniController.getTopics';

export default class ContactFinder extends LightningElement {
    topics = '';
    
    showContactDetails = false;
    contactToShow;
    matchedTopics;

   

    @wire(getTopics) topicsList;
   
    
    showContacts(event){
        const topics = event.target.value;
        this.matchedTopics = [];
        this.topicsList.data.forEach( t => {
            if(topics && t.toLowerCase().indexOf(topics.toLowerCase()) != -1){
                this.matchedTopics.push(t);
           }
        });

        this.showContactDetails = false;
        window.clearTimeout(this.delayTimeout);
        
        this.delayTimeout = setTimeout(() => {
        this.topics = topics;
        }, 300);
    }




    pickTopic(event){
        this.topics = event.target.label;
        this.matchedTopics = [this.topics];
    }

}