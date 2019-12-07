using IPS.BusinessModels.EmailModel;
using IPS.BusinessModels.UserModel;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business.Interfaces
{
    public interface IIpsEmailService
    {
        int Add(IpsEmail email);
        List<IpsEmailModel> GetAllEmails();
        List<IpsEmailModel> getGmailMessages(IpsGmailUserModel ipsGmailUserModel);
        List<IpsEmailModel> getGmailSentMessages(IpsGmailUserModel ipsGmailUserModel);
        IpsUnreadMessageModel getUnreadMessages();
        List<IpsEmailModel> GetAllSentEmails();
        IpsEmail GetEmailById(int id);
        IpsEmailModel GetGmailById(IpsGmailUserModel ipsGmailUserModel, string filePath);
        bool MarkEmailAsRead(int id);
        bool MarkEmailsAsRead(List<int> emailIds);
        List<IpsUserModel> GetUsersByEmail();
        bool isGmailValid(IpsGmailUserModel ipsGmailUserModel);
        bool sendEmail(IpsEmail email, List<string> attachments);
    }
}
