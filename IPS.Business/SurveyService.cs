using IPS.BusinessModels.Entities;
using IPS.Data;
using System.Data.Entity;
using System.Collections.Generic;
using System.Linq;
using IPS.Business.Interfaces;
using Newtonsoft.Json;
using IPS.Data.Enums;
using System;

namespace IPS.Business
{
    public class SurveyService : BaseService, ISurveyService
    {
        public string GetParticipantFullName(int participantId)
        {
            var participant = _ipsDataContext.EvaluationParticipants.Where(p => p.Id == participantId).FirstOrDefault();
            var userFirstLastName = _ipsDataContext.Users.Where(u => u.Id == participant.UserId).Select(x => string.Concat(x.FirstName, " ", x.LastName)).FirstOrDefault();

            return userFirstLastName;
        }

        public void UpdateAgreements(IEnumerable<IpsSurveyAnswerAgreement> surveyAnswerAgreements)
        {
            foreach (var answerAgreement in surveyAnswerAgreements)
            {
                var answer = _ipsDataContext.SurveyAnswers.Include(x => x.Trainings).Single(x => x.Id == answerAgreement.AnswerId);
                answer.InDevContract = answerAgreement.InDevContract;
                answer.Comment = answerAgreement.Comment;
                answer.Trainings.Clear();
                if (answerAgreement.TrainingsId != null)
                {
                    foreach (var trainingId in answerAgreement.TrainingsId)
                    {

                        var training = _ipsDataContext.Trainings.Single(x => x.Id == trainingId);
                        answer.Trainings.Add(training);
                    }
                }
            }
            _ipsDataContext.SaveChanges();
        }

        public IpsSurveyInfo GetSurveyInfo(int stageId, int participantId)
        {
            Stage stage = _ipsDataContext.Stages.Include("StageGroup.Stages.Answers").Where(nt => nt.Id == stageId).FirstOrDefault();
            if (stage != null)
            {
                IpsSurveyInfo sInfo = new IpsSurveyInfo();
                List<Stage> stages = stage.StageGroup.Stages.OrderBy(s => s.EndDateTime).ToList();
                int stageNo = 1;
                List<int> prevStages = new List<int>();
                Stage prevStage = null;
                sInfo.Stages = stages;
                foreach (var s in stages)
                {
                    if (s.Id == stageId)
                    {
                        sInfo.IsFirstStage = stageNo == 1;
                        sInfo.IsFinalStage = stageNo == stages.Count;
                        sInfo.StageNo = stageNo;
                        sInfo.SurveyAnswers = _ipsDataContext.Answers.Include("Question").Where(a => a.ParticipantId == participantId && a.StageId == stageId).AsNoTracking().ToList();
                        if (sInfo.SurveyAnswers.Count > 0)
                        {
                            List<Answer> surveyAnswers = sInfo.SurveyAnswers.Where(x => x.Question.ParentQuestionId > 0 && x.KPIType == null).ToList();
                            if (surveyAnswers.Count > 0)
                            {
                                sInfo.SurveyAnswers = surveyAnswers;
                            }

                        }

                        EvaluationStatus status = _ipsDataContext.EvaluationStatuses.Where(es => es.ParticipantId == participantId && es.StageId == stageId).AsNoTracking().FirstOrDefault();
                        sInfo.IsOpen = sInfo.SurveyAnswers.Count == 0 || (status != null && status.IsOpen);
                        EvaluationParticipant participant = _ipsDataContext.EvaluationParticipants.Where(ep => ep.Id == participantId).AsNoTracking().FirstOrDefault();
                        var evaluateeId = participantId;
                        if (participant != null)
                        {
                            if (participant.EvaluateeId.HasValue)
                            {
                                evaluateeId = (int)participant.EvaluateeId;
                                sInfo.EvaluateeId = evaluateeId;
                                var evaluateeInfo = _ipsDataContext
                                    .EvaluationParticipants
                                    .Where(e => e.Id == evaluateeId)
                                    .Join(_ipsDataContext.Users,
                                        evaluatee => evaluatee.UserId,
                                        user => user.Id,
                                        (evaluatee, user) => new { FirstName = user.FirstName, LastName = user.LastName, UserId = user.Id })
                                    .FirstOrDefault();
                                sInfo.EvaluateeFullName = string.Concat(evaluateeInfo.FirstName + " " + evaluateeInfo.LastName);
                            }
                            sInfo.IsSelfEvaluated = (bool)participant.IsSelfEvaluation;
                        }
                        if (sInfo.IsFirstStage)
                        {
                            sInfo.Agreements = new List<EvaluationAgreement>();
                            int? ParentStageGroupId = stage.StageGroup.ParentStageGroupId;
                            int? ParentParticipantId = stage.StageGroup.ParentParticipantId;
                            List<Stage> OldStages = _ipsDataContext.Stages.Where(x => x.StageGroupId == ParentStageGroupId).OrderByDescending(x => x.Id).ToList();
                            foreach (Stage stageInfo in OldStages)
                            {
                                sInfo.PreviousSurveyAnswers = _ipsDataContext.Answers.Where(a => a.StageId == stageInfo.Id && a.KPIType > 0 && a.ParticipantId == ParentParticipantId).ToList();

                                sInfo.Agreements = _ipsDataContext.EvaluationAgreements.Include("MilestoneAgreementGoals").Include("Trainings").Where(ea => ea.ParticipantId == ParentParticipantId && ea.StageId == stageInfo.Id && ea.KPIType > 0).AsNoTracking().ToList();
                                //sInfo.AreKPISet = sInfo.Agreements.Count > 0;
                                if (sInfo.PreviousSurveyAnswers.Count > 0)
                                {
                                    break;
                                }
                            }

                        }
                        else
                        {
                            if (prevStage != null)
                            {
                                sInfo.PreviousSurveyAnswers = prevStage.Answers.Where(a => a.ParticipantId == participantId).ToList();
                            }
                            prevStages.Add(s.Id);
                            for (int i = prevStages.Count - 1; i >= 0; i--)
                            {
                                int sid = prevStages[i];
                                sInfo.Agreements =
                                    _ipsDataContext.EvaluationAgreements.Include("MilestoneAgreementGoals").Include("Trainings").Where(ea => ea.ParticipantId == evaluateeId && ea.StageId == sid).AsNoTracking().ToList();
                                if (sInfo.Agreements.Count > 0)
                                    break;
                            }
                        }
                        sInfo.AreKPISet = sInfo.Agreements.Count > 0;
                        return sInfo;
                    }
                    stageNo++;
                    prevStages.Add(s.Id);
                    prevStage = s;
                }
            }
            return null;
        }

        public IpsKTSurveyInfo GetKtSurveyInfo(int profileId, int participantId, int? stageEvolutionId)
        {
            IpsKTSurveyInfo survey = new IpsKTSurveyInfo();

            survey.PerformanceGroupNames = (from performanceGroup in _ipsDataContext.PerformanceGroups
                                            where performanceGroup.ProfileId == profileId
                                            select new { id = performanceGroup.Id, name = performanceGroup.Name }).ToDictionary(p => p.id, p => p.name);
            survey.ProfileId = profileId;

            var profile = _ipsDataContext.Profiles
                .Include(p => p.PerformanceGroups.Select(pg => pg.Link_PerformanceGroupSkills.Select(ls => ls.Skill)))
                .Include(p => p.PerformanceGroups.Select(pg => pg.Link_PerformanceGroupSkills.Select(ls => ls.Questions.Select(question => question.PossibleAnswer))))
                .Include(p => p.PerformanceGroups.Select(pg => pg.Link_PerformanceGroupSkills.Select(ls => ls.Questions.Select(question => question.QuestionMaterial))))
                .Include(p => p.PerformanceGroups.Select(pg => pg.Link_PerformanceGroupSkills.Select(ls => ls.Questions.Select(question => question.QuestionMaterial.Document))))
                .Where(p => p.Id == profileId).Select(q => q).FirstOrDefault();

            survey.AllowRevisitAnsweredQuestions = profile.AllowRevisitAnsweredQuestions == true;
            survey.ProfileName = profile.Name;
            survey.QuestionsDisplayRuleId = (int)profile.QuestionDisplayRuleId;
            survey.RandomizeQuestions = profile.RandomizeQuestions == true;
            var allowedQuestions = new List<int>();
            if (stageEvolutionId.HasValue)
            {
                allowedQuestions = _ipsDataContext.StagesEvolutions
                    .Include(x => x.StagesEvolutionQuestions)
                    .Where(x => x.ParticipantId == participantId && x.Id == stageEvolutionId.Value)
                    .SelectMany(x => x.StagesEvolutionQuestions.Select(q => q.QuestionId)).ToList();
            }
            survey.Questions = new List<IpsKTSurveyQuestions>();
            foreach (var performanceGroup in profile.PerformanceGroups)
            {
                foreach (var skill in performanceGroup.Link_PerformanceGroupSkills)
                {
                    IEnumerable<Question> questions = skill.Questions;
                    if (stageEvolutionId.HasValue)
                    {
                        questions = questions.Where(x => allowedQuestions.Contains(x.Id));
                    }
                    foreach (var question in questions)
                    {
                        survey.Questions.Add(new IpsKTSurveyQuestions()
                        {
                            PerformanceGroupId = performanceGroup.Id,
                            SkillName = skill.Skill.Name,
                            QuestionId = question.Id,
                            SeqNo = question.SeqNo ?? 0,
                            QuestionText = question.QuestionText,
                            PossibleAnswer = question.PossibleAnswer == null ? string.Empty : question.PossibleAnswer.Answer,
                            AnswerTypeId = question.AnswerTypeId,
                            TimeForQuestion = question.TimeForQuestion ?? 0,
                            Material = question.QuestionMaterial != null
                                ? new IpsKTSurveyQuestionMaterial()
                                {
                                    DocumentId = question.QuestionMaterial.DocumentId,
                                    Link = question.QuestionMaterial.Link,
                                    MaterialType = question.QuestionMaterial.MaterialType,
                                    DocumentName = question.QuestionMaterial.Document?.Title ?? string.Empty
                                }
                                : null
                        });
                    }
                }
            }

            return survey;
        }

        public void SaveSurveyResult(IpsKTSurveySave data)
        {
            var surveyResult = new SurveyResult
            {
                ParticipantId = data.ParticipantId,
                StageId = data.StageId,
                StageEvolutionId = data.StageEvolutionId,
                TimeSpent = data.TimeSpent
            };

            foreach (var answer in data.QuestionAnswers)
            {
                surveyResult.SurveyAnswers.Add(new SurveyAnswer
                {
                    QuestionId = answer.QuestionId,
                    Answer = answer.UserAnswer,
                    Comment = answer.Comment,
                    IsCorrect = CheckAnswer(answer.QuestionId, answer.UserAnswer)
                });
            }

            _ipsDataContext.SurveyResults.Add(surveyResult);
            _ipsDataContext.SaveChanges();
        }

        public void UpdateAnswerIsCorrect(IEnumerable<IpsKTSurveyEvaluate> data)
        {
            foreach (var answer in data)
            {
                var original = _ipsDataContext.SurveyAnswers.Find(answer.AnswerId);

                if (original != null)
                {
                    original.IsCorrect = answer.AnswerIsCorrect;
                    original.Comment = answer.Comment;
                }
            }

            _ipsDataContext.SaveChanges();
        }

        public IpsKTEvaluationInfo GetKtEvaluationInfo(int profileId, int? stageId, int? stageEvolutionId, int participantId)
        {
            IpsKTEvaluationInfo evaluation = new IpsKTEvaluationInfo();

            var profileName = _ipsDataContext.Profiles
                .Where(p => p.Id == profileId)
                .Select(q => q.Name).FirstOrDefault();

            var query = _ipsDataContext.SurveyAnswers
                .Include(x => x.SurveyResult)
                .Include(a => a.Question)
                .Include(a => a.Question.PossibleAnswer)
                .Include(a => a.Question.QuestionMaterial)
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.Skill))
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.PerformanceGroup))
                .Where(
                    a => a.SurveyResult.ParticipantId == participantId &&
                        a.Question.AnswerTypeId == (int)QuestionTypeEnum.Text);
            query = stageEvolutionId.HasValue
                ? query.Where(x => x.SurveyResult.StageEvolutionId == stageEvolutionId)
                : query.Where(x => x.SurveyResult.StageId == stageId);
            var answers = query.ToList();

            evaluation.ProfileName = profileName;
            evaluation.Answers = new List<IpsKTEvaluationAnswer>();

            foreach (var answer in answers)
            {
                var userAnswer = new IpsKTEvaluationAnswer()
                {
                    Id = answer.Id,
                    Answer = answer.Answer,
                    CorrectAnswer = answer.Question.PossibleAnswer.Answer,
                    QuestionText = answer.Question.QuestionText,
                    QuestionMaterial = answer.Question.QuestionMaterial,
                    Comment = answer.Comment,
                    SkillNames = new List<string>()
                };

                var linkPG = answer.Question.Link_PerformanceGroupSkills.GroupBy(p => p.PerformanceGroup).FirstOrDefault();

                userAnswer.PerformanceGroupName = linkPG.Key.Name;

                foreach (var skill in linkPG)
                {
                    userAnswer.SkillNames.Add(skill.Skill.Name);
                }

                evaluation.Answers.Add(userAnswer);
            }


            return evaluation;
        }

        private bool? CheckAnswer(int questionId, string userAnswer)
        {
            bool? isCorrect = null;
            var textQuestionTypeId = (int)QuestionTypeEnum.Text;
            var questionWithoutTextAnswer = _ipsDataContext.Questions
                .Include(q => q.PossibleAnswer)
                .Where(q => q.Id == questionId && q.AnswerTypeId != textQuestionTypeId).Select(q => new
                {
                    AnswerTypeId = q.AnswerTypeId,
                    CorrectAnswer = q.PossibleAnswer.Answer
                }).FirstOrDefault();
            if (questionWithoutTextAnswer != null)
            {
                isCorrect = false;
                switch ((QuestionTypeEnum)questionWithoutTextAnswer.AnswerTypeId)
                {
                    case QuestionTypeEnum.Numeric:
                        isCorrect = userAnswer.Equals(questionWithoutTextAnswer.CorrectAnswer);
                        break;
                    case QuestionTypeEnum.SingleChoice:
                        if (!string.IsNullOrEmpty(userAnswer))
                        {
                            var userAnswerNumber = Convert.ToInt32(userAnswer);
                            var correctSingleAnswer =
                                JsonConvert.DeserializeAnonymousType(questionWithoutTextAnswer.CorrectAnswer,
                                    new[] { new { IsCorrect = false, Id = 0 } });
                            isCorrect =
                                correctSingleAnswer.Where(a => a.Id.Equals(userAnswerNumber))
                                    .Select(a => a.IsCorrect)
                                    .FirstOrDefault();
                        }
                        break;
                    case QuestionTypeEnum.MultipleChoice:
                        if (!string.IsNullOrEmpty(userAnswer))
                        {
                            var correctMultipleAnswer =
                                JsonConvert.DeserializeAnonymousType(questionWithoutTextAnswer.CorrectAnswer,
                                    new[] { new { IsCorrect = false, Id = 0 } });
                            var userMultipleAnswers = JsonConvert.DeserializeObject<int[]>(userAnswer);
                            isCorrect = userMultipleAnswers.Length > 0 &&
                                        userMultipleAnswers.All(
                                            userMultipleAnswer =>
                                                correctMultipleAnswer.Where(a => a.Id.Equals(userMultipleAnswer))
                                                    .Select(a => a.IsCorrect)
                                                    .FirstOrDefault());
                        }
                        break;
                    case QuestionTypeEnum.Order:
                        if (!string.IsNullOrEmpty(userAnswer))
                        {
                            var correctOrderAnswer =
                                JsonConvert.DeserializeAnonymousType(questionWithoutTextAnswer.CorrectAnswer,
                                    new[] { new { CorrectOrder = 0, Id = 0 } }).OrderBy(a => a.CorrectOrder).ToList();
                            var userOrderAnswers = JsonConvert.DeserializeAnonymousType(userAnswer, new[] { new { Id = 0 } });
                            isCorrect = true;
                            for (int i = 0; i < correctOrderAnswer.Count; i++)
                            {
                                if (!correctOrderAnswer[i].Id.Equals(userOrderAnswers[i].Id))
                                {
                                    isCorrect = false;
                                    break;
                                }
                            }
                        }
                        break;
                }
            }
            return isCorrect;
        }

        private bool CheckPofileIsPassed(int minPercentScoreToPass, List<SurveyAnswer> answers)
        {
            int userPointsScore = 0;
            int commonPointsScore = 0;

            foreach (var answer in answers)
            {
                if (answer.Question.Points != null)
                {
                    commonPointsScore += answer.Question.Points.Value;

                    if (answer.IsCorrect == true)
                    {
                        userPointsScore += answer.Question.Points.Value;
                    }
                }

            }

            var userPercentScore = commonPointsScore != 0 ? userPointsScore * 100 / commonPointsScore : 0;

            return userPercentScore >= minPercentScoreToPass;
        }

        private string GetEvolutionStageNameById(int? evolutionStageId)
        {
            string result = string.Empty;
            if (evolutionStageId > 0)
            {

                result = _ipsDataContext.StagesEvolutions
                    .Where(x => x.Id == evolutionStageId).Select(x => x.Name).FirstOrDefault();
            }

            return result;
        }

        public IpsKTAnalysisInfo GetKtAnalysisInfo(int profileId, int? stageId, int? stageEvolutionId, int participantId)
        {
            IpsKTAnalysisInfo analysis = new IpsKTAnalysisInfo();

            var profileName = _ipsDataContext.Profiles
                .Where(p => p.Id == profileId)
                .Select(q => q.Name).FirstOrDefault();

            var query = _ipsDataContext.SurveyAnswers
                .Include(x => x.SurveyResult)
                .Include(a => a.Question)

                .Include(a => a.Question.PossibleAnswer)
                 .Include(a => a.Question.Link_PerformanceGroupSkills)
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.Skill))
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.PerformanceGroup))
                .Where(a => a.SurveyResult.ParticipantId == participantId);
            query = stageEvolutionId.HasValue
                ? query.Where(x => x.SurveyResult.StageEvolutionId == stageEvolutionId)
                : query.Where(x => x.SurveyResult.StageId == stageId);
            var answers = query.ToList();

            analysis.ProfileName = profileName;
            analysis.Answers = new List<IpsKTAnalysisAnswer>();

            foreach (var answer in answers)
            {
                var userAnswer = new IpsKTAnalysisAnswer()
                {
                    UserAnswerId = answer.Id,
                    QuestionId = answer.QuestionId,
                    UserAnswer = answer.Answer,
                    PossibleAnswers = answer.Question.PossibleAnswer.Answer,
                    QuestionText = answer.Question.QuestionText,
                    Comment = answer.Comment,
                    AnswerTypeId = answer.Question.AnswerTypeId,
                    IsCorrectAnswer = answer.IsCorrect ?? false,
                    SkillNames = new List<string>()
                };

                if (answer.Question.Link_PerformanceGroupSkills.Count > 0)
                {
                    var linkPG = answer.Question.Link_PerformanceGroupSkills.GroupBy(p => p.PerformanceGroup).FirstOrDefault();

                    userAnswer.PerformanceGroupName = linkPG.Key.Name;

                    foreach (var skill in linkPG)
                    {
                        userAnswer.SkillNames.Add(skill.Skill.Name);
                    }
                }
                else
                {
                    string skillQuery = "select p.id PerformanceGroupId,p.Name PerformanceGroupName, s.id SkillId, s.Name SkillName from Link_PerformanceGroupQuestions lpgq join Link_PerformanceGroupSkills lpgskll on lpgskll.id = lpgq.PerformanceGroupSkillId join Skills s on s.Id = lpgskll.SkillId where lpgq.QuestionId =" + answer.QuestionId;
                    IpsKTSurveySkillModel skillQueryResult = _ipsDataContext.Database.SqlQuery<IpsKTSurveySkillModel>(skillQuery).FirstOrDefault();
                    if (skillQueryResult != null)
                    {
                        userAnswer.PerformanceGroupName = skillQueryResult.PerformanceGroupName;
                        userAnswer.SkillNames.Add(skillQueryResult.SkillName);
                    }
                }

                switch ((QuestionTypeEnum)answer.Question.AnswerTypeId)
                {
                    case QuestionTypeEnum.Numeric:
                        userAnswer.CorrectAnswer = answer.Question.PossibleAnswer.Answer;
                        break;
                    case QuestionTypeEnum.Text:
                        userAnswer.CorrectAnswer = answer.Question.PossibleAnswer.Answer;
                        break;
                    case QuestionTypeEnum.SingleChoice:
                        userAnswer.CorrectAnswer = JsonConvert.DeserializeAnonymousType(answer.Question.PossibleAnswer.Answer, new[] { new { IsCorrect = false, Id = "" } })
                            .Where(a => a.IsCorrect == true).Select(a => a.Id).FirstOrDefault();
                        break;
                    case QuestionTypeEnum.MultipleChoice:
                        userAnswer.CorrectAnswer = JsonConvert.SerializeObject(
                            JsonConvert.DeserializeAnonymousType(answer.Question.PossibleAnswer.Answer, new[] { new { IsCorrect = false, Id = 0 } })
                            .Where(a => a.IsCorrect == true).Select(a => a.Id));
                        break;
                    case QuestionTypeEnum.Order:
                        userAnswer.CorrectAnswer = answer.Question.PossibleAnswer.Answer;
                        break;
                }

                analysis.Answers.Add(userAnswer);
            }


            return analysis;
        }

        private IList<int> GetQuestionsForNextStage(int? stageId, int? stageEvolutionId, int participantId)
        {
            if (stageId.HasValue || stageEvolutionId.HasValue)
            {
                var query = _ipsDataContext.StagesEvolutions
                    .Include(x => x.StagesEvolutionQuestions).Where(x => x.ParticipantId == participantId);
                query = stageEvolutionId.HasValue
                    ? query.Where(x => x.ParentStageEvolutionId == stageEvolutionId.Value)
                    : query.Where(x => x.OriginalStageId == stageId.Value);
                return query.SelectMany(x => x.StagesEvolutionQuestions.Select(q => q.QuestionId))
                        .ToList();
            }
            return new List<int>();
        }

        public bool HasDevContract(int? stageId, int? stageEvolutionId, int participantId)
        {
            var query = _ipsDataContext.SurveyResults
                .Include(x => x.SurveyAnswers)
                .Where(x => x.ParticipantId == participantId);
            query = stageEvolutionId.HasValue
                ? query.Where(x => x.StageEvolutionId == stageEvolutionId)
                : query.Where(x => x.StageId == stageId);
            return query.Any(x => x.SurveyAnswers.Any(a => a.InDevContract == true));
        }

        public List<IpsKTFinalKPIItem> GetKtFinalKPI(int profileId, int? stageId, int? stageEvolutionId, int participantId)
        {
            var result = new List<IpsKTFinalKPIItem>();

            var query = _ipsDataContext.SurveyAnswers
                .Include(x => x.Trainings)
                .Include(x => x.SurveyResult)
                .Include(x => x.Question.PossibleAnswer)
                .Include(x => x.Question.QuestionMaterial)
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.Skill))
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.PerformanceGroup))
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.Trainings))
                .Where(a => a.SurveyResult.ParticipantId == participantId);
            query = stageEvolutionId.HasValue
                ? query.Where(x => x.SurveyResult.StageEvolutionId == stageEvolutionId)
                : query.Where(x => x.SurveyResult.StageId == stageId);
            var answers = query.Select(a => a).ToList();
            var questionsForNextStage = GetQuestionsForNextStage(stageId, stageEvolutionId, participantId);
            IpsKTFinalKPIStage stage = new IpsKTFinalKPIStage();
            if (stageId.HasValue)
            {
                var stageinfo = _ipsDataContext.Stages.Where(x => x.Id == stageId.Value).AsNoTracking().FirstOrDefault();
                stage.Id = stageinfo.Id;
                stage.EndDateTime = stageinfo.EndDateTime;
                stage.StartDateTime = stageinfo.StartDateTime;
                stage.EvaluationEndDate = stageinfo.EvaluationEndDate;
                stage.EvaluationStartDate = stageinfo.EvaluationStartDate;
            }
            foreach (var answer in answers)
            {
                var linkPG = answer.Question.Link_PerformanceGroupSkills.FirstOrDefault();

                var item = new IpsKTFinalKPIItem
                {
                    IsCorrect = answer.IsCorrect ?? false,
                    QuestionId = answer.QuestionId,
                    SelectForNextStage = questionsForNextStage.Contains(answer.QuestionId),
                    QuestionText = answer.Question.QuestionText,
                    QuestionMaterial = answer.Question.QuestionMaterial,
                    IsAvailable = answer.IsCorrect.HasValue,
                    SkillNames = answer.Question.Link_PerformanceGroupSkills.Select(x => x.Skill.Name).ToList(),
                    Skill = new IpsKTSkill()
                    {
                        Id = linkPG.Skill.Id,
                        Name = linkPG.Skill.Name,
                    },
                    PerformanceGroupName = linkPG.PerformanceGroup.Name,
                    Comment = answer.Comment,
                    AnswerId = answer.Id,
                    InDevContract = answer.InDevContract == true,
                    Answer = answer.Answer,
                    PossibleAnswers = answer.Question.PossibleAnswer.Answer,
                    AnswerTypeId = answer.Question.AnswerTypeId,
                    //Skills = answer.Question.Link_PerformanceGroupSkills.Select(x => x.Skill).ToList(),
                    Agreement = new IpsKTFinalKPIAgreement()
                    {
                        Trainings = answer.Trainings,
                        Stage = stage
                    },
                    Trainings = answer.Question.Link_PerformanceGroupSkills.SelectMany(x => x.Trainings).ToList()
                };
                if (item.Trainings == null)
                {
                    if (!(item.Trainings.ToList().Count() > 0))
                    {
                        item.Trainings = answer.Trainings;
                    }
                }
                item.Points = item.IsCorrect ? answer.Question.Points ?? 0 : 0;
                //if (item.Skills == null) {
                //    item.Skills = answer.Question.Link_PerformanceGroupSkills.Select(x => x.Skill).ToList();
                //}
                result.Add(item);
            }
            return result;
        }

        public IEnumerable<IpsKTFinalKPIItem> GetKtFinalKPIPreviousResults(int profileId, int stageEvolutionId, int participantId)
        {
            var result = new List<IpsKTFinalKPIItem>();

            var previousAnswers = GetKtSurveyPreviousAnswers(stageEvolutionId, participantId);
            var questionsForNextStage = GetQuestionsForNextStage(null, stageEvolutionId, participantId);
            foreach (var answer in previousAnswers)
            {
                var linkPG = answer.Question.Link_PerformanceGroupSkills.FirstOrDefault();

                var item = new IpsKTFinalKPIItem
                {
                    IsCorrect = answer.IsCorrect ?? false,
                    QuestionId = answer.QuestionId,
                    QuestionText = answer.Question.QuestionText,
                    QuestionMaterial = answer.Question.QuestionMaterial,
                    IsAvailable = answer.IsCorrect.HasValue,
                    SkillNames = answer.Question.Link_PerformanceGroupSkills.Select(x => x.Skill.Name).ToList(),
                    PerformanceGroupName = linkPG.PerformanceGroup.Name,
                    Comment = answer.Comment,
                    Answer = answer.Answer,
                    AnswerId = answer.Id,
                    PossibleAnswers = answer.Question.PossibleAnswer.Answer,
                    AnswerTypeId = answer.Question.AnswerTypeId,
                    Skills = answer.Question.Link_PerformanceGroupSkills.Select(x => x.Skill).ToList(),
                    SelectForNextStage = questionsForNextStage.Contains(answer.QuestionId),
                };
                item.Points = item.IsCorrect ? answer.Question.Points ?? 0 : 0;

                result.Add(item);
            }
            return result;
        }

        public IpsKTSurveyResult GetKtResultInfo(int profileId, int? stageId, int? stageEvolutionId, List<int> participantsId)
        {
            IpsKTSurveyResult result = new IpsKTSurveyResult();
            result.Answers = new List<IpsKTSurveyResultAnswer>();

            var query = _ipsDataContext.SurveyAnswers
                .Include(x => x.SurveyResult)
                .Include(a => a.Question)
                .Include(a => a.Question.PossibleAnswer)
                .Include(a => a.Question.Link_PerformanceGroupSkills)
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.Skill))
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.PerformanceGroup))
                .Where(a => participantsId.Contains(a.SurveyResult.ParticipantId));
            query = stageEvolutionId.HasValue
                ? query.Where(x => x.SurveyResult.StageEvolutionId == stageEvolutionId)
                : query.Where(x => x.SurveyResult.StageId == stageId);
            var answers = query.ToList();

            var possibleMedals = _ipsDataContext.Profiles
                .Include(p => p.KTMedalRule)
                .Where(p => p.Id == profileId).Select(q => q.KTMedalRule).FirstOrDefault();

            if (possibleMedals != null)
            {
                result.MedalRules = new IpsKtMedalRules();
                result.MedalRules.BronzeMedalMinScore = possibleMedals.BronzeStart;
                result.MedalRules.SilverMedalMinScore = possibleMedals.BronzeEnd;
                result.MedalRules.GoldMedalMinScore = possibleMedals.SilverEnd;
            }

            int minPercentScoreToPass = 0;
            if (possibleMedals != null)
            {
                minPercentScoreToPass = (int)result.MedalRules.BronzeMedalMinScore;
            }
            else
            {
                minPercentScoreToPass = _ipsDataContext.Profiles
                .Where(p => p.Id == profileId).Select(q => q.PassScore).FirstOrDefault() ?? 0;
            }
            result.PassingScore = minPercentScoreToPass;
            result.IsPassed = CheckPofileIsPassed(minPercentScoreToPass, answers);

            foreach (var answer in answers)
            {
                var answerInfo = new IpsKTSurveyResultAnswer()
                {
                    IsCorrect = answer.IsCorrect == true,
                    QuestionText = answer.Question.QuestionText,
                    IsAvailable = answer.IsCorrect != null,
                    SkillNames = new List<string>()
                };
                answerInfo.ParticipantId = answer.SurveyResult.ParticipantId;
                answerInfo.Points = answerInfo.IsCorrect ? answer.Question.Points ?? 0 : 0;
                answerInfo.ScorePoint = answer.Question.Points;
                if (answer.Question.Link_PerformanceGroupSkills.Count > 0)
                {
                    var linkPG = answer.Question.Link_PerformanceGroupSkills.GroupBy(p => p.PerformanceGroup).FirstOrDefault();

                    answerInfo.PerformanceGroupName = linkPG.Key.Name;

                    foreach (var skill in linkPG)
                    {
                        int scoreBySkill = 0;
                        foreach (var question in skill.Questions)
                        {
                            scoreBySkill += question.Points ?? 0;
                        }

                        answerInfo.Bemchmark = (int)Math.Ceiling(scoreBySkill * (double)skill.Benchmark / 100); //skill.Benchmark;
                        answerInfo.SkillNames.Add(skill.Skill.Name);
                    }
                }
                else
                {

                    string skillQuery = "select p.id PerformanceGroupId,p.Name PerformanceGroupName, s.id SkillId, s.Name SkillName from Link_PerformanceGroupQuestions lpgq join Link_PerformanceGroupSkills lpgskll on lpgskll.id = lpgq.PerformanceGroupSkillId join Skills s on s.Id = lpgskll.SkillId where lpgq.QuestionId =" + answer.QuestionId;
                    IpsKTSurveySkillModel skillQueryResult = _ipsDataContext.Database.SqlQuery<IpsKTSurveySkillModel>(skillQuery).FirstOrDefault();
                    if (skillQueryResult != null)
                    {
                        answerInfo.PerformanceGroupName = skillQueryResult.PerformanceGroupName;
                        answerInfo.SkillNames.Add(skillQueryResult.SkillName);
                    }

                }
                result.Answers.Add(answerInfo);
            }


            if (stageEvolutionId > 0)
            {
                result.EvolutionStage = GetEvolutionStageNameById(stageEvolutionId);
            }

            return result;
        }

        public IpsKTSurveyResult GetKtAggregatedResultInfo(int profileId, int? stageId, int participantId, int? stageEvolutionId)
        {
            IpsKTSurveyResult result = new IpsKTSurveyResult();
            result.Answers = new List<IpsKTSurveyResultAnswer>();

            List<SurveyAnswer> currentAnswers = new List<SurveyAnswer>();

            var query = _ipsDataContext.SurveyAnswers
                .Include(x => x.SurveyResult)
                .Include(a => a.Question)
                .Include(a => a.Question.PossibleAnswer)
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.Skill))
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.PerformanceGroup))
                .Where(a => a.SurveyResult.ParticipantId == participantId);

            if (stageEvolutionId.HasValue)
            {
                currentAnswers = query.Where(sa => sa.SurveyResult.StageEvolutionId == stageEvolutionId).ToList();
                currentAnswers.AddRange(GetKtSurveyPreviousAnswers(stageEvolutionId.Value, participantId).ToList());

            }
            else
            {
                currentAnswers = query.Where(sa => sa.SurveyResult.StageId == stageId).ToList();
            }




            foreach (var answer in currentAnswers)
            {
                var answerInfo = new IpsKTSurveyResultAnswer()
                {
                    IsCorrect = answer.IsCorrect == true,
                    QuestionText = answer.Question.QuestionText,
                    IsAvailable = answer.IsCorrect.HasValue,
                    SkillNames = new List<string>()
                };

                answerInfo.Points = answerInfo.IsCorrect ? answer.Question.Points ?? 0 : 0;
                answerInfo.ScorePoint = answer.Question.Points;
                var linkPG = answer.Question.Link_PerformanceGroupSkills.GroupBy(p => p.PerformanceGroup).FirstOrDefault();

                answerInfo.PerformanceGroupName = linkPG.Key.Name;

                foreach (var skill in linkPG)
                {
                    answerInfo.SkillNames.Add(skill.Skill.Name);
                }

                result.Answers.Add(answerInfo);
            }

            var possibleMedals = _ipsDataContext.Profiles
                .Include(p => p.KTMedalRule)
                .Where(p => p.Id == profileId).Select(q => q.KTMedalRule).FirstOrDefault();

            if (possibleMedals != null)
            {
                result.MedalRules = new IpsKtMedalRules();
                result.MedalRules.BronzeMedalMinScore = possibleMedals.BronzeStart;
                result.MedalRules.SilverMedalMinScore = possibleMedals.BronzeEnd;
                result.MedalRules.GoldMedalMinScore = possibleMedals.SilverEnd;


            }
            int minPercentScoreToPass = 0;
            if (possibleMedals != null)
            {
                minPercentScoreToPass = (int)result.MedalRules.BronzeMedalMinScore;
            }
            else
            {
                minPercentScoreToPass = _ipsDataContext.Profiles
                .Where(p => p.Id == profileId).Select(q => q.PassScore).FirstOrDefault() ?? 0;
            }

            result.PassingScore = minPercentScoreToPass;
            result.IsPassed = CheckPofileIsPassed(minPercentScoreToPass, currentAnswers);
            if (stageEvolutionId > 0)
            {
                result.EvolutionStage = GetEvolutionStageNameById(stageEvolutionId);
            }
            return result;
        }

        public List<SurveyAnswer> GetFinalStageResult(int stageEvolutionId, int participantId)
        {
            List<SurveyAnswer> result = new List<SurveyAnswer>();

            var previousAnswers = GetKtSurveyPreviousAnswers(stageEvolutionId, participantId);
            int lastSurveyResultId = _ipsDataContext.SurveyResults
                .Where(s => s.StageEvolutionId == stageEvolutionId && s.ParticipantId == participantId)
                .Select(s => s.Id)
                .FirstOrDefault();
            var lastAnswers = _ipsDataContext.SurveyAnswers
                .Include(a => a.Question)
                .Where(a => a.SurveyResultId == lastSurveyResultId).ToList();
            if (previousAnswers.Count != 0)
            {
                foreach (var answer in lastAnswers)
                {
                    var resultAnswer = lastAnswers.Find(r => r.QuestionId == answer.QuestionId);
                    resultAnswer.IsCorrect = answer.IsCorrect;
                    resultAnswer.Answer = answer.Answer;
                }
                return previousAnswers;
            }
            else
            {
                return lastAnswers;
            }
        }

        public bool StageEvolutionHasAnswers(int stageEvolutionId, int participantId)
        {
            return _ipsDataContext.SurveyResults
                .Where(sr => sr.StageEvolutionId == stageEvolutionId && sr.ParticipantId == participantId)
                .Any();
        }

        public List<SurveyAnswer> GetStartStageResult(int stageId, int participantId)
        {
            List<SurveyAnswer> result = _ipsDataContext.SurveyResults
                .Include(sr => sr.SurveyAnswers)
                .Where(s => s.StageId == stageId && s.ParticipantId == participantId && s.SurveyAnswers.Any())
                .SelectMany(s => s.SurveyAnswers)
                .Include(a => a.Question)
                .ToList();

            return result;
        }

        List<SurveyAnswer> GetStageEvolutionResult(int stageEvolutionId, int participantId)
        {
            List<SurveyAnswer> result = _ipsDataContext.SurveyResults
                .Include(sr => sr.SurveyAnswers)
                .Where(s => s.StageEvolutionId == stageEvolutionId && s.ParticipantId == participantId && s.SurveyAnswers.Any())
                .SelectMany(s => s.SurveyAnswers)
                .ToList();

            return result;
        }

        private List<SurveyAnswer> GetKtSurveyPreviousAnswers(int stageEvolutionId, int participantId)
        {
            var query = _ipsDataContext.SurveyAnswers
                .Include(x => x.SurveyResult)
                .Include(x => x.Question.PossibleAnswer)
                .Include(x => x.Question.QuestionMaterial)
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.Skill))
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.PerformanceGroup))
                .Where(a => a.SurveyResult.ParticipantId == participantId);


            var currentStageQuestionsId = query
                .Where(x => x.SurveyResult.StageEvolutionId == stageEvolutionId)
                .Select(s => s.QuestionId).ToList();



            List<SurveyAnswer> mainStageAnswers = new List<SurveyAnswer>();
            List<SurveyResult> surveyResultsOld = new List<SurveyResult>();

            var currentStageEvolution = _ipsDataContext.StagesEvolutions
                .Where(se => se.ParticipantId == participantId && se.Id == stageEvolutionId)
                .Select(se => new { se.ParentStageEvolutionId, se.OriginalStageId }).FirstOrDefault();

            var allSurveyResults = _ipsDataContext.SurveyResults
                            .Include(sr => sr.StagesEvolution)
                            .Include(sr => sr.SurveyAnswers)
                            .Where(se => se.StagesEvolution.OriginalStageId == currentStageEvolution.OriginalStageId && se.ParticipantId == participantId)
                            .ToList();

            var allStageEvolutions = _ipsDataContext.StagesEvolutions
                    .Where(se => se.ParticipantId == participantId && se.OriginalStageId == currentStageEvolution.OriginalStageId)
                    .Select(s => new { s.Id, s.ParentStageEvolutionId }).ToList();

            mainStageAnswers = query
                .Where(x => x.SurveyResult.StageId == currentStageEvolution.OriginalStageId
                && !currentStageQuestionsId.Contains(x.QuestionId)).ToList();

            if (currentStageEvolution.ParentStageEvolutionId.HasValue)
            {
                var previousStageEvolution = allStageEvolutions.Find(se => se.Id == currentStageEvolution.ParentStageEvolutionId);

                while (previousStageEvolution != null)
                {
                    surveyResultsOld.Add(allSurveyResults.Find(sr => sr.StageEvolutionId == previousStageEvolution.Id));

                    previousStageEvolution = allStageEvolutions.Find(se => se.Id == previousStageEvolution.ParentStageEvolutionId);
                }

                // updateMainStageAnswers
                foreach (var answer in mainStageAnswers)
                {
                    var lastUpdatedResult = surveyResultsOld.Where(s => s.StageEvolutionId == currentStageEvolution.ParentStageEvolutionId).FirstOrDefault();
                    var lastUpdatedResultAnswer = lastUpdatedResult.SurveyAnswers.Where(a => a.QuestionId == answer.QuestionId).FirstOrDefault();

                    while (lastUpdatedResultAnswer == null && lastUpdatedResult.StagesEvolution.ParentStageEvolutionId.HasValue)
                    {
                        lastUpdatedResult = surveyResultsOld.Where(s => s.StageEvolutionId == lastUpdatedResult.StagesEvolution.ParentStageEvolutionId).FirstOrDefault();
                        lastUpdatedResultAnswer = lastUpdatedResult.SurveyAnswers.Where(a => a.QuestionId == answer.QuestionId).FirstOrDefault();
                    }

                    if (lastUpdatedResultAnswer != null)
                    {
                        answer.IsCorrect = lastUpdatedResultAnswer.IsCorrect;
                        answer.Answer = lastUpdatedResultAnswer.Answer;
                    }
                }
            }

            return mainStageAnswers;
        }

        public List<SurveyAnswer> GetKtStageEvolutionSurveyAnswers(int stageEvolutionId, int participantId)
        {
            var query = _ipsDataContext.SurveyAnswers
                .Include(x => x.SurveyResult)
                .Include(x => x.Question.PossibleAnswer)
                .Include(x => x.Question.QuestionMaterial)
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.Skill))
                .Include(a => a.Question.Link_PerformanceGroupSkills.Select(pg => pg.PerformanceGroup))
                .Where(a => a.SurveyResult.ParticipantId == participantId);


            var currentStageQuestionsId = query
                .Where(x => x.SurveyResult.StageEvolutionId == stageEvolutionId)
                .Select(s => s.QuestionId).ToList();



            List<SurveyAnswer> mainStageAnswers = new List<SurveyAnswer>();
            List<SurveyResult> surveyResultsOld = new List<SurveyResult>();

            var currentStageEvolution = _ipsDataContext.StagesEvolutions
                .Where(se => se.ParticipantId == participantId && se.Id == stageEvolutionId)
                .Select(se => new { se.ParentStageEvolutionId, se.OriginalStageId }).FirstOrDefault();

            var allSurveyResults = _ipsDataContext.SurveyResults
                            .Include(sr => sr.StagesEvolution)
                            .Include(sr => sr.SurveyAnswers)
                            .Where(se => se.StagesEvolution.OriginalStageId == currentStageEvolution.OriginalStageId && se.ParticipantId == participantId)
                            .ToList();

            var allStageEvolutions = _ipsDataContext.StagesEvolutions
                    .Where(se => se.ParticipantId == participantId && se.OriginalStageId == currentStageEvolution.OriginalStageId)
                    .Select(s => new { s.Id, s.ParentStageEvolutionId }).ToList();

            mainStageAnswers = query
                .Where(x => x.SurveyResult.StageId == currentStageEvolution.OriginalStageId
                && currentStageQuestionsId.Contains(x.QuestionId)).ToList();

            if (stageEvolutionId > 0)
            {
                var previousStageEvolution = allStageEvolutions.Find(se => se.Id == stageEvolutionId);

                while (previousStageEvolution != null)
                {
                    surveyResultsOld.Add(allSurveyResults.Find(sr => sr.StageEvolutionId == previousStageEvolution.Id));

                    previousStageEvolution = allStageEvolutions.Find(se => se.Id == previousStageEvolution.ParentStageEvolutionId);
                }

                // updateMainStageAnswers
                foreach (var answer in mainStageAnswers)
                {
                    var lastUpdatedResult = surveyResultsOld.Where(s => s.StageEvolutionId == stageEvolutionId).FirstOrDefault();
                    var lastUpdatedResultAnswer = lastUpdatedResult.SurveyAnswers.Where(a => a.QuestionId == answer.QuestionId).FirstOrDefault();

                    while (lastUpdatedResultAnswer == null && lastUpdatedResult.StagesEvolution.ParentStageEvolutionId.HasValue)
                    {
                        lastUpdatedResult = surveyResultsOld.Where(s => s.StageEvolutionId == lastUpdatedResult.StagesEvolution.ParentStageEvolutionId).FirstOrDefault();
                        lastUpdatedResultAnswer = lastUpdatedResult.SurveyAnswers.Where(a => a.QuestionId == answer.QuestionId).FirstOrDefault();
                    }

                    if (lastUpdatedResultAnswer != null)
                    {
                        answer.IsCorrect = lastUpdatedResultAnswer.IsCorrect;
                        answer.Answer = lastUpdatedResultAnswer.Answer;
                    }
                }
            }

            return mainStageAnswers;
        }
    }
}
