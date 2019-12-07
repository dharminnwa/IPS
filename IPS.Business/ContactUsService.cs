using System.Globalization;
using IPS.BusinessModels.Entities;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Threading.Tasks;
using System.Configuration;
using System.Net;
using System.Net.Mail;


namespace IPS.Business
{
    public class ContactUsService : BaseService, IPS.Business.IContactUsService
    {
        public ContactU Add(ContactU ContactU)
        {
            _ipsDataContext.ContactUs.Add(ContactU);
            _ipsDataContext.SaveChanges();
            SendEmailNotification(ContactU.Email, ContactU.Name);
            return ContactU;
        }
        private void SendEmailNotification(string Email, string Name)
        {


            using (System.Net.Mail.SmtpClient client = new System.Net.Mail.SmtpClient())
            {
                var emails = new List<string>();
                emails.Add(Email);
                var messageToSend = CreateMessage(new IpsAddress() { Address = emails }, new IpsMessage() { Message = "Thanks for submitting ContactUs", Subject = "Thanks for posting Contact Us" });
                var settings = (System.Net.Configuration.SmtpSection)ConfigurationManager.GetSection("mailSettings/smtp_1");
                messageToSend.From = new System.Net.Mail.MailAddress(settings.From);
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
        private MailMessage PushTo(MailMessage messageToSend, MailAddressCollection addressCollection)
        {
            foreach (var address in addressCollection)
            {
                messageToSend.To.Add(address);
            }
            return messageToSend;
        }
        private MailMessage PushCC(MailMessage messageToSend)
        {
            messageToSend.CC.Add("improvesystems@gmail.com");
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
        public ContactU GetContact()
        {
            return new ContactU();
        }
    }

}