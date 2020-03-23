global class BniController {
    public BniController() {

    }

    /*@AuraEnabled(Cacheable=true)
    global static List<Topic> getTopics(String topicName) {
        if(String.isBlank(topicName)){
            return new List<Contact>();
        }
        topicName = '%' + topicName + '%';
        return [SELECT Id, Name FROM Topic WHERE Name LIKE :topicName];
    }*/

    @AuraEnabled(Cacheable=true)
    global static List<Contact> getContacts(String topicName){
        topicName = '%' + topicName + '%';
        return [SELECT Id, Name, Phone, Title, Account.Name, Account.Specjalizacja__c, Account.website, CreatedBy.Name FROM Contact WHERE Account.Specjalizacja__c LIKE :topicName];
        //return [SELECT Id, Name, Account.website FROM Contact WHERE AccountId IN (SELECT EntityId FROM TopicAssignment WHERE topic.name LIKE :topicName)];
    }
}
