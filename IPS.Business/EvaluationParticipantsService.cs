using IPS.Business.Interfaces;
using IPS.Data;
using IPS.Data.Enums;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;

namespace IPS.Business
{
    public class EvaluationParticipantsService : BaseService, IEvaluationParticipantsService
    {
        public IQueryable<EvaluationParticipant> GetEvaluationParticipants()
        {
            return _ipsDataContext.EvaluationParticipants.AsQueryable();
        }

        public IQueryable<EvaluationParticipant> GetEvaluationParticipantsWithNoAnswers(int stageGroupId)
        {
            return _ipsDataContext.EvaluationParticipants
                .Include("Answers")
                .Where(p => p.StageGroupId == stageGroupId && p.EvaluationRoleId == (int)EvaluationRoleEnum.Participant && p.IsSelfEvaluation == true && p.IsLocked == false && p.Answers.Count == 0)
                .AsQueryable();
        }

        public IQueryable<EvaluationParticipant> GetEvaluationParticipantsWithNoAnswers(int stageGroupId, int stageId)
        {
            List<EvaluationParticipant> participants = _ipsDataContext.EvaluationParticipants
                .Include("Answers")
                .Where(p => p.StageGroupId == stageGroupId && p.EvaluationRoleId == (int)EvaluationRoleEnum.Participant && p.IsSelfEvaluation == true && p.IsLocked == false)
                .AsNoTracking()
                .ToList();
            List<EvaluationParticipant> result = new List<EvaluationParticipant>();
            foreach (var ep in participants)
            {
                if (ep.Answers == null || ep.Answers.Where(a => a.StageId == stageId).Count() == 0)
                    result.Add(ep);
            }

            return result.AsQueryable();
        }

        public IQueryable<EvaluationParticipant> GetEvaluationEvaluatorsWithNoAnswers(int stageGroupId)
        {
            return _ipsDataContext.EvaluationParticipants
                .Include("Answers")
                .Where(p => p.StageGroupId == stageGroupId && p.EvaluationRoleId == (int)EvaluationRoleEnum.Evaluator && p.IsLocked == false && p.Answers.Count == 0)
                .AsQueryable();
        }

        public IQueryable<EvaluationParticipant> GetEvaluationEvaluatorsWithNoAnswers(int stageGroupId, int stageId)
        {
            List<EvaluationParticipant> participants = _ipsDataContext.EvaluationParticipants
                .Include("Answers")
                .Where(p => p.StageGroupId == stageGroupId && p.EvaluationRoleId == (int)EvaluationRoleEnum.Evaluator && p.IsLocked == false)
                .AsNoTracking()
                .ToList();
            List<EvaluationParticipant> result = new List<EvaluationParticipant>();
            foreach (var ep in participants)
            {
                if (ep.Answers == null || ep.Answers.Where(a => a.StageId == stageId).Count() == 0)
                    result.Add(ep);
            }

            return result.AsQueryable();

        }

        public IQueryable<EvaluationParticipant> GetParticipantEvaluators(int stageGroupId, int participantId)
        {
            return _ipsDataContext.EvaluationParticipants
                .Where(p => p.StageGroupId == stageGroupId && p.EvaluateeId == participantId && p.IsLocked == false)
                .AsQueryable();
        }

        public IQueryable<EvaluationParticipant> GetEvaluationParticipantsById(int id)
        {
            return _ipsDataContext.EvaluationParticipants.Where(er => er.Id == id).AsQueryable();
        }

        public EvaluationParticipant Add(EvaluationParticipant evaluationParticipant)
        {
            _ipsDataContext.EvaluationParticipants.Add(evaluationParticipant);
            _ipsDataContext.SaveChanges();
            return evaluationParticipant;
        }

        /*
        public bool Update(NotificationTemplate notificationTemplate)
        {
            var original = _ipsDataContext.NotificationTemplates.Find(notificationTemplate.Id);

            if (original != null)
            {
                notificationTemplate.Stages = null;
                notificationTemplate.Stages1 = null;
                notificationTemplate.Stages2 = null;
                notificationTemplate.Stages3 = null;
                notificationTemplate.Stages4 = null;
                notificationTemplate.Stages5 = null;
                notificationTemplate.Stages6 = null;
                notificationTemplate.Stages7 = null;
                notificationTemplate.Stages8 = null;
                notificationTemplate.Stages9 = null;
                notificationTemplate.Stages10 = null;
                notificationTemplate.Stages11 = null;
                notificationTemplate.Stages12 = null;
                notificationTemplate.Stages13 = null;
                notificationTemplate.Stages14 = null;
                notificationTemplate.Stages15 = null;

                _ipsDataContext.Entry(original).CurrentValues.SetValues(notificationTemplate);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }*/

        public string Delete(EvaluationParticipant evaluationParticipant)
        {
            try
            {
                _ipsDataContext.EvaluationParticipants.Remove(evaluationParticipant);
                var result = _ipsDataContext.SaveChanges();
                return "OK";
            }
            catch(DbUpdateException e)
            {
                return e.InnerException.InnerException.Message;
            }
        }
    }
}
