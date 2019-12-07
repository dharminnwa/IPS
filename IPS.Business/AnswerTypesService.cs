using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class AnswerTypesService : IPS.Business.IAnswerTypesService
    {
        IPSData connection = null;

        public AnswerTypesService()
        {
            connection = DataContextFactory.GetIPSContext();
        }

        public IQueryable<AnswerType> Get()
        {
            return connection.AnswerTypes.AsNoTracking().AsQueryable();
        }

        public IQueryable<AnswerType> GetById(int id)
        {
            return connection.AnswerTypes.Where(at => at.Id == id).AsQueryable();
        }

        public AnswerType Add(AnswerType answerType)
        {
            connection.AnswerTypes.Add(answerType);
            connection.SaveChanges();
            return answerType;
        }


        /*
          public IQueryable<Profile> Get()
        {
            return connection.Profiles.AsNoTracking().AsQueryable();
        }

        public IQueryable<Profile> GetById(int id)
        {
           return connection.Profiles.Where(p => p.Id == id).AsQueryable();
        }

        public Profile Add(Profile profile)
        {
            connection.Profiles.Add(profile);
            connection.SaveChanges();
            return profile;
        }
         * */

        public bool Update(AnswerType answerType)
        {
            var original = connection.AnswerTypes.Find(answerType.Id);

            if (original != null)
            {
                connection.Entry(original).CurrentValues.SetValues(answerType);
                connection.SaveChanges();
            }

            return true;
        }

        public bool Delete(AnswerType answerType)
        {
            connection.AnswerTypes.Remove(answerType);
            connection.SaveChangesAsync();

            return true;
        }
    }
}
