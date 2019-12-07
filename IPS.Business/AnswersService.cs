using System.Collections.Generic;
using IPS.Data;
using System.Data.Entity.Infrastructure;
using System.Linq;
using IPS.BusinessModels.Entities;
using IPS.BusinessModels.AnswerModel;
using IPS.BusinessModels.TrainingDiaryModels;
using IPS.BusinessModels.ProfileModels;

namespace IPS.Business
{
    public class AnswersService : IPS.Business.IAnswersService
    {
        IPSData connection = null;

        public AnswersService()
        {
            connection = DataContextFactory.GetIPSContext();
        }

        public IQueryable<Answer> GetAnswers()
        {
            return connection.Answers.AsNoTracking().AsQueryable();
        }

        public IQueryable<Answer> GetAnswerById(int id)
        {
            return connection.Answers.Where(a => a.Id == id).AsQueryable();
        }

        public Answer[] AddAnswer(Answer[] answers)
        {
            using (var dbContextTransaction = connection.Database.BeginTransaction())
            {
                try
                {
                    foreach (Answer answer in answers)
                    {
                        answer.Stage = null;
                        answer.EvaluationParticipant = null;
                        answer.Question = null;

                        var aDB = connection.Answers.Where(a => a.QuestionId == answer.QuestionId && a.StageId == answer.StageId && a.ParticipantId == answer.ParticipantId).FirstOrDefault();

                        if (aDB != null)
                        {
                            aDB.Answer1 = answer.Answer1;
                            aDB.Comment = answer.Comment;
                            aDB.IsCorrect = answer.IsCorrect;
                            aDB.KPIType = answer.KPIType;
                            aDB.IsCorrect = answer.IsCorrect;
                        }
                        else
                        {
                            aDB = connection.Answers.Local.Where(a => a.QuestionId == answer.QuestionId && a.StageId == answer.StageId && a.ParticipantId == answer.ParticipantId).FirstOrDefault();
                            if (aDB != null)
                            {
                                aDB.Answer1 = answer.Answer1;
                                aDB.Comment = answer.Comment;
                                aDB.IsCorrect = answer.IsCorrect;
                                aDB.KPIType = answer.KPIType;
                                aDB.IsCorrect = answer.IsCorrect;
                            }
                            else
                            {
                                connection.Answers.Add(answer);
                            }
                        }
                    }
                    connection.SaveChanges();
                    dbContextTransaction.Commit();
                    return answers;
                }
                catch
                {
                    dbContextTransaction.Rollback();
                    throw;
                }
            }
        }

        public string UpdateAnswer(Answer[] answers)
        {
            try
            {
                foreach (Answer answer in answers)
                {
                    var original = connection.Answers.Find(answer.Id);

                    if (original != null)
                    {
                        connection.Entry(original).CurrentValues.SetValues(answer);

                    }

                }
                connection.SaveChanges();
                return "OK";
            }
            catch (DbUpdateException e)
            {
                return e.InnerException.InnerException.Message;
            }
        }

        public List<IpsAnswerModel> GetAnswersByParticipantId(int participantId,int stageId)
        {
            return connection.Answers.Where(x => x.ParticipantId == participantId && x.StageId == stageId).Select(x => new IpsAnswerModel()
            {
                Answer1 = x.Answer1,
                Comment = x.Comment,
                EvaluationParticipant = new IpsEvaluationParticipant()
                {
                    EvaluateeId = x.EvaluationParticipant.EvaluateeId,
                    EvaluationRoleId = x.EvaluationParticipant.EvaluationRoleId,
                    Id = x.EvaluationParticipant.Id,
                    IsLocked = x.EvaluationParticipant.IsLocked,
                    IsScoreManager = x.EvaluationParticipant.IsScoreManager,
                    IsSelfEvaluation = x.EvaluationParticipant.IsSelfEvaluation,
                    StageGroupId = x.EvaluationParticipant.StageGroupId,
                },
                Id = x.Id,
                IsCorrect = x.IsCorrect,
                KPIType = x.KPIType,
                KPIType1 = new IpsKpiTypeModel()
                {
                    Id = x.KPIType1.Id,
                    Name = x.KPIType1.Name
                },
                ParticipantId = x.ParticipantId,
                QuestionId = x.QuestionId,
                StageId = x.StageId,
                Question = x.Question != null ? new IpsQuestionModel()
                {
                    AnswerTypeId = x.Question.AnswerTypeId,
                    Description = x.Question.Description,
                    Id = x.Question.Id,
                    IndustryId = x.Question.IndustryId,
                    IsActive = x.Question.IsActive,
                    IsTemplate = x.Question.IsTemplate,
                    OrganizationId = x.Question.OrganizationId,
                    ParentQuestionId = x.Question.ParentQuestionId,
                    Points = x.Question.Points,
                    ProfileTypeId = x.Question.ProfileTypeId,
                    QuestionSettings = x.Question.QuestionSettings,
                    QuestionText = x.Question.QuestionText,
                    ScaleId = x.Question.ScaleId,
                    SeqNo = x.Question.SeqNo,

                    StructureLevelId = x.Question.StructureLevelId,
                    TimeForQuestion = x.Question.TimeForQuestion,

                } : null,
                Stage = x.Stage != null ? new IpsStageModel()
                {
                    EndDateTime = x.Stage.EndDateTime,
                    Id = x.Stage.Id,
                    Name = x.Stage.Name,
                    StageGroupId = x.Stage.StageGroupId,
                    StartDateTime = x.Stage.StartDateTime
                } : null
            }).ToList();
        }

    }
}
