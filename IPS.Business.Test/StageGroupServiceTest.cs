using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using IPS.Business;
using System.Linq;
using IPS.Data;

namespace IPS.BusinessTest
{
    [TestClass]
    public class StageGroupServiceTest
    {
        [TestMethod]
        public void RestartProfileTest()
        {
            StageGroupsService service = new StageGroupsService();
            service.RestartProfile(4, null);
        }

        [TestMethod]
        public void GetAlarmsTest() {
            StagesService serice = new StagesService();
            IQueryable<Stage> stages = serice.Get();
            DateTime date = DateTime.Now;
            var result = stages.Where(s => (s.GreenAlarmTime >= date) || (s.YellowAlarmTime >= date) || (s.RedAlarmTime >= date)).Select(s => s.GreenAlarmTime).ToList();
            Assert.IsFalse(result != null);
        }
    }
}
