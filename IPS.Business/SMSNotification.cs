using IPS.BusinessModels.Entities;
using IPS.Business.Exceptions;
using IPS.Business.Interfaces;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Twilio;

namespace IPS.Business
{
    public class SMSNotification : INotification
    {
        string AccountSid = ConfigurationManager.AppSettings.Get("smsAccountSid");
        string AuthToken = ConfigurationManager.AppSettings.Get("smsAuthToken");

        public void Send(IpsAddress address, IpsMessage message)
        {
            var twilio = new TwilioRestClient(AccountSid, AuthToken);

            foreach (var recipient in address.Address)
            {
                var messageSMS = twilio.SendMessage(address.From, recipient, message.Message, "");

                if (messageSMS.RestException != null)
                {
                    throw new TwilioException(messageSMS.RestException);
                }
            }
        }
    }
}
