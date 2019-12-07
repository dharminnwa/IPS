(function () {
    'use strict';

    angular.module('ips.emails', ['ui.router', 'kendo.directives', 'growing-panes'])
        .factory('emailsManager', emailsManager);

    emailsManager.$inject = ['$q', 'apiService'];
    function emailsManager($q, apiService) {

        var self = {

            getGmailById: function (gmailUserModel) {
                return $q.when(getGmailById(gmailUserModel));
            },
            isGmailValid: function (gmailUserModel) {
                return $q.when(isGmailValid(gmailUserModel));
            },
            getEmailById: function (emailId) {
                return $q.when(getEmailById(emailId));
            },
            markEmailAsRead: function (emailId) {
                return $q.when(markEmailAsRead(emailId));
            },
            markEmailsAsRead: function (emailIds) {
                return $q.when(markEmailsAsRead(emailIds));
            },
            getAllInboxEmails: function () {
                return $q.when(getAllInboxEmails());
            },
            getGmailMessages: function (gmailUserModel) {
                return $q.when(getGmailMessages(gmailUserModel));
            },
            getGmailSentMessages: function (gmailUserModel) {
                return $q.when(getGmailSentMessages(gmailUserModel));
            },
            getAllSentEmails: function () {
                return $q.when(getAllSentEmails());
            },
            getUsersByEmail: function (email) {
                return $q.when(getUsersByEmail(email));
            },
            removeEmailAttachment: function (fileName) {
                return $q.when(removeEmailAttachment(fileName));
            },
            sendEmail: function (email) {
                return $q.when(sendEmail(email));
            }
        }
        return self;


        function getAllInboxEmails() {
            var deferred = $q.defer();
            var apiName = 'emails/getEmails';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }



        function getGmailMessages(gmailUserModel) {
            var deferred = $q.defer();
            var apiName = 'emails/getGmailMessages' 
            apiService.add(apiName, gmailUserModel).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getGmailSentMessages(gmailUserModel) {
            var deferred = $q.defer();
            var apiName = 'emails/getGmailSentMessages';
            apiService.add(apiName, gmailUserModel).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getAllSentEmails() {
            var deferred = $q.defer();
            var apiName = 'emails/getSentEmails';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function isGmailValid(gmailUserModel) {
            var deferred = $q.defer();
            var apiName = 'emails/isGmailValid';
            apiService.add(apiName, gmailUserModel).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getEmailById(emailId) {
            var deferred = $q.defer();
            var apiName = 'emails/getEmailById';
            apiService.getById(apiName, emailId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function getGmailById(gmailUserModel) {
            var deferred = $q.defer();
            var apiName = 'emails/getGmailById'
            apiService.add(apiName, gmailUserModel).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

        function markEmailAsRead(emailId) {
            var deferred = $q.defer();
            var apiName = 'emails/MarkEmailAsRead';
            apiService.getById(apiName, emailId).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function markEmailsAsRead(emailIds) {
            var deferred = $q.defer();
            var apiName = 'emails/MarkEmailsAsRead';
            apiService.add(apiName, emailIds).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        

        function getUsersByEmail(email) {
            var deferred = $q.defer();
            var apiName = 'emails/getUsersByEmail';
            apiService.getAll(apiName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function removeEmailAttachment(fileName) {
            var deferred = $q.defer();
            var apiName = 'emails/removeEmailAttachment';
            apiService.getById(apiName, fileName).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }
        function sendEmail(email) {
            var deferred = $q.defer();
            var apiName = 'emails/sendEmail';
            apiService.add(apiName, email).then(function (data) {
                deferred.resolve(data);
            },
                function (data) {
                    deferred.reject(data);
                });
            return deferred.promise;
        }

    }

})();