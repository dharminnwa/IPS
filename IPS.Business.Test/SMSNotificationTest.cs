using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using IPS.Business;
using IPS.BusinessModels.Entities;
using System.Net.Mail;
using System.Collections.Generic;

namespace IPS.BusinessTest
{
    [TestClass]
    public class SMSNotificationTest
    {
        private SMSNotification _sender;
        private IpsAddress _address;
        private IpsMessage _message;

        [TestMethod]
        public void SendSMS()
        {
            _sender.Send(_address, _message);
        }

        [TestInitialize]
        public void Setup()
        {
            _address = new IpsAddress();
            _address.Address = new List<string> { "+987654321" };
            _address.From = "+123456789031";

            _message = new IpsMessage();
            _message.Message = "testMessage";

            _sender = new SMSNotification();

        }
    }
}
