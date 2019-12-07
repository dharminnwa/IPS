using System.Collections.Generic;
using IPS.Data;
using System.Data.Entity.Infrastructure;
using System.Linq;
using IPS.BusinessModels.Entities;
using System;

namespace IPS.Business
{
    public class StagesService : BaseService, IStagesService
    {
        #region Stage

        public IQueryable<Stage> Get()
        {
            return _ipsDataContext.Stages.AsQueryable();
        }

        public IQueryable<Stage> GetById(int id)
        {
            return _ipsDataContext.Stages.Where(nt => nt.Id == id).AsQueryable();
        }

        public Stage Add(Stage stage)
        {
            stage.NotificationTemplate = null;
            stage.NotificationTemplate1 = null;
            stage.NotificationTemplate2 = null;
            stage.NotificationTemplate3 = null;
            stage.NotificationTemplate4 = null;
            stage.NotificationTemplate5 = null;
            stage.NotificationTemplate6 = null;
            stage.NotificationTemplate7 = null;
            stage.NotificationTemplate8 = null;
            stage.NotificationTemplate9 = null;
            stage.NotificationTemplate10 = null;
            stage.NotificationTemplate11 = null;
            stage.NotificationTemplate12 = null;
            stage.NotificationTemplate13 = null;
            stage.NotificationTemplate14 = null;
            stage.NotificationTemplate15 = null;
            stage.CreatedBy = _authService.GetCurrentUserId();
            stage.CreatedOn = DateTime.Now;
            _ipsDataContext.Stages.Add(stage);
            _ipsDataContext.SaveChanges();
            return stage;
        }

        public bool Update(Stage stage)
        {
            var original = _ipsDataContext.Stages.Find(stage.Id);
            if (original != null)
            {
                stage.NotificationTemplate = null;
                stage.NotificationTemplate1 = null;
                stage.NotificationTemplate2 = null;
                stage.NotificationTemplate3 = null;
                stage.NotificationTemplate4 = null;
                stage.NotificationTemplate5 = null;
                stage.NotificationTemplate6 = null;
                stage.NotificationTemplate7 = null;
                stage.NotificationTemplate8 = null;
                stage.NotificationTemplate9 = null;
                stage.NotificationTemplate10 = null;
                stage.NotificationTemplate11 = null;
                stage.NotificationTemplate12 = null;
                stage.NotificationTemplate13 = null;
                stage.NotificationTemplate14 = null;
                stage.NotificationTemplate15 = null;
                if (stage.EvaluationStartDate == null)
                {
                    stage.EvaluationStartDate = stage.EndDateTime.AddDays(-5).Date.Add(new TimeSpan(7, 00, 0));
                    if (stage.EvaluationStartDate > stage.EndDateTime)
                    {
                        stage.EvaluationStartDate = stage.StartDateTime;
                    }
                }

                List<Stage> allStages = _ipsDataContext.Stages.Where(x => x.StageGroupId == stage.StageGroupId).ToList();
                if (allStages.Count() > 0)
                {
                    Stage previousStage = new Stage();

                    for (int i = 0; i < allStages.Count(); i++)
                    {
                        var selectedStageIndex = -1;
                        if (allStages[i].Id == stage.Id)
                        {
                            selectedStageIndex = i;
                        }
                        //if ((selectedStageIndex - 1) > -1)
                        //{
                        //    int prevIndex = (selectedStageIndex - 1);
                        //    var prevStage = _ipsDataContext.Stages.Find(allStages[prevIndex].Id);
                        //    if (prevStage != null)
                        //    {
                        //        Stage prevStageNew = prevStage;
                        //        prevStageNew.EvaluationEndDate = stage.StartDateTime.AddDays(-1).Date.Add(new TimeSpan(11, 59, 0));
                        //        //_ipsDataContext.Entry(prevStage).CurrentValues.SetValues(prevStageNew);
                        //    }
                        //}

                        //Get Next Stage and set Evaluation End Date
                        if ((selectedStageIndex + 1) > 0)
                        {
                            if (stage.EvaluationEndDate == null)
                            {
                                //int nextIndex = (selectedStageIndex + 1);
                                //if (!(nextIndex >= allStages.Count()))
                                //{
                                //    var nextStage = _ipsDataContext.Stages.Find(allStages[nextIndex].Id);
                                //    if (nextStage != null)
                                //    {
                                //        //stage.EvaluationEndDate = nextStage.StartDateTime.Date.AddDays(-1).Date.Add(new TimeSpan(11, 59, 0));
                                //    }
                                //}
                                //else
                                {
                                    stage.EvaluationEndDate = stage.EndDateTime.Date.Add(new TimeSpan(11, 59, 0));
                                }
                            }
                        }


                    }
                }
                stage.ModifiedBy = _authService.GetCurrentUserId();
                stage.ModifiedOn = DateTime.Now;
                if (stage.IsPaused)
                {
                    if (!original.IsPaused)
                    {
                        stage.PausedAt = stage.ModifiedOn;
                    }
                }
                if (stage.IsStopped)
                {
                    if (!original.IsStopped)
                    {
                        stage.StoppedAt = stage.ModifiedOn;
                    }
                }

                _ipsDataContext.Entry(original).CurrentValues.SetValues(stage);
                _ipsDataContext.SaveChanges();

            }
            // Change Training Dates For this Stage
            // Get Profile By StageId
            PerformanceService _performanceService = new PerformanceService();
            List<IpsQuestionInfo> kpiQuestions = _performanceService.GetProfileKPITrainings(0, stage.Id);
            foreach (IpsQuestionInfo kpiQuestion in kpiQuestions)
            {
                if (kpiQuestion.Agreement != null)
                {
                    foreach (Training kpiTraining in kpiQuestion.Agreement.Trainings)
                    {
                        if (kpiTraining.EndDate > stage.EndDateTime)
                        {
                            Training originalTraining = _ipsDataContext.Trainings.Where(x => x.Id == kpiTraining.Id).FirstOrDefault();
                            Training newTraining = originalTraining;
                            newTraining.EndDate = stage.EndDateTime;
                            newTraining.ModifiedOn = DateTime.Now;
                            newTraining.ModifiedBy = _authService.GetCurrentUserId();
                            _ipsDataContext.Entry(originalTraining).CurrentValues.SetValues(newTraining);
                            _ipsDataContext.SaveChanges();
                        }
                    }
                }
            }

            StageGroup originalStageGroup = _ipsDataContext.StageGroups.Where(sg => sg.Id == stage.StageGroupId).FirstOrDefault();
            if (originalStageGroup != null)
            {

                if (originalStageGroup.EndDate < stage.EndDateTime)
                {
                    StageGroup sg = new StageGroup()
                    {
                        ActualTimeSpan = originalStageGroup.ActualTimeSpan,
                        CreatedBy = originalStageGroup.CreatedBy,
                        CreatedOn = originalStageGroup.CreatedOn,
                        DaysSpan = originalStageGroup.DaysSpan,
                        Description = originalStageGroup.Description,
                        EndDate = stage.EndDateTime,
                        HoursSpan = originalStageGroup.HoursSpan,
                        Id = originalStageGroup.Id,
                        MilestoneEndDate = stage.EndDateTime,
                        MilestoneStartDate = originalStageGroup.MilestoneStartDate,
                        MinutesSpan = originalStageGroup.MinutesSpan,
                        ModifiedBy = originalStageGroup.ModifiedBy,
                        ModifiedOn = originalStageGroup.ModifiedOn,
                        MonthsSpan = originalStageGroup.MonthsSpan,
                        Name = originalStageGroup.Name,
                        ParentParticipantId = originalStageGroup.ParentParticipantId,
                        ParentStageGroupId = originalStageGroup.ParentStageGroupId,
                        StartDate = originalStageGroup.StartDate,
                        StartStageEndDate = originalStageGroup.StartStageEndDate,
                        StartStageStartDate = originalStageGroup.StartStageStartDate,
                        TotalMilestones = originalStageGroup.TotalMilestones,
                        WeeksSpan = originalStageGroup.WeeksSpan,
                    };
                    _ipsDataContext.Entry(originalStageGroup).CurrentValues.SetValues(sg);
                    _ipsDataContext.SaveChanges();
                }
            }


            return true;
        }

        public string Delete(Stage stage)
        {
            _ipsDataContext.Stages.Remove(stage);
            try
            {
                _ipsDataContext.SaveChanges();
                return "OK";
            }

            catch (DbUpdateException e)
            {
                return e.InnerException.InnerException.Message;
            }
        }
        #endregion

        #region StageEvolution

        public int SaveStageEvolution(IpsKTFinalKPI data)
        {
            var stageEvolution = CreateUpdateStageEvolution(data);
            SaveQuestions(stageEvolution.Id, data.NextStageQuestionsId);
            return stageEvolution.Id;
        }

        public int? GetLastStageEvolutionId(int stageId, int participantId)
        {
            int? id = null;

            var stagesEvolution = _ipsDataContext.StagesEvolutions
                .Where(s => s.OriginalStageId == stageId && s.ParticipantId == participantId)
                .Select(s => new { s.Id, s.ParentStageEvolutionId }).ToList();

            foreach (var stage in stagesEvolution)
            {
                if (!stagesEvolution.Any(s => s.ParentStageEvolutionId == stage.Id))
                {
                    id = stage.Id;
                    break;
                }
            }

            return id;
        }

        private StagesEvolution CreateUpdateStageEvolution(IpsKTFinalKPI data)
        {
            StagesEvolution newStageEvolution = null;
            if (data.StageEvolutionId.HasValue)
            {
                newStageEvolution =
                    _ipsDataContext.StagesEvolutions.FirstOrDefault(
                        x => x.ParentStageEvolutionId == data.StageEvolutionId.Value && data.ParticipantId == x.ParticipantId);
            }
            else
            {
                newStageEvolution =
                    _ipsDataContext.StagesEvolutions.FirstOrDefault(
                        x => x.OriginalStageId == data.StageId && !x.ParentStageEvolutionId.HasValue && data.ParticipantId == x.ParticipantId);
            }
            if (newStageEvolution == null)
            {
                newStageEvolution = new StagesEvolution()
                {
                    ParticipantId = data.ParticipantId,
                };
                if (data.StageEvolutionId.HasValue)
                {
                    StagesEvolution currentStageEvolution =
                        _ipsDataContext.StagesEvolutions.First(
                            x => x.Id == data.StageEvolutionId.Value);
                    newStageEvolution.StartDate = currentStageEvolution.StartDate;
                    newStageEvolution.DueDate = currentStageEvolution.DueDate;
                    newStageEvolution.Name = NewAvailableName(currentStageEvolution.Name);
                    newStageEvolution.ParentStageEvolutionId = data.StageEvolutionId.Value;
                    newStageEvolution.OriginalStageId = currentStageEvolution.OriginalStageId;
                }
                else
                {
                    Stage stage = _ipsDataContext.Stages.First(x => x.Id == data.StageId);
                    newStageEvolution.StartDate = stage.StartDateTime;
                    newStageEvolution.DueDate = stage.EndDateTime;
                    newStageEvolution.Name = NewAvailableName(stage.Name);
                    newStageEvolution.OriginalStageId = stage.Id;
                }
            }
            if (newStageEvolution.Id == 0)
            {
                _ipsDataContext.StagesEvolutions.Add(newStageEvolution);
            }
            _ipsDataContext.SaveChanges();
            return newStageEvolution;
        }

        private void SaveQuestions(int stageEvolutionId, IEnumerable<int> questionsId)
        {
            var oldQuestions = _ipsDataContext.StagesEvolutionQuestions.Where(x => x.StageEvolutionId == stageEvolutionId);
            _ipsDataContext.StagesEvolutionQuestions.RemoveRange(oldQuestions);
            _ipsDataContext.StagesEvolutionQuestions.AddRange(
                questionsId.Select(questionId => new StagesEvolutionQuestion()
                {
                    QuestionId = questionId,
                    StageEvolutionId = stageEvolutionId
                }));
            _ipsDataContext.SaveChanges();
        }


        public UserRecurrentNotificationSetting GetUserRecurrentNotificationSettingByStageGroupId(int id)
        {
            UserRecurrentNotificationSetting result = null;
            if (id > 0)
            {
                result = _ipsDataContext.UserRecurrentNotificationSettings.Where(x => x.StageGroupId == id).FirstOrDefault();
            }
            return result;
        }

        #endregion
    }
}
