using IPS.Data;
using IPS.BusinessModels.Entities;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Linq.Expressions;


namespace IPS.Business
{
    public class EvaluationAgreementsService : BaseService, IPS.Business.IEvaluationAgreementsService
    {
        public IQueryable<EvaluationAgreement> GetEvaluationAgreements()
        {
            return _ipsDataContext.EvaluationAgreements.AsNoTracking().AsQueryable();
        }

        public IQueryable<EvaluationAgreement> GetEvaluationAgreementById(int id)
        {
            return _ipsDataContext.EvaluationAgreements.Where(q => q.Id == id).AsQueryable();
        }


        public EvaluationAgreement[] AddEvaluationAgreement(EvaluationAgreement[] evaluationAgreements)
        {
            foreach (var evaluationAgreement in evaluationAgreements)
            {
                evaluationAgreement.Stage = null;
                evaluationAgreement.EvaluationParticipant = null;
                evaluationAgreement.Question = null;

                List<Training> trainings = new List<Training>();
                if (evaluationAgreement.Trainings != null)
                {
                    foreach (Training training in evaluationAgreement.Trainings)
                    {
                        Training trainingDB = _ipsDataContext.Trainings.Where(t => t.Id == training.Id).FirstOrDefault();
                        trainings.Add(trainingDB);
                    }
                    evaluationAgreement.Trainings = trainings;
                }

                foreach (MilestoneAgreementGoal milestoneAgreementGoal in evaluationAgreement.MilestoneAgreementGoals)
                {
                    milestoneAgreementGoal.CreatedBy = _authService.GetCurrentUserId();
                    milestoneAgreementGoal.CreatedOn = DateTime.Now;
                }
                _ipsDataContext.EvaluationAgreements.Add(evaluationAgreement);

                _ipsDataContext.SaveChanges();
                //AddTaskByEvaluationAgreement(evaluationAgreement);
            }

            return evaluationAgreements;
        }

        public void UpdateEvaluationAgreement(EvaluationAgreement[] evaluationAgreements)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    foreach (var agreement in evaluationAgreements)
                    {
                        var original = _ipsDataContext.EvaluationAgreements.Include("MilestoneAgreementGoals").Include("Trainings").Where(ea => ea.Id == agreement.Id).FirstOrDefault();
                        if (original != null)
                        {
                            _ipsDataContext.Entry(original).CurrentValues.SetValues(agreement);

                            original.Trainings.Clear();
                            foreach (Training training in agreement.Trainings)
                            {
                                Training trainingDB = _ipsDataContext.Trainings.Where(t => t.Id == training.Id).FirstOrDefault();
                                original.Trainings.Add(trainingDB);
                            }
                            foreach (MilestoneAgreementGoal milestoneAgreementGoal in agreement.MilestoneAgreementGoals)
                            {
                                if (milestoneAgreementGoal.Id > 0)
                                {
                                    MilestoneAgreementGoal originalMilestoneAgreementGoal = _ipsDataContext.MilestoneAgreementGoals.Where(x => x.Id == milestoneAgreementGoal.Id).FirstOrDefault();
                                    if (originalMilestoneAgreementGoal != null)
                                    {
                                        milestoneAgreementGoal.ModifiedOn = DateTime.Now;
                                        milestoneAgreementGoal.ModifiedBy = _authService.GetCurrentUserId();
                                        _ipsDataContext.Entry(originalMilestoneAgreementGoal).CurrentValues.SetValues(milestoneAgreementGoal);
                                    }
                                }
                                else
                                {
                                    milestoneAgreementGoal.EvaluationAgreementId = agreement.Id;
                                    milestoneAgreementGoal.CreatedBy = _authService.GetCurrentUserId();
                                    milestoneAgreementGoal.CreatedOn = DateTime.Now;
                                    _ipsDataContext.MilestoneAgreementGoals.Add(milestoneAgreementGoal);
                                }
                            }
                        }
                        else
                        {
                            agreement.Stage = null;
                            agreement.EvaluationParticipant = null;
                            agreement.Question = null;

                            List<Training> trainings = new List<Training>();
                            if (agreement.Trainings != null)
                            {
                                foreach (Training training in agreement.Trainings)
                                {
                                    Training trainingDB = _ipsDataContext.Trainings.Where(t => t.Id == training.Id).FirstOrDefault();
                                    trainings.Add(trainingDB);
                                }
                                agreement.Trainings = trainings;
                            }

                            if (agreement.MilestoneAgreementGoals != null)
                            {
                                foreach (MilestoneAgreementGoal milestoneAgreementGoal in agreement.MilestoneAgreementGoals)
                                {
                                    milestoneAgreementGoal.EvaluationAgreementId = agreement.Id;
                                    milestoneAgreementGoal.CreatedBy = _authService.GetCurrentUserId();
                                    milestoneAgreementGoal.CreatedOn = DateTime.Now;
                                }
                            }

                            _ipsDataContext.EvaluationAgreements.Add(agreement);
                        }
                    }

                    _ipsDataContext.SaveChanges();
                    dbContextTransaction.Commit();
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();

                    throw;
                }
            }
        }

        public void UpdateTeamEvaluationAgreement(EvaluationAgreement[] evaluationAgreements)
        {
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    foreach (var agreement in evaluationAgreements)
                    {
                        var original = _ipsDataContext.EvaluationAgreements.Include("Trainings").Where(ea => ea.Id == agreement.Id).FirstOrDefault();

                        if (original != null)
                        {
                            _ipsDataContext.Entry(original).CurrentValues.SetValues(agreement);

                            original.Trainings.Clear();
                            foreach (Training training in agreement.Trainings)
                            {
                                Training trainingDB = _ipsDataContext.Trainings.Where(t => t.Id == training.Id).FirstOrDefault();
                                original.Trainings.Add(trainingDB);
                            }
                        }
                        else
                        {
                            agreement.Stage = null;
                            agreement.EvaluationParticipant = null;
                            agreement.Question = null;

                            List<Training> trainings = new List<Training>();
                            if (agreement.Trainings != null)
                            {
                                foreach (Training training in agreement.Trainings)
                                {
                                    Training trainingDB = _ipsDataContext.Trainings.Where(t => t.Id == training.Id).FirstOrDefault();
                                    trainings.Add(trainingDB);
                                }
                                agreement.Trainings = trainings;
                            }

                            _ipsDataContext.EvaluationAgreements.Add(agreement);
                        }
                    }

                    _ipsDataContext.SaveChanges();
                    dbContextTransaction.Commit();
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();

                    throw;
                }
            }
        }

        public void DeleteEvaluationAgreement(EvaluationAgreement evaluationAgreement)
        {
            EvaluationAgreement original = _ipsDataContext.EvaluationAgreements.Include("Trainings").Where(ea => ea.Id == evaluationAgreement.Id).FirstOrDefault();

            if (original != null)
            {

                /* List<Training> trainings = evaluationAgreement.Trainings.ToList();
                 trainings.Clear();*/
                if (original.Trainings.Count > 0)
                {
                    throw new DbUpdateException("Training is connected");
                }

                _ipsDataContext.EvaluationAgreements.Remove(evaluationAgreement);
                _ipsDataContext.SaveChanges();
            }
        }
        public void AddTaskByEvaluationAgreement(EvaluationAgreement evaluationAgreement)
        {
            foreach (Training training in evaluationAgreement.Trainings)
            {

                double days = (training.EndDate - training.StartDate).Value.TotalDays;
                if (days > 0)
                {
                    DateTime? previousDate = null;
                    for (int i = 0; i < days; i++)
                    {
                        {
                            Data.Task newTask = new Data.Task();

                            EvaluationParticipant evaluationParticipant = new EvaluationParticipant();
                            // get user id by participant id
                            EvaluationParticipantsService evaluationParticipantsService = new EvaluationParticipantsService();
                            evaluationParticipant = evaluationParticipantsService.GetEvaluationParticipantsById(evaluationAgreement.ParticipantId).FirstOrDefault();
                            newTask.AssignedToId = evaluationParticipant.UserId;
                            // check for categort List 
                            TaskCategoryListsService TaskCategoryListsService = new TaskCategoryListsService();

                            TaskCategoryList taskCategoryList = TaskCategoryListsService.GetUserlist(evaluationParticipant.UserId).FirstOrDefault();
                            if (taskCategoryList != null)
                            {
                                TaskCategoryListItem taskCategoryListItem = new TaskCategoryListItem();
                                taskCategoryListItem = taskCategoryList.TaskCategoryListItems.Where(x => x.Name.ToLower().Contains("kpi training") == true).FirstOrDefault();
                                if (taskCategoryListItem == null)
                                {
                                    taskCategoryListItem = new TaskCategoryListItem();
                                    taskCategoryListItem.Name = "KPI Training";
                                    taskCategoryListItem.CategoryListId = taskCategoryList.Id;
                                    taskCategoryListItem.Color = "#c3c3c3";
                                    taskCategoryListItem.Description = "Default KPI Training";
                                    taskCategoryListItem.TextColor = "#ffffff";
                                    TaskCategoryListItemsService TaskCategoryListItemsService = new TaskCategoryListItemsService();
                                    taskCategoryListItem = TaskCategoryListItemsService.Add(taskCategoryListItem);
                                }
                                newTask.CategoryId = taskCategoryListItem.Id;
                            }

                            AuthService authService = new AuthService();
                            IpsUser user = authService.getCurrentUser();
                            newTask.CreatedById = authService.GetCurrentUserId();
                            newTask.CreatedByName = user.FirstName + " " + user.LastName;
                            newTask.CreatedDate = DateTime.Now;
                            newTask.Description = "Auto " + training.Name + " Task";
                            //Get and Set Profile based on evaluationAgreement
                            StageGroupsService stageGroupsService = new StageGroupsService();
                            EvaluationAgreement evaluationAgreementInfo = _ipsDataContext.EvaluationAgreements.Include("Stage").Where(ea => ea.Id == evaluationAgreement.Id).FirstOrDefault();
                            StageGroup stageGroup = _ipsDataContext.StageGroups.Include("Profiles").Where(x => x.Id == evaluationAgreementInfo.Stage.StageGroupId).FirstOrDefault();
                            newTask.ProfileId = stageGroup.Profiles.FirstOrDefault().Id;

                            // Get And set Priority 
                            TaskPriorityListsService taskPriorityListsService = new TaskPriorityListsService();
                            TaskPriorityList taskPriorityList = taskPriorityListsService.GetUserlist(evaluationParticipant.UserId).FirstOrDefault();
                            newTask.PriorityId = taskPriorityList.TaskPriorityListItems.FirstOrDefault().Id;
                            if (previousDate == null)
                            {
                                newTask.StartDate = training.StartDate;
                            }
                            else
                            {
                                newTask.StartDate = previousDate;
                            }

                            newTask.DueDate = newTask.StartDate.Value.AddDays(1);
                            previousDate = newTask.DueDate;

                            TaskList taskList = _ipsDataContext.TaskLists.Where(x => x.UserId == evaluationParticipant.UserId).FirstOrDefault();
                            newTask.TaskListId = taskList.Id;

                            newTask.Title = training.Name + " Task Day  - " + ((DateTime)newTask.StartDate).ToString("MM/dd/yyyy");
                            newTask.StageId = evaluationAgreement.StageId;
                            newTask.TrainingId = training.Id;

                            _ipsDataContext.Tasks.Add(newTask);
                            _ipsDataContext.SaveChanges();
                        }
                    }
                }
                else
                {
                    {
                        Data.Task newTask = new Data.Task();

                        EvaluationParticipant evaluationParticipant = new EvaluationParticipant();
                        // get user id by participant id
                        EvaluationParticipantsService evaluationParticipantsService = new EvaluationParticipantsService();
                        evaluationParticipant = evaluationParticipantsService.GetEvaluationParticipantsById(evaluationAgreement.ParticipantId).FirstOrDefault();
                        newTask.AssignedToId = evaluationParticipant.UserId;
                        // check for categort List 
                        TaskCategoryListsService TaskCategoryListsService = new TaskCategoryListsService();

                        TaskCategoryList taskCategoryList = TaskCategoryListsService.GetUserlist(evaluationParticipant.UserId).FirstOrDefault();
                        if (taskCategoryList != null)
                        {
                            TaskCategoryListItem taskCategoryListItem = new TaskCategoryListItem();
                            taskCategoryListItem = taskCategoryList.TaskCategoryListItems.Where(x => x.Name.ToLower().Contains("kpi training") == true).FirstOrDefault();
                            if (taskCategoryListItem == null)
                            {
                                taskCategoryListItem = new TaskCategoryListItem();
                                taskCategoryListItem.Name = "KPI Training";
                                taskCategoryListItem.CategoryListId = taskCategoryList.Id;
                                taskCategoryListItem.Color = "#c3c3c3";
                                taskCategoryListItem.Description = "Default KPI Training";
                                taskCategoryListItem.TextColor = "#ffffff";
                                TaskCategoryListItemsService TaskCategoryListItemsService = new TaskCategoryListItemsService();
                                taskCategoryListItem = TaskCategoryListItemsService.Add(taskCategoryListItem);
                            }
                            newTask.CategoryId = taskCategoryListItem.Id;
                        }

                        AuthService authService = new AuthService();
                        IpsUser user = authService.getCurrentUser();
                        newTask.CreatedById = authService.GetCurrentUserId();
                        newTask.CreatedByName = user.FirstName + " " + user.LastName;
                        newTask.CreatedDate = DateTime.Now;
                        newTask.Description = "Auto " + training.Name + " Task";
                        //Get and Set Profile based on evaluationAgreement
                        StageGroupsService stageGroupsService = new StageGroupsService();
                        EvaluationAgreement evaluationAgreementInfo = _ipsDataContext.EvaluationAgreements.Include("Stage").Where(ea => ea.Id == evaluationAgreement.Id).FirstOrDefault();
                        StageGroup stageGroup = _ipsDataContext.StageGroups.Include("Profiles").Where(x => x.Id == evaluationAgreementInfo.Stage.StageGroupId).FirstOrDefault();
                        newTask.ProfileId = stageGroup.Profiles.FirstOrDefault().Id;

                        // Get And set Priority 
                        TaskPriorityListsService taskPriorityListsService = new TaskPriorityListsService();
                        TaskPriorityList taskPriorityList = taskPriorityListsService.GetUserlist(evaluationParticipant.UserId).FirstOrDefault();
                        newTask.PriorityId = taskPriorityList.TaskPriorityListItems.FirstOrDefault().Id;

                        TaskList taskList = _ipsDataContext.TaskLists.Where(x => x.UserId == evaluationParticipant.UserId).FirstOrDefault();
                        newTask.TaskListId = taskList.Id;

                        newTask.StartDate = training.StartDate;
                        newTask.DueDate = training.EndDate;
                        newTask.Title = training.Name + " Task Day  - " + ((DateTime)newTask.StartDate).ToString("MM/dd/yyyy");
                        newTask.StageId = evaluationAgreement.StageId;
                        newTask.TrainingId = training.Id;

                        _ipsDataContext.Tasks.Add(newTask);
                        _ipsDataContext.SaveChanges();
                    }

                }


            }

        }

    }

}

