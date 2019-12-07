using IPS.BusinessModels.Entities;
using IPS.Business.Interfaces;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Configuration;
using System.Net.Mail;

namespace IPS.Business
{
    public class MailNotification : INotification
    {

        private string _pickupDirectory;
        private string _smtpSettings;


        public MailNotification()
        {
            const string dafaultSmtp = "mailSettings/smtp_1";
            this._smtpSettings = dafaultSmtp;
        }

        /// <summary>
        /// Constructor for test purposes for now
        /// </summary>
        /// <param name="pickUpDirectory"></param>
        public MailNotification(string pickUpDirectory, string smtpSettings)
        {
            this._pickupDirectory = pickUpDirectory;
            this._smtpSettings = smtpSettings;
        }

        public void Send(IpsAddress address, IpsMessage message)
        {

            var messageToSend = CreateMessage(address, message);

            using (SmtpClient client = new SmtpClient())
            {
                if (_pickupDirectory != null)
                {
                    client.PickupDirectoryLocation = this._pickupDirectory;
                }
                var settings = (SmtpSection)ConfigurationManager.GetSection(this._smtpSettings);
                messageToSend.From = new MailAddress(settings.From);

                client.UseDefaultCredentials = settings.Network.DefaultCredentials;
                client.Port = settings.Network.Port;
                client.EnableSsl = settings.Network.EnableSsl;
                client.Credentials = new NetworkCredential(settings.Network.UserName, settings.Network.Password);
                client.Host = settings.Network.Host;
                client.Send(messageToSend);
                IpsEmail ipsEmail = new IpsEmail()
                {
                    Subject = messageToSend.Subject,
                    Message = messageToSend.Body,
                    FromAddress = messageToSend.From.Address.ToString(),
                    ToAddress = string.Join(",", messageToSend.To.Select(x => x.Address).ToList()),
                    CCAddress = string.Join(",", messageToSend.CC.Select(x => x.Address).ToList()),
                    SentTime = DateTime.Now,
                };
                IpsEmailService _IpsEmailService = new IpsEmailService();
                _IpsEmailService.Add(ipsEmail);
            }

        }

        private MailMessage CreateMessage(IpsAddress address, IpsMessage message)
        {
            var mailAddresses = GetAddress(address.Address);
            var messageToSend = new MailMessage();

            messageToSend.Subject = message.Subject;
            messageToSend.Body = message.Message;
            messageToSend = PushTo(messageToSend, mailAddresses);
            messageToSend = PushCC(messageToSend);
            messageToSend.IsBodyHtml = true;

            return messageToSend;
        }

        private MailMessage CreateUserMailMessage(IpsAddress toAddress, IpsAddress ccAddress, IpsAddress bccAddress, IpsMessage message, List<string> attachments)
        {
            var toMailAddresses = GetAddress(toAddress.Address);
            var ccMailAddresses = GetAddress(ccAddress.Address);
            var bccMailAddresses = GetAddress(bccAddress.Address);
            var messageToSend = new MailMessage();

            messageToSend.Subject = message.Subject;
            messageToSend.Body = message.Message;
            messageToSend = PushTo(messageToSend, toMailAddresses);
            messageToSend = PushUserMailCC(messageToSend, ccMailAddresses);
            messageToSend = PushUserMailCC(messageToSend, bccMailAddresses);
            messageToSend.IsBodyHtml = true;
            foreach (string attachmentfileName in attachments)
            {
                Attachment attachment = new Attachment(attachmentfileName);
                messageToSend.Attachments.Add(attachment);
            }
            return messageToSend;
        }

        private MailAddressCollection GetAddress(List<string> addresses)
        {
            var result = new MailAddressCollection();

            foreach (var obj in addresses)
            {
                result.Add(obj);
            }

            return result;
        }

        private MailMessage PushTo(MailMessage messageToSend, MailAddressCollection addressCollection)
        {
            foreach (var address in addressCollection)
            {

                messageToSend.To.Add(address);
            }
            return messageToSend;
        }

        private MailMessage PushUserMailCC(MailMessage messageToSend, MailAddressCollection addressCollection)
        {
            foreach (var address in addressCollection)
            {

                messageToSend.CC.Add(address);
            }
            return messageToSend;
        }

        private MailMessage PushUserMailBCC(MailMessage messageToSend, MailAddressCollection addressCollection)
        {
            foreach (var address in addressCollection)
            {

                messageToSend.Bcc.Add(address);
            }
            return messageToSend;
        }

        private MailMessage PushCC(MailMessage messageToSend)
        {
            messageToSend.CC.Add("improvesystems@gmail.com");
            return messageToSend;
        }


        public bool SendUSerEmail(IpsEmail userEmailInfo, List<string> attachments)
        {
            bool result = false;

            IpsAddress emailAddress = new IpsAddress();
            List<string> toAddresses = userEmailInfo.ToAddress.Split(',').ToList();
            foreach (string address in toAddresses)
            {
                emailAddress.Address.Add(address);
            }
            IpsAddress ccemailAddress = new IpsAddress();
            if (!string.IsNullOrEmpty(userEmailInfo.CCAddress))
            {
                List<string> ccAddresses = userEmailInfo.CCAddress.Split(',').ToList();
                foreach (string address in ccAddresses)
                {
                    ccemailAddress.Address.Add(address);
                }
            }

            IpsAddress bccEmailAddress = new IpsAddress();
            if (!string.IsNullOrEmpty(userEmailInfo.BCCAddress))
            {
                List<string> bccAddresses = userEmailInfo.BCCAddress.Split(',').ToList();
                foreach (string address in bccAddresses)
                {
                    bccEmailAddress.Address.Add(address);
                }
            }

            IpsMessage message = new IpsMessage();
            message.Message = userEmailInfo.Message;
            message.Subject = userEmailInfo.Subject;

            var messageToSend = CreateUserMailMessage(emailAddress, ccemailAddress, bccEmailAddress, message, attachments);

            using (SmtpClient client = new SmtpClient())
            {
                if (_pickupDirectory != null)
                {
                    client.PickupDirectoryLocation = this._pickupDirectory;
                }
                var settings = (SmtpSection)ConfigurationManager.GetSection(this._smtpSettings);
                messageToSend.From = new MailAddress(settings.From);

                client.UseDefaultCredentials = settings.Network.DefaultCredentials;
                client.Port = settings.Network.Port;
                client.EnableSsl = settings.Network.EnableSsl;
                client.Credentials = new NetworkCredential(settings.Network.UserName, settings.Network.Password);
                client.Host = settings.Network.Host;
                client.Send(messageToSend);
                userEmailInfo.SentTime = DateTime.Now;
                userEmailInfo.FromAddress = settings.From;
                AuthService _authService = new AuthService();
                userEmailInfo.FromUserId = _authService.GetCurrentUserId();

                var currentUser = _authService.getCurrentUser();
                var realCurrentUser = _authService.GetUserById(currentUser.Id);
                userEmailInfo.FromAddress = realCurrentUser.User.WorkEmail != null ? realCurrentUser.User.WorkEmail : (realCurrentUser.Email != null ? realCurrentUser.Email : settings.From);
                IpsEmailService _IpsEmailService = new IpsEmailService();
                int emailId = _IpsEmailService.Add(userEmailInfo);
                if (emailId > 0)
                {
                    result = true;
                }
            }
            return result;
        }
    }
}
