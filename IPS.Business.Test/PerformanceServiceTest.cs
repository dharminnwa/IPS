using System;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using IPS.Business;
using IPS.BusinessModels.Entities;
using System.Collections.Generic;
using IPS.Data;
using IPS.BusinessModels.Enums;

namespace IPS.BusinessTest
{
    [TestClass]
    public class PerformanceServiceTest
    {
        [TestMethod]
        public void GetPeriods()
        {
            PerformanceService service = new PerformanceService();
            //List<IpsScorecardPeriod> periods = service.GetProfileEvaluationPeriods(41, 216);
            List<IpsScorecardPeriod> periods = service.GetProfileEvaluationPeriods(60, 236);
            Assert.IsFalse(periods.Count > 0);
        }

        [TestMethod]
        public void GetUserProfiles()
        {
            PerformanceService service = new PerformanceService();
            //IpsUserProfiles profiles = service.GetUserProfiles(1122);


            DateTime todayDate = DateTime.Today;
            List<IpsUserProfile> activeProfiles = new List<IpsUserProfile>();
            List<IpsUserProfile> completedProfiles = new List<IpsUserProfile>();
            List<IpsUserProfile> historyProfiles = new List<IpsUserProfile>();

            var _ipsDataContext = service._ipsDataContext;

            //IpsUserProfiles profiles = service.GetUserProfiles(1073);
            //Assert.IsFalse(profiles != null);
        }

        [TestMethod]
        public void GetUserScorecardTest()
        {
            PerformanceService service = new PerformanceService();
            List<int> ids = new List<int>() {246 };
            List<IpsQuestionInfo> questions =  service.GetParticipantProfileScorecard(77, ids);
            Assert.IsFalse(questions != null);
        }

        [TestMethod]
        public void GetPreviousEvaluationScoresTest()
        {
            PerformanceService service = new PerformanceService();
            service.GetPreviousEvaluationScores(5, 135);
        }

        [TestMethod]
        public void GetEvaluationAggregatedScoresTest()   
        {
            PerformanceService service = new PerformanceService();
            service.GetEvaluationAggregatedScores(72, 217);
        }

        [TestMethod]
        public void GetParticipantEvaluatorsTest()
        {
            PerformanceService service = new PerformanceService();
            List<IpsParticipantInfo> evaluators = service.GetParticipantEvaluators(77, 246);
            Assert.IsFalse(evaluators != null);
        }

        [TestMethod]
        public void GetParticipantProfileScorecardByEvaluateeTest()
        {
            PerformanceService service = new PerformanceService();
            List<IpsQuestionInfo> questions =  service.GetParticipantProfileScorecardByEvaluatee(72, 229, 217);
            Assert.IsFalse(questions != null);
        }

        [TestMethod]
        public void GetProfileScoreCardsTest()
        {
            PerformanceService service = new PerformanceService();
            DateTime date = new DateTime(2015, 06, 19); // PeriodDate = {6/19/2015 10:06:00 AM} 236
            IpsProfileScorecard scorecard = service.GetProfileScoreCards(60, 228, null, date);
            Assert.IsTrue(scorecard != null);
        }

        [TestMethod]
        public void GetEvaluatedProfilesTest()
        {
            PerformanceService service = new PerformanceService();
            var profiles = service.GetEvaluatedProfiles();
            Assert.IsTrue(profiles != null);
        }
    }
}
