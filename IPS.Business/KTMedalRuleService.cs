using IPS.Data;
using System;
using System.Linq;

namespace IPS.Business
{
    public class KTMedalRuleService : BaseService, IKTMedalRuleService
    {
       public IQueryable<KTMedalRule> Get()
        {
            return _ipsDataContext.KTMedalRules.AsNoTracking().AsQueryable();
        }

        public KTMedalRule GetById(int id)
        {
            return _ipsDataContext.KTMedalRules.Where(i => i.Id == id).FirstOrDefault();
        }

        public KTMedalRule Add(KTMedalRule kTMedalRule)
        {
            _ipsDataContext.KTMedalRules.Add(kTMedalRule);
            _ipsDataContext.SaveChanges();
            return kTMedalRule;
        }

        public bool Update(KTMedalRule kTMedalRule)
        {
            var original = _ipsDataContext.KTMedalRules.Find(kTMedalRule.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(kTMedalRule);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool IsMedalRuleInUse(int id)
        {
            return _ipsDataContext.Profiles.Any(x => x.MedalRuleId == id);
        }

        public bool Delete(KTMedalRule kTMedalRule)
        {
            _ipsDataContext.KTMedalRules.Remove(kTMedalRule);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }

        public string NewCloneName(string oldName)
        {
            string copyName = oldName + " clone";
            if (_ipsDataContext.KTMedalRules.Any(p => p.Name == copyName))
            {
                int i = 1;
                while (true)
                {
                    if (!_ipsDataContext.Profiles.Any(p => p.Name == copyName + i.ToString()))
                    {
                        copyName = copyName + i;
                        break;
                    }
                    i++;
                }
            }
            return copyName;
        }

        public KTMedalRule CloneMedalRule(int medalRuleId)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    KTMedalRule medalRuleSource = _ipsDataContext.KTMedalRules.FirstOrDefault(p => p.Id == medalRuleId);

                    KTMedalRule medalRuleCopy = new KTMedalRule();

                    string copyName = NewCloneName(medalRuleSource.Name);

                    medalRuleCopy.Name = copyName;
                    medalRuleCopy.BronzeStart = medalRuleSource.BronzeStart;
                    medalRuleCopy.BronzeEnd = medalRuleSource.BronzeEnd;
                    medalRuleCopy.SilverEnd = medalRuleSource.SilverEnd;

                    _ipsDataContext.KTMedalRules.Add(medalRuleCopy);

                    _ipsDataContext.SaveChanges();

                    dbContextTransaction.Commit();

                    return medalRuleCopy;
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }
        }

        public bool IsMedalRuleExist(int medalRuleId)
        {
            return _ipsDataContext.KTMedalRules.Any(m => m.Id == medalRuleId);
        }
    }
}
