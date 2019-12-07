using IPS.BusinessModels.EmailModel;
using IPS.BusinessModels.UserModel;
using IPS.Data;
using MailKit;
using MailKit.Net.Imap;
using MailKit.Search;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class GmailUserService
    {
        public bool isGmailValid(IpsGmailUserModel ipsGmailUserModel)
        {
            bool result = false;
            using (var client = new ImapClient())
            {
                // For demo-purposes, accept all SSL certificates
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                client.Connect("imap.gmail.com", 993, true);
                if (client.IsConnected)
                {
                    try
                    {
                        client.Authenticate(ipsGmailUserModel.Email, ipsGmailUserModel.Password);
                        if (client.IsAuthenticated)
                        {
                            result = true;
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                    client.Disconnect(true);
                }
            }
            return result;
        }
        public List<IpsEmailModel> GetMails(string email, string password, string userEmail)
        {
            List<IpsEmailModel> result = new List<IpsEmailModel>();
            using (var client = new ImapClient())
            {
                // For demo-purposes, accept all SSL certificates
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                client.Connect("imap.gmail.com", 993, true);

                client.Authenticate(email, password);

                // The Inbox folder is always available on all IMAP servers...
                if (client.IsAuthenticated)
                {
                    var inbox = client.Inbox;
                    inbox.Open(FolderAccess.ReadOnly);

                    string fromEmail1 = ConfigurationManager.AppSettings.Get("FromEmail1");
                    string fromEmail2 = ConfigurationManager.AppSettings.Get("FromEmail2");



                    IpsEmailService ipsEmailService = new IpsEmailService();
                    List<IpsUserModel> ipsUserModels = ipsEmailService.GetUsersByEmail();
                    foreach (IpsUserModel userModel in ipsUserModels)
                    {
                        if (!(userModel.Email == userEmail || userModel.Email == fromEmail1 || userModel.Email == fromEmail2))
                        {
                            if (!string.IsNullOrEmpty(userModel.Email))
                            {
                                var filter = inbox.Search(SearchQuery.FromContains(userModel.Email)).ToList();
                                for (int i = 0; i < filter.Count; i++)
                                {
                                    var message = inbox.GetMessage(filter[i]);
                                    List<string> bccAddresses = new List<string>();
                                    List<string> ccAddresses = new List<string>();
                                    List<string> toAddresses = new List<string>();
                                    List<string> fromAddresses = new List<string>();

                                    foreach (InternetAddress bcc in message.Bcc)
                                    {
                                        bccAddresses.Add(bcc.ToString());
                                    }
                                    foreach (InternetAddress cc in message.Cc)
                                    {
                                        ccAddresses.Add(cc.ToString());
                                    }

                                    foreach (InternetAddress to in message.To)
                                    {
                                        toAddresses.Add(to.ToString());
                                    }

                                    foreach (InternetAddress from in message.From)
                                    {
                                        fromAddresses.Add(((MimeKit.MailboxAddress)from).Address);
                                    }
                                    IpsEmailModel ipsEmailModel = new IpsEmailModel()
                                    {
                                        BCCAddress = string.Join(";", bccAddresses.ToArray()),
                                        CCAddress = string.Join(";", ccAddresses.ToArray()),
                                        FromAddress = string.Join(";", fromAddresses.ToArray()),
                                        HasAttachment = message.Attachments.Count() > 0 ? true : false,
                                        Message = message.HtmlBody.ToString(),
                                        SentTime = message.Date.DateTime,
                                        ToAddress = string.Join(";", toAddresses.ToArray()),
                                        Subject = message.Subject.ToString(),
                                        IsReceivedEmail = true,
                                        GmailId = message.MessageId,
                                    };
                                    result.Add(ipsEmailModel);
                                }
                            }
                        }
                    }


                    if ((!string.IsNullOrEmpty(fromEmail1)) && (!string.IsNullOrEmpty(fromEmail2)))
                    {
                        var filter = inbox.Search(SearchQuery.Or(SearchQuery.FromContains(fromEmail1), SearchQuery.FromContains(fromEmail2))).ToList();
                        for (int i = 0; i < filter.Count; i++)
                        {
                            var message = inbox.GetMessage(filter[i]);
                            List<string> bccAddresses = new List<string>();
                            List<string> ccAddresses = new List<string>();
                            List<string> toAddresses = new List<string>();
                            List<string> fromAddresses = new List<string>();

                            foreach (InternetAddress bcc in message.Bcc)
                            {
                                bccAddresses.Add(bcc.ToString());
                            }
                            foreach (InternetAddress cc in message.Cc)
                            {
                                ccAddresses.Add(cc.ToString());
                            }

                            foreach (InternetAddress to in message.To)
                            {
                                toAddresses.Add(to.ToString());
                            }

                            foreach (InternetAddress from in message.From)
                            {
                                fromAddresses.Add(((MimeKit.MailboxAddress)from).Address);
                            }
                            IpsEmailModel ipsEmailModel = new IpsEmailModel()
                            {
                                BCCAddress = string.Join(";", bccAddresses.ToArray()),
                                CCAddress = string.Join(";", ccAddresses.ToArray()),
                                FromAddress = string.Join(";", fromAddresses.ToArray()),
                                HasAttachment = message.Attachments.Count() > 0 ? true : false,
                                Message = message.HtmlBody.ToString(),
                                SentTime = message.Date.DateTime,
                                ToAddress = string.Join(";", toAddresses.ToArray()),
                                Subject = message.Subject.ToString(),
                                IsReceivedEmail = true,
                                GmailId = message.MessageId,
                            };
                            result.Add(ipsEmailModel);
                        }
                    }
                }
                client.Disconnect(true);
            }
            return result;
        }

        public List<IpsEmailModel> GetSentMails(string email, string password, string userEmail)
        {
            List<IpsEmailModel> result = new List<IpsEmailModel>();
            using (var client = new ImapClient())
            {
                // For demo-purposes, accept all SSL certificates
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                client.Connect("imap.gmail.com", 993, true);

                client.Authenticate(email, password);

                // The Inbox folder is always available on all IMAP servers...
                if (client.IsAuthenticated)
                {
                    var inbox = client.GetFolder(SpecialFolder.Sent);
                    inbox.Open(FolderAccess.ReadOnly);

                    string fromEmail1 = ConfigurationManager.AppSettings.Get("FromEmail1");
                    string fromEmail2 = ConfigurationManager.AppSettings.Get("FromEmail2");

                    IpsEmailService ipsEmailService = new IpsEmailService();
                    List<IpsUserModel> ipsUserModels = ipsEmailService.GetUsersByEmail();
                    foreach (IpsUserModel userModel in ipsUserModels)
                    {
                        if (!(userModel.Email == userEmail || userModel.Email == fromEmail1 || userModel.Email == fromEmail2))
                        {
                            if (!string.IsNullOrEmpty(userModel.Email))
                            {
                                var filter = inbox.Search(SearchQuery.FromContains(userModel.Email)).ToList();
                                for (int i = 0; i < filter.Count; i++)
                                {
                                    var message = inbox.GetMessage(filter[i]);
                                    List<string> bccAddresses = new List<string>();
                                    List<string> ccAddresses = new List<string>();
                                    List<string> toAddresses = new List<string>();
                                    List<string> fromAddresses = new List<string>();

                                    foreach (InternetAddress bcc in message.Bcc)
                                    {
                                        bccAddresses.Add(bcc.ToString());
                                    }
                                    foreach (InternetAddress cc in message.Cc)
                                    {
                                        ccAddresses.Add(cc.ToString());
                                    }

                                    foreach (InternetAddress to in message.To)
                                    {
                                        toAddresses.Add(to.ToString());
                                    }

                                    foreach (InternetAddress from in message.From)
                                    {
                                        fromAddresses.Add(((MimeKit.MailboxAddress)from).Address);
                                    }
                                    IpsEmailModel ipsEmailModel = new IpsEmailModel()
                                    {
                                        BCCAddress = string.Join(";", bccAddresses.ToArray()),
                                        CCAddress = string.Join(";", ccAddresses.ToArray()),
                                        FromAddress = string.Join(";", fromAddresses.ToArray()),
                                        HasAttachment = message.Attachments.Count() > 0 ? true : false,
                                        Message = message.HtmlBody.ToString(),
                                        SentTime = message.Date.DateTime,
                                        ToAddress = string.Join(";", toAddresses.ToArray()),
                                        Subject = message.Subject.ToString(),
                                        IsReceivedEmail = true,
                                        GmailId = message.MessageId,
                                    };
                                    result.Add(ipsEmailModel);
                                }
                            }
                        }
                    }

                    if ((!string.IsNullOrEmpty(fromEmail1)) && (!string.IsNullOrEmpty(fromEmail2)))
                    {
                        var filter = inbox.Search(SearchQuery.Or(SearchQuery.ToContains(fromEmail1), SearchQuery.ToContains(fromEmail2))).ToList();
                        for (int i = 0; i < filter.Count; i++)
                        {
                            var message = inbox.GetMessage(filter[i]);
                            List<string> bccAddresses = new List<string>();
                            List<string> ccAddresses = new List<string>();
                            List<string> toAddresses = new List<string>();
                            List<string> fromAddresses = new List<string>();

                            foreach (InternetAddress bcc in message.Bcc)
                            {
                                bccAddresses.Add(bcc.ToString());
                            }
                            foreach (InternetAddress cc in message.Cc)
                            {
                                ccAddresses.Add(cc.ToString());
                            }

                            foreach (InternetAddress to in message.To)
                            {
                                toAddresses.Add(to.ToString());
                            }

                            foreach (InternetAddress from in message.From)
                            {
                                fromAddresses.Add(((MimeKit.MailboxAddress)from).Address);
                            }
                            IpsEmailModel ipsEmailModel = new IpsEmailModel()
                            {
                                BCCAddress = string.Join(";", bccAddresses.ToArray()),
                                CCAddress = string.Join(";", ccAddresses.ToArray()),
                                FromAddress = string.Join(";", fromAddresses.ToArray()),
                                HasAttachment = message.Attachments.Count() > 0 ? true : false,
                                Message = message.HtmlBody.ToString(),
                                SentTime = message.Date.DateTime,
                                ToAddress = string.Join(";", toAddresses.ToArray()),
                                Subject = message.Subject.ToString(),
                                IsReceivedEmail = true,
                                GmailId = message.MessageId,
                            };
                            result.Add(ipsEmailModel);
                        }
                    }
                }
                client.Disconnect(true);
            }
            return result;
        }

        public IpsEmailModel GetGmailById(IpsGmailUserModel ipsGmailUserModel, string storagePath)
        {
            IpsEmailModel result = new IpsEmailModel();
            using (var client = new ImapClient())
            {
                // For demo-purposes, accept all SSL certificates
                client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                client.Connect("imap.gmail.com", 993, true);
                if (client.IsConnected)
                {
                    client.Authenticate(ipsGmailUserModel.Email, ipsGmailUserModel.Password);
                    if (client.IsAuthenticated)
                    {
                        // The Inbox folder is always available on all IMAP servers...
                        if (ipsGmailUserModel.IsSentMail)
                        {
                            var inbox = client.GetFolder(SpecialFolder.Sent);
                            inbox.Open(FolderAccess.ReadOnly);

                            var filter = inbox.Search(SearchQuery.HeaderContains("Message-ID", ipsGmailUserModel.MessageId)).FirstOrDefault();
                            if (filter.Id > 0)
                            {
                                var message = inbox.GetMessage(filter);
                                List<string> bccAddresses = new List<string>();
                                List<string> ccAddresses = new List<string>();
                                List<string> toAddresses = new List<string>();
                                List<string> fromAddresses = new List<string>();

                                foreach (InternetAddress bcc in message.Bcc)
                                {
                                    bccAddresses.Add(bcc.ToString());
                                }
                                foreach (InternetAddress cc in message.Cc)
                                {
                                    ccAddresses.Add(cc.ToString());
                                }
                                foreach (InternetAddress to in message.To)
                                {
                                    toAddresses.Add(to.ToString());
                                }
                                foreach (InternetAddress from in message.From)
                                {
                                    fromAddresses.Add(((MimeKit.MailboxAddress)from).Address);
                                }
                                List<IPSEMailAttachment> ipsEMailAttachments = new List<IPSEMailAttachment>();
                                foreach (var attachment in message.Attachments)
                                {
                                    var fileName = attachment.ContentDisposition?.FileName ?? attachment.ContentType.Name;
                                    ipsEMailAttachments.Add(new IPSEMailAttachment()
                                    {
                                        FileName = fileName,
                                    });

                                    string filePath = Path.Combine(storagePath, fileName);
                                    if (!Directory.Exists(storagePath))
                                    {
                                        Directory.CreateDirectory(storagePath);
                                    }
                                    using (var stream = File.Create(filePath))
                                    {
                                        if (attachment is MessagePart)
                                        {
                                            var part = (MessagePart)attachment;

                                            part.Message.WriteTo(stream);
                                        }
                                        else
                                        {
                                            var part = (MimePart)attachment;

                                            part.Content.DecodeTo(stream);
                                        }
                                    }
                                }

                                result = new IpsEmailModel()
                                {
                                    BCCAddress = string.Join(";", bccAddresses.ToArray()),
                                    CCAddress = string.Join(";", ccAddresses.ToArray()),
                                    FromAddress = string.Join(";", fromAddresses.ToArray()),
                                    HasAttachment = message.Attachments.Count() > 0 ? true : false,
                                    Message = message.HtmlBody.ToString(),
                                    SentTime = message.Date.DateTime,
                                    ToAddress = string.Join(";", toAddresses.ToArray()),
                                    Subject = message.Subject.ToString(),
                                    IsReceivedEmail = true,
                                    GmailId = message.MessageId,
                                    IPSEMailAttachments = ipsEMailAttachments
                                };

                            }
                        }
                        else
                        {
                            var inbox = client.Inbox;
                            inbox.Open(FolderAccess.ReadOnly);

                            var filter = inbox.Search(SearchQuery.HeaderContains("Message-ID", ipsGmailUserModel.MessageId)).FirstOrDefault();
                            if (filter.Id > 0)
                            {
                                var message = inbox.GetMessage(filter);
                                List<string> bccAddresses = new List<string>();
                                List<string> ccAddresses = new List<string>();
                                List<string> toAddresses = new List<string>();
                                List<string> fromAddresses = new List<string>();

                                foreach (InternetAddress bcc in message.Bcc)
                                {
                                    bccAddresses.Add(bcc.ToString());
                                }
                                foreach (InternetAddress cc in message.Cc)
                                {
                                    ccAddresses.Add(cc.ToString());
                                }
                                foreach (InternetAddress to in message.To)
                                {
                                    toAddresses.Add(to.ToString());
                                }
                                foreach (InternetAddress from in message.From)
                                {
                                    fromAddresses.Add(((MimeKit.MailboxAddress)from).Address);
                                }
                                List<IPSEMailAttachment> ipsEMailAttachments = new List<IPSEMailAttachment>();
                                foreach (var attachment in message.Attachments)
                                {
                                    var fileName = attachment.ContentDisposition?.FileName ?? attachment.ContentType.Name;
                                    ipsEMailAttachments.Add(new IPSEMailAttachment()
                                    {
                                        FileName = fileName,
                                    });

                                    string filePath = Path.Combine(storagePath, fileName);
                                    if (!Directory.Exists(storagePath))
                                    {
                                        Directory.CreateDirectory(storagePath);
                                    }
                                    using (var stream = File.Create(filePath))
                                    {
                                        if (attachment is MessagePart)
                                        {
                                            var part = (MessagePart)attachment;

                                            part.Message.WriteTo(stream);
                                        }
                                        else
                                        {
                                            var part = (MimePart)attachment;

                                            part.Content.DecodeTo(stream);
                                        }
                                    }
                                }

                                result = new IpsEmailModel()
                                {
                                    BCCAddress = string.Join(";", bccAddresses.ToArray()),
                                    CCAddress = string.Join(";", ccAddresses.ToArray()),
                                    FromAddress = string.Join(";", fromAddresses.ToArray()),
                                    HasAttachment = message.Attachments.Count() > 0 ? true : false,
                                    Message = message.HtmlBody.ToString(),
                                    SentTime = message.Date.DateTime,
                                    ToAddress = string.Join(";", toAddresses.ToArray()),
                                    Subject = message.Subject.ToString(),
                                    IsReceivedEmail = true,
                                    GmailId = message.MessageId,
                                    IPSEMailAttachments = ipsEMailAttachments
                                };

                            }
                        }

                        client.Disconnect(true);
                    }
                }
            }
            return result;

        }

        private static byte[] FromBase64ForUrlString(string base64ForUrlInput)
        {
            int padChars = (base64ForUrlInput.Length % 4) == 0 ? 0 : (4 - (base64ForUrlInput.Length % 4));
            StringBuilder result = new StringBuilder(base64ForUrlInput, base64ForUrlInput.Length + padChars);
            result.Append(String.Empty.PadRight(padChars, '='));
            result.Replace('-', '+');
            result.Replace('_', '/');
            return Convert.FromBase64String(result.ToString());
        }
    }
}
