using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using IPS.Business;
using IPS.BusinessModels.Entities;
using System.Net.Mail;
using System.IO;
using System.Collections.Generic;

namespace IPS.BusinessTest
{
    [TestClass]
    public class EmailSenderTest
    {
        private MailNotification _sender;
        private IpsAddress _address;
        private IpsMessage _message;

        [TestMethod]
        public void SendEmail()
        {
            _sender.Send(_address, _message);
        }

        [TestInitialize]
        public void Setup()
        {
            _address = new IpsAddress();
            _address.Address = new List<string> { "yamshikov3@gmail.com" };

            _message = new IpsMessage();
            _message.Message = "testMessage";
            _message.Subject = "testSubject";

            _sender = new MailNotification();

        }
    }
}
