import { LightningElement, track, api, wire } from 'lwc';
import saveContactAndAccount from '@salesforce/apex/BniController.saveContactAndAccount';
import getAccount from '@salesforce/apex/BniController.getAccount';
import getTopics from '@salesforce/apex/BniController.getTopics';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class NewBniContact extends LightningElement {

    ownerId = '0033X000032q6JTQAY';  //zmien na zalogowanego uzytkownika
    
    @track loaded = false;
    @track badgeTopics = [];
    @track matchedTopics = [];
    @wire(getTopics) topicsList;
    isAccountExist = true;
    @track account = {
        Id: '',
        Name: '',
        Street: '',
        Website: '',
        City: '',
        PostalCode: '',
        State: '',
        Country: '',
        Specjalizacja: ''
    };

    matchTopic(event){
        console.log(event.target.value);
        console.log(JSON.stringify(this.topicsList));
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

    validateNip(event){
        if(event.target.value.length == 10){
            let nip = event.target.value;
            this.loaded = true;
            getAccount({ nip: nip })
                .then(result => {
                    if(result.Id){
                        this.showToastMessage('Firma ' + result.Name + ' jest już zapisana', 'success', ' ');
                        this.account.Id = result.Id;
                        this.showExistingAccountDetails(result);
                        this.isAccountExist = true;
                    }
                    else{
                        this.isAccountExist = false;
                        this.loaded = false;
                    }
                })
                .catch(error =>{
                    this.showToastMessage('Error getting', 'error', error.body.message);
                });
        }
    }

    showExistingAccountDetails(account){
        this.account.Name = account.Name;
        this.account.Website = account.Website;
        this.account.City = account.BillingCity;
        this.account.PostalCode = account.BillingPostalCode;
        this.account.State = account.BillingState;
        this.account.Country = account.BillingCountry;
        this.account.Street = account.BillingStreet;
        this.badgeTopics = account.Specjalizacja__c.split(';');
    }

    pickTopic(event){
        this.badgeTopics.push(event.target.innerHTML);
        this.matchedTopics.splice(this.matchedTopics.indexOf(event.target.innerHTML), 1);  
    }

    removeTopic(event){
        this.badgeTopics.splice(this.badgeTopics.indexOf(event.target.label), 1); 
        this.matchedTopics.push(event.target.label); 
    }

    saveContact(event){
        const allValid = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputCmp) => {
                        inputCmp.reportValidity();
                        return validSoFar && inputCmp.checkValidity();
            }, true);
        if(!allValid){
            this.showToastMessage('Wprowadź poprawne dane', 'error', '');
            return;
        }

        this.loaded = true;
        let jsonStr = '{\"accountId\":' + '\"' + this.account.Id + '\",';
        jsonStr += '\"ownerId\":' + '\"' + this.ownerId + '\",';
        var inp = this.template.querySelectorAll("lightning-input");
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
        //'Dodano kontakt'
        saveContactAndAccount({ jsonString: jsonStr })
            .then(result => {
                if(result == 'Dodano kontakt'){
                    this.showToastMessage(result, 'success', '');
                    document.location.href='/bni'
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