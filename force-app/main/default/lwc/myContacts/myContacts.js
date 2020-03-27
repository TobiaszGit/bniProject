import { LightningElement, track } from 'lwc';
import getContacts from '@salesforce/apex/BniController.getContacts';

export default class MyContacts extends LightningElement {
    owner = {
        Name: 'Tobiasz Gabler',
        Id: '0053X00000BMb6tQAD'
    };

    @track contacts;

    connectedCallback(){
        console.log('init moich kontaktów');
        getContacts({ str: this.owner.Id, searchByUserId: true })
            .then(result => {
                this.contacts = result;
            })
            .catch(error =>{
                console.log('error ' + JSON.stringify(error));
            });
    }
    get userNameTitle(){
        return 'Kontakty użytkownika ' + this.owner.Name;
    }
}