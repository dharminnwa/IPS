using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using IPS.Business;
[assembly: log4net.Config.XmlConfigurator(Watch = true)]
namespace IPS.BusinessTest
{
    /// <summary>
    /// Test are for debuging functionality, no actual unit testing
    /// </summary>
    [TestClass]
    public class NotificationServiceTest
    {
        private NotificationService _service;

        [TestInitialize]
        public void Setup()
        {
            log4net.Config.XmlConfigurator.Configure();
            _service = new NotificationService();
        }

        [TestMethod]
        public void ShouldNotifyTest()
        {
            //_service.Notify(4, 1);
            //_service.Notify(3, 4, 1);
            //int[] participants = { 1, 2, 5 };
            //_service.Notify(participants, 4, 1);
            //_service.SendStartNotification(4);
        }

        [TestMethod]
        public void ShouldSendStartNotification()
        {
            //_service.SendStartNotification(57);
        }

        [TestMethod]
        public void ShouldCorrectlyParseTemplate()
        {
            //_service.Notify(3, 4, 38);
        }
    }
}
