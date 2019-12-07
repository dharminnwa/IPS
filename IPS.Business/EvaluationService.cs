using IPS.Business.Interfaces;
using IPS.Data;
using System;
using System.Linq;

namespace IPS.Business
{
    public class EvaluationService : BaseService, IEvaluationStatusService
    {
        public void SetEvaluationStatus(int? stageId, int? stageEvolutionId, int participantId, bool isOpen = false)
        {
            var query = _ipsDataContext.EvaluationStatuses
                .Where(x => x.ParticipantId == participantId);
            query = stageEvolutionId.HasValue 
                ? query.Where(x => x.StageEvolutionId == stageEvolutionId) 
                : query.Where(x => x.StageId == stageId);
            var evaluationStatus = query.FirstOrDefault();

            if (evaluationStatus == null)
            {
                var newStatus = new EvaluationStatus
                {
                    ParticipantId = participantId,
                    StageId = stageId,
                    StageEvolutionId = stageEvolutionId,
                    StartedAt = DateTime.Now,
                    EndedAt = DateTime.Now,
                    DurationMinutes = 0,
                    IsOpen = isOpen
                };

                _ipsDataContext.EvaluationStatuses.Add(newStatus);
            }
            else
            {
                evaluationStatus.StartedAt = DateTime.Now;
                evaluationStatus.EndedAt = DateTime.Now;
                evaluationStatus.IsOpen = isOpen;
            }
            _ipsDataContext.SaveChanges();
        }

        public void SetEvaluationStatusInvited(int? stageId, int? stageEvolutionId, int participantId)
        {
            SetEvaluationStatusInvited(stageId, stageEvolutionId, participantId, _ipsDataContext);
        }

        public void SetEvaluationStatusInvited(int? stageId, int? stageEvolutionId, int participantId, IPSData dataContext)
        {
            var query = dataContext.EvaluationStatuses
                .Where(x => x.ParticipantId == participantId);
            query = stageEvolutionId.HasValue 
                ? query.Where(x => x.StageEvolutionId == stageEvolutionId) 
                : query.Where(x => x.StageId == stageId);
            var evaluationStatus = query.FirstOrDefault();

            if (evaluationStatus == null)
            {
                var newStatus = new EvaluationStatus
                {
                    ParticipantId = participantId,
                    StageId = stageId,
                    StageEvolutionId = stageEvolutionId,
                    InvitedAt = DateTime.Now,
                    DurationMinutes = 0,
                    IsOpen = false
                };

                dataContext.EvaluationStatuses.Add(newStatus);
            }
            else
            {
                evaluationStatus.InvitedAt = DateTime.Now;
            }
            dataContext.SaveChanges();
        }
    }
}
