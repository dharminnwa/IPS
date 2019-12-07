using IPS.Data;
using System.Linq;
namespace IPS.Business
{
    public interface IKTMedalRuleService
    {
        KTMedalRule Add(KTMedalRule kTMedalRule);
        bool Delete(KTMedalRule kTMedalRule);
        IQueryable<KTMedalRule> Get();
        KTMedalRule GetById(int id);
        bool Update(KTMedalRule kTMedalRule);
        bool IsMedalRuleInUse(int id);
        KTMedalRule CloneMedalRule(int medalRuleId);
        bool IsMedalRuleExist(int medalRuleId);
    }
}
