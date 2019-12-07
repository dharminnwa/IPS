using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using IPS.Business;
using IPS.Data;
using System.Linq;
using System.Collections.Generic;


namespace IPS.Business.Test
{
    [TestClass]
    public class ProfileServiceTest
    {
        [TestMethod]
        public void creatCopyTest()
        {
            ProfileService serice = new ProfileService();
            IQueryable<Profile> profiles = serice.Get();
            var list = profiles.Where(p => p.Id > 10);
            var profile = list.FirstOrDefault();
            Assert.IsFalse(profile == null);
        }

        [TestMethod]
        public void structureSelectionTest()
        {
            int profileId = 41;
           ProfileService serice = new ProfileService();
          // serice._ipsDataContext.PerformanceGroups.FirstOrDefault().Link_PerformanceGroupSkills.FirstOrDefault().Skill.
        /*   serice._ipsDataContext.Profiles
            .Include("PerformanceGroups.Link_PerformanceGroupSkills.Skill")
            .Include("PerformanceGroups.Link_PerformanceGroupSkills.Questions")
            .Where(p => p.Id == profileId);

           serice._ipsDataContext.PerformanceGroups
            .Include("Link_PerformanceGroupSkills.Skill")
            .Include("Link_PerformanceGroupSkills.Questions")
            .Where(pg => pg.ProfileId == profileId)
            .OrderBy(pg => pg.SeqNo);*/

           List<Link_PerformanceGroupSkills> pgSkills = serice._ipsDataContext.Link_PerformanceGroupSkills
            .Include("PerformanceGroup")
            .Include("Skill")
            .Include("Questions")
            .Where(lps => lps.PerformanceGroup.ProfileId == profileId)
            .ToList();

           Assert.IsFalse(pgSkills == null);
        }
          
    }
}
