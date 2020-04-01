global class BniController {

    @AuraEnabled(Cacheable=true)
    global static List<String> getTopics() {
        List<Contact> specjalizacje = [SELECT Account.Specjalizacja__c, Owner.Name FROM Contact WHERE Account.Specjalizacja__c != null];
        Set<String> topics = new Set<String>();
        for(Contact a:specjalizacje){
            topics.addAll(a.Account.Specjalizacja__c.split(';'));
        }
        return new List<String>(topics);
    }

    @AuraEnabled(Cacheable=true)
    global static List<Contact> getContacts(String str, Boolean searchByOwnerId){
        if(!searchByOwnerId){
            str = '%' + str + '%';
            return [SELECT Id, Name, BNI_OwnerId__c, BNI_OwnerId__r.Name, Phone, Title, Account.Name, Account.Specjalizacja__c, Account.website, OwnerId, CreatedBy.Name FROM Contact WHERE Account.Specjalizacja__c LIKE :str AND BNI_OwnerId__c!=NULL];
        }
        System.debug('Pobieram dane uzytkownika ' + str);
        return [SELECT Name, Email, BNI_OwnerId__c, BNI_OwnerId__r.Name, Phone, Title, CreatedDate, Account.Name, Account.Specjalizacja__c, Account.Website, Account.NIP__c FROM Contact WHERE BNI_OwnerId__c=:str AND Account.Specjalizacja__c!=null AND BNI_OwnerId__c!=NULL];
        //return [SELECT Id, Name, Account.website FROM Contact WHERE AccountId IN (SELECT EntityId FROM TopicAssignment WHERE topic.name LIKE :topicName)];
    }

    @AuraEnabled(Cacheable=true)
    global static Account getAccount(String nip){
        System.debug(nip);
        Account[] accs = [SELECT Id, Name, NIP__c, Specjalizacja__c, Website, CreatedBy.Name,BillingStreet, BillingCity, BillingCountry, BillingPostalCode, BillingState FROM Account WHERE NIP__c=:nip LIMIT 1];
        if(accs.size() == 0){
            return new Account();
        }
        return accs[0];
    }

    @AuraEnabled(Cacheable=true)
    global static Contact getContact(String Id){
        Contact[] con = [SELECT FirstName, BNI_OwnerId__c, LastName, Title, Phone, Email, Id, AccountId, Account.Name, Account.NIP__c, Account.Specjalizacja__c, Account.Website, CreatedBy.Name, Account.BillingStreet, Account.BillingCity, Account.BillingCountry, Account.BillingPostalCode, Account.BillingState 
                          FROM Contact 
                          WHERE Id=:Id 
                          LIMIT 1];
        if(con.size() == 0){
            System.debug('brak contactu');
            return null;
        }
        System.debug('jest ' + con[0]);
        return con[0];
           
    }

    @AuraEnabled
    global static String saveContactAndAccount(String jsonString){
        system.debug(jsonString);
        Map<String, Object> m = (Map<String, Object>) JSON.deserializeUntyped(jsonString);
        String result = 'Dodano kontakt';

        try {
            String accountId = upsertAccount(m, (String)m.get('accountId'));
            upsertContact(m, accountId, (String)m.get('contactId'));
        } catch(DmlException e){
            result = e.getMessage();
        }
        system.debug(result);
        return result;
    }

    private static void upsertContact(Map<String, Object> m, String accountId, String contactId){
        System.debug('upsert contactu ' + contactId);
        Contact con = new Contact(
            AccountId = accountId,
            BNI_OwnerId__c = (String)m.get('ownerId'), 
            FirstName = (String)m.get('firstName'),
            LastName = (String)m.get('lastName'),
            Title = (String)m.get('title'),
            Phone = (String)m.get('phone'),
            Email = (String)m.get('email')
        );
        if(!String.isBlank(contactId)){
            System.debug('jednak update');
            con.Id = contactId;
        }
        upsert con;
    }
    private static Id upsertAccount(Map<String, Object> m, String id){
        Account acc;
        System.debug('upsert acc ' + id);
        acc = new Account(
            Name = (String)m.get('accountName'),
            NIP__c = (String)m.get('nip'),
            Website = (String)m.get('website'),
            BillingStreet = (String)m.get('street'),
            BillingCity = (String)m.get('city'),
            BillingCountry = (String)m.get('country'),
            BillingPostalCode = (String)m.get('postalCode'),
            BillingState = (String)m.get('province'),
            Specjalizacja__c = getTopicsString((List<Object>)m.get('topics'))
        );
        System.debug('deklaracja ' + acc);
        if(!String.isBlank(id)){
            acc.Id = Id;
        }
        upsert acc;
        return acc.Id;
    }

    private static String getTopicsString(List<Object> oTopics){
        String topics = '';
        for(Object o: oTopics){
            topics += (String)o + ';';
        }
        return topics;
    }
}
