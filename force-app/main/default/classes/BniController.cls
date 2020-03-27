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
    global static List<Contact> getContacts(String str, Boolean searchByUserId){
        if(!searchByUserId){
            str = '%' + str + '%';
            return [SELECT Id, Name, Phone, Title, Account.Name, Account.Specjalizacja__c, Account.website, CreatedBy.Name FROM Contact WHERE Account.Specjalizacja__c LIKE :str];
        }
        return [SELECT Id, Name, FirstName, LastName, Email, Phone, Title, Account.Name, Account.Specjalizacja__c, Account.Website, Account.NIP__c, CreatedDate FROM Contact WHERE OwnerId=:str];
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
        Contact[] con = [SELECT FirstName, LastName, Title, Phone, Email, Id, AccountId, Account.Name, Account.NIP__c, Account.Specjalizacja__c, Account.Website, CreatedBy.Name, Account.BillingStreet, Account.BillingCity, Account.BillingCountry, Account.BillingPostalCode, Account.BillingState 
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

        

        

        /*List<Topic> topics = addNewTopics((List<Object>)m.get('topics'));
        List<TopicAssignment> topicAss = new List<TopicAssignment>();*/

        
        
        
            /*for(Topic t: topics){
                topicAss.add(new TopicAssignment(
                    EntityId = acc.Id,
                    TopicId = t.Id
                ));
                System.debug(t.Name + '>dodany do assignmentu<' + acc.Name);
            }
            
            insert topicAss;*/
        try {
            String accountId = upsertAccount(m, (String)m.get('accountId'));
            upsertContact(m, accountId, '');
        } catch(DmlException e){
            result += e.getMessage();
            result += '>DML exception<';
        }

        return result;
    }

    private static void upsertContact(Map<String, Object> m, String accountId, String contactId){
        System.debug('upsert contactu');
        Contact con = new Contact(
            AccountId = accountId,
            FirstName = (String)m.get('firstName'),
            LastName = (String)m.get('lastName'),
            Title = (String)m.get('title'),
            Phone = (String)m.get('phone'),
            Email = (String)m.get('email')
        );
        if(!String.isBlank(contactId)){
            con.Id = contactId;
        }
        insert con;
    }
    private static Id upsertAccount(Map<String, Object> m, String id){
        Account acc;
        System.debug('upsert acc');
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
            System.debug('jednak update');
            acc.Id = id;
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
    /*private static List<Topic> addNewTopics(List<Object> oTopics){

        List<Topic> topics = [SELECT Id, Name FROM Topic];
        List<Topic> topicsToInsert = new List<Topic>();
        List<Topic> newTopics = new List<Topic>();
        for(Object o: oTopics){
            Boolean alradyExist = false;
            for(Topic t: topics){
                if((String)o == t.Name){
                    alradyExist = true;
                    newTopics.add(t);
                    break;
                }
            }
            if(!alradyExist){
                System.debug((String)o + '<wlasnie dodany');
                topicsToInsert.add(new Topic(
                    Name = (String)o
                ));
            }
        }
        try{
            insert topicsToInsert;
        }
        catch(DmlException e){
            System.debug('Topiki...' + e.getMessage());
        }
        newTopics.addAll(topicsToInsert);
        return newTopics;
    }*/
}
