using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.OData;
using IPS.Business.Interfaces;
using IPS.Data;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.ProjectRoleModels;
using IPS.BusinessModels.ProjectModel;
using IPS.BusinessModels.TrainingDiaryModels;
using System.Net;
using System.Data.Entity.Infrastructure;
using log4net;
using IPS.BusinessModels.UserModel;
using System.Configuration;
using System.IO;
using IPS.WebApi.Constants;
using IPS.BusinessModels.EmailModel;

namespace IPS.WebApi.Controllers
{
    public class EmailController : BaseController
    {
        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IIpsEmailService _service;
        public EmailController(IIpsEmailService service)
        {
            _service = service;

        }


        [HttpGet]
        [Route("api/emails/getEmails")]
        public List<IpsEmailModel> GetEmails()
        {
            return _service.GetAllEmails();
        }

        [HttpPost]
        [Route("api/emails/getGmailMessages")]
        public List<IpsEmailModel> GetGmailMessages(IpsGmailUserModel ipsGmailUserModel)
        {
            return _service.getGmailMessages(ipsGmailUserModel);
        }

        [HttpPost]
        [Route("api/emails/getGmailSentMessages")]
        public List<IpsEmailModel> GetGmailSentMessages(IpsGmailUserModel ipsGmailUserModel)
        {
            return _service.getGmailSentMessages(ipsGmailUserModel);
        }





        [HttpGet]
        [Route("api/emails/getUnreadMessages")]
        public IpsUnreadMessageModel getUnreadMessages()
        {
            return _service.getUnreadMessages();
        }

        [HttpGet]
        [Route("api/emails/getSentEmails")]
        public List<IpsEmailModel> getSentEmails()
        {
            return _service.GetAllSentEmails();
        }
        [HttpPost]
        [Route("api/emails/isGmailValid")]
        public bool isGmailValid(IpsGmailUserModel ipsGmailUserModel)
        {
            return _service.isGmailValid(ipsGmailUserModel);
        }



        [HttpGet]
        [Route("api/emails/getEmailById/{emailId}")]
        public IpsEmail GetEmailById(int emailId)
        {
            return _service.GetEmailById(emailId);
        }

        [HttpPost]
        [Route("api/emails/getGmailById")]
        public IpsEmailModel getGmailById(IpsGmailUserModel ipsGmailUserModel)
        {
            string fileStorageRoot = ConfigurationManager.AppSettings["FileStorageRoot"] ?? string.Empty;
            string storagePath;
            if (string.IsNullOrWhiteSpace(fileStorageRoot))
            {
                storagePath = HttpContext.Current.Server.MapPath($"~\\{UploadFolders.BaseFolder}\\{UploadFolders.GmailAttachments}");
            }
            else
            {
                storagePath = fileStorageRoot + $"\\{UploadFolders.GmailAttachments}";
            }
            return _service.GetGmailById(ipsGmailUserModel, storagePath);
        }


        [HttpGet]
        [Route("api/emails/MarkEmailAsRead/{emailId}")]
        public bool MarkEmailAsRead(int emailId)
        {
            return _service.MarkEmailAsRead(emailId);
        }

        [HttpPost]
        [Route("api/emails/MarkEmailsAsRead")]
        public bool MarkEmailAsRead(List<int> emailIds)
        {
            
            return _service.MarkEmailsAsRead(emailIds);
        }


        [HttpGet]
        [Route("api/emails/getUsersByEmail")]
        public List<IpsUserModel> GetUsersByEmail()
        {
            return _service.GetUsersByEmail();
        }

        [HttpGet]
        [Route("api/emails/removeEmailAttachment/{fileName}")]
        public bool RemoveEmailAttachment(string fileName)
        {
            bool result = false;
            string fileStorageRoot = ConfigurationManager.AppSettings["FileStorageRoot"] ?? string.Empty;
            string directoryPath;

            if (string.IsNullOrWhiteSpace(fileStorageRoot))
            {
                directoryPath = Path.Combine(HttpContext.Current.Server.MapPath("~"), UploadFolders.BaseFolder, UploadFolders.EmailAttachments);
            }
            else
            {
                directoryPath = Path.Combine(fileStorageRoot, UploadFolders.EmailAttachments);
            }
            var filePath = Path.Combine(directoryPath, fileName);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                result = true;
            }
            return result;
        }


        [HttpPost]
        [Route("api/emails/sendEmail")]
        public bool sendEmail(IpsEmail email)
        {
            List<string> attachments = getAttachmentPath(email);
            return _service.sendEmail(email, attachments);
        }

        public List<string> getAttachmentPath(IpsEmail email)
        {
            List<string> result = new List<string>();
            string fileStorageRoot = ConfigurationManager.AppSettings["FileStorageRoot"] ?? string.Empty;
            string filePath;
            foreach (IPSEMailAttachment emailAttachment in email.IPSEMailAttachments)
            {
                if (!string.IsNullOrEmpty(emailAttachment.FileName))
                {
                    if (string.IsNullOrWhiteSpace(fileStorageRoot))
                    {
                        filePath = Path.Combine(HttpContext.Current.Server.MapPath("~"), UploadFolders.BaseFolder, UploadFolders.EmailAttachments, emailAttachment.FileName);
                    }
                    else
                    {
                        filePath = Path.Combine(fileStorageRoot, UploadFolders.EmailAttachments, emailAttachment.FileName);
                    }

                    if (File.Exists(filePath))
                    {
                        result.Add(filePath);
                    }
                }
            }
            return result;
        }
    }
}