import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getContacts from '@salesforce/apex/BniController.getContacts';

export default class MyContacts extends NavigationMixin(LightningElement) {
    owner = {
        Name: 'Tobiasz Gabler',
        Id: '0033X000032q6JTQAY'
    };
    contacts = [{
        Account:{
            Name: ''
        }
    }];
    loaded = false;
    

    connectedCallback(){
        console.log('init moich kontaktów');
        getContacts({ str: this.owner.Id, searchByOwnerId: true })
            .then(result => {
                
                this.contacts = result;
                this.loaded = true;
                console.log('wynik ' + JSON.stringify(this.contacts[0].Account.Name));
                
            })
            .catch(error =>{
                console.log('error ' + JSON.stringify(error));
            });
    }

    viewDetails(event){
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: 'info'
            },
            state:{
                contactid: event.currentTarget.dataset.id
            }
        });
    }

    get userNameTitle(){
        return 'Kontakty użytkownika ' + this.owner.Name;
    }
}