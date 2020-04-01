import { LightningElement, track, api, wire } from 'lwc';
import getContact from '@salesforce/apex/BniController.getContact';
import saveContactAndAccount from '@salesforce/apex/BniController.saveContactAndAccount';
import getTopics from '@salesforce/apex/BniController.getTopics';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ContactDetails extends LightningElement {
    @api contactid;
    @api loaded = false;
    @api matchedTopics = [];
    @track badgeTopics = [];
    @wire(getTopics) topicsList;
    @track contact = {
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
        }
    };

    pickTopic(event){
        this.badgeTopics.push(event.target.innerHTML);
        this.matchedTopics.splice(this.matchedTopics.indexOf(event.target.innerHTML), 1);  
    }

    matchTopic(event){
        const newTopic = event.target.value;
        this.matchedTopics = [newTopic];
        this.topicsList.data.forEach( item => {
            if(newTopic && this.badgeTopics.indexOf(item) == -1){
                if(item.toLowerCase().indexOf(newTopic.toLowerCase()) != -1){
                    this.matchedTopics.push(item);
                }
            }
        })
        
    }

    removeTopic(event){
        this.badgeTopics.splice(this.badgeTopics.indexOf(event.target.label), 1); 
        this.matchedTopics.push(event.target.label); 
    }

    updateContact(event){

        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                        inputCmp.reportValidity();
                        return validSoFar && inputCmp.checkValidity();
            }, true);
        if(!allValid){
            this.showToastMessage('Wprowadź poprawne dane', 'error', '');
            return;
        }

        let jsonStr = '{\"contactId\":' + '\"' + this.contactid + '\",';
        jsonStr += '\"accountId\":' + '\"' + this.contact.AccountId + '\",';
        var inp = this.template.querySelectorAll('lightning-input');
        inp.forEach(element => {
            if(element.type!='search'){
                jsonStr += '\"' + element.name + '\":\"' + element.value.replace(/(['"])/g, "\\$1") + '\",';
            }
        });

        inp = this.template.querySelectorAll("lightning-input-address");
        jsonStr += '\"street\":\"' + inp[0].street + '\",';
        jsonStr += '\"city\":\"' + inp[0].city + '\",';
        jsonStr += '\"province\":\"' + inp[0].province + '\",';
        jsonStr += '\"country\":\"' + inp[0].country + '\",';
        jsonStr += '\"postalCode\":\"' + inp[0].postalCode + '\",';

        jsonStr += '\"topics\":[';
        inp = this.template.querySelectorAll("lightning-badge");
        inp.forEach(element =>{
            jsonStr += '\"' + element.label + '\",';
        });
        if(jsonStr[jsonStr.length -1] == ','){
            jsonStr = jsonStr.substring(0, jsonStr.length - 1);
        }

        jsonStr += ']}';
        console.log("zapisuje>> " + jsonStr); 
        
        saveContactAndAccount({ jsonString: jsonStr })
            .then(result => {
                if(result == 'Dodano kontakt'){
                    this.showToastMessage('Zaktualizowano kontakt', 'success', '');
                    document.location.href='/bni/s/moje-kontakty'
                }
                else{
                    this.showToastMessage('Nie udało się zapisać kontaktu', 'error', result);
                }
            })
            .catch(error =>{
                console.log(JSON.stringify(error));
                this.showToastMessage('Nieoczekiwany błąd!', 'error', error.body.message);
            });
    }


    connectedCallback(){
        console.log('init');
        this.contactid = new URL(window.location.href).searchParams.get('contactid');
        getContact({ Id: this.contactid })
            .then(result => {
                console.log(JSON.stringify(result));
                this.contact = result;
                let specjalizacja =  this.contact.Account.Specjalizacja__c.toString().slice(0, -1).split(';');
                this.badgeTopics = specjalizacja;
                console.log(specjalizacja);
            })
            .catch(error =>{
                console.log('error ' + JSON.stringify(error));
            });
    }

    showToastMessage(title1, varian1, message1){
        this.dispatchEvent(
            new ShowToastEvent({
                title: title1,
                message: message1,
                variant: varian1
            }),
        );
        this.loaded = false;
    }
}