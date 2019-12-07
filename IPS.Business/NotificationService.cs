using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using log4net;
using IPS.Business.Interfaces;
using IPS.Data;
using IPS.Business.Exceptions;
using IPS.BusinessModels.Entities;
using System.Configuration;
using IPS.Data.Enums;
using IPS.BusinessModels.TrainingDiaryModels;
using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.TrainingModels;
using IPS.Business.Utils;

namespace IPS.Business
{
    public class NotificationService : BaseService, INotificationService
    {
        private SMSNotification _smsNotification;
        private MailNotification _mailNotification;
        private EvaluationService _evaluationService;
        private PerformanceService performanceService; //Commented by Feng[21th/Jun/2017]: due previous developers' stupid way of instantiate NotificationService directly in IPSScheduler project, we can't use dependency injection to
                                                       //generate this performanceService from the constructor.

        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        private List<string> _macroses = new List<string>
        {
            "[ProfileName]",
            "[PersonName]",
            "[Stage]",
            "[SurveyURL]",
            "[KTSurveyURL]",
            "[TargetName]",
            "[UserName]",
            "[PassWord]",
            "[StartDate]",
            "[DueDate]"
        };
        private List<string> _evaluationMacroses = new List<string>
        {
            "[ProfileName]",
            "[PersonName]",
            "[Stage]",
            "[UserName]",
            "[StartDate]",
            "[DueDate]",
            "[UserEmail]",
            "[OrganizationName]",
            "[Participant]"
        };

        private List<string> _taskMacroses = new List<string>
        {
            "[Profile]",
            "[UserName]",
            "[Title]",
            "[StartDate]",
            "[DueDate]",
            "[UserEmail]",
            "[OrganizationName]",
            "[DueWithInTime]",
            "[LoginURL]",
        };
        private List<string> _customerTaskMacroses = new List<string>
        {
            "[CustomerName]",
            "[CustomerEmail]",
            "[CustomerMobile]",
            "[Title]",
            "[StartDate]",
            "[DueDate]",
            "[SalesMan]",
            "[SalesManEmail]",
            "[SalesManMobile]",
            "[OrganizationName]",
            "[OrganizationLogo]"
        };

        private List<string> _customerSalesAgreedMacroses = new List<string>
        {
            "[CustomerName]",
            "[CustomerEmail]",
            "[CustomerMobile]",
            "[Title]",
            "[TalkDate]",
            "[CurrentDate]",
            "[SalesMan]",
            "[SalesManEmail]",
            "[SalesManMobile]",
            "[OrganizationName]",
            "[OrganizationLogo]",
            "[List]"
        };
        private List<string> _stageResultMacroses = new List<string>
        {
            "[Profile]",
            "[CurrentMilestoneName]",
            "[SurveyURL]",
            "[KTSurveyURL]",
            "[Participant]",
            "[UserName]",
            "[UserEmail]",
            "[StartDate]",
            "[DueDate]",
            "[OrganizationName]",
            "[ParticipantName]",
            "[TimeSummary]",
            "[KPIScoreSummary]",
            "[OrganizationLogo]",
            "[LoginURL]",
            "[CurrentDate]",
        };

        private int? _evaluateeId = null;

        public NotificationService()
        {
            _smsNotification = new SMSNotification();
            _mailNotification = new MailNotification();
            _evaluationService = new EvaluationService();
            performanceService = new PerformanceService();
        }

        public void Notify(int? stageId, int? stageEvolutionId, int templateId)
        {
            Notify(stageId, stageEvolutionId, templateId, false);
        }

        private void Notify(int? stageId, int? stageEvolutionId, int templateId, bool IsInviteNotification)
        {
            var stage = SelectStage(stageId, stageEvolutionId);

            var template = SelectTemplate(templateId);

            var participants = (from e in _ipsDataContext.EvaluationParticipants
                                where e.StageGroupId == stage.StageGroup.Id
                                select e).ToList();

            SendNotification(stage, participants, template, IsInviteNotification);
        }

        public void Notify(int participantId, int? stageId, int? stageEvolutionId, int templateId)
        {
            Notify(participantId, stageId, stageEvolutionId, templateId, false);

        }

        public void Notify(int participantId, int? stageId, int? stageEvolutionId, int templateId, bool IsInviteNotification)
        {
            var stage = SelectStage(stageId, stageEvolutionId);

            var template = SelectTemplate(templateId);

            var participants = (from e in _ipsDataContext.EvaluationParticipants
                                where e.Id == participantId
                                select e).ToList();

            SendNotification(stage, participants, template, IsInviteNotification);

        }

        public void Notify(int[] participantIds, int? stageId, int? stageEvolutionId, int templateId)
        {
            var stage = SelectStage(stageId, stageEvolutionId);
            var template = SelectTemplate(templateId);
            var participants = (from e in _ipsDataContext.EvaluationParticipants
                                where participantIds.Contains(e.Id)
                                select e).ToList();
            SendNotification(stage, participants, template, true);
        }

        public string GetUICompleteMessage(int participantId, int? stageId, int? stageEvolutionId)
        {
            var stage = SelectStage(stageId, stageEvolutionId);
            var participant = stage.StageGroup.EvaluationParticipants.FirstOrDefault(ep => ep.Id == participantId);
            if (stage != null && participant != null)
            {
                return GetUIMessage(stage, participant, participant.EvaluationRoleId == (int)EvaluationRoleEnum.Participant ? stage.ExternalCompletedNotificationTemplateId : stage.EvaluatorCompletedNotificationTemplateId);
            }
            return string.Empty;
        }

        public string GetUIStartMessage(int participantId, int? stageId, int? stageEvolutionId)
        {
            var stage = SelectStage(stageId, stageEvolutionId);
            var participant = stage.StageGroup.EvaluationParticipants.FirstOrDefault(ep => ep.Id == participantId);
            if (stage != null && participant != null)
            {
                return GetUIMessage(stage, participant, participant.EvaluationRoleId == (int)EvaluationRoleEnum.Participant ? stage.ExternalStartNotificationTemplateId : stage.EvaluatorStartNotificationTemplateId);
            }
            return string.Empty;
        }

        private string GetUIMessage(IpsStageNotification stage, EvaluationParticipant participant, int? templateId)
        {
            string result = string.Empty;
            var profile = stage.StageGroup.Profiles.FirstOrDefault();
            var user = (from u in _ipsDataContext.Users
                        where participant.UserId == u.Id
                        select u).FirstOrDefault();
            if (user != null && profile != null)
            {
                var template = SelectTemplate(templateId);
                if (template != null)
                {
                    if (!string.IsNullOrEmpty(template.UIMessage))
                    {
                        var recepients = ParticipantsToRecepients(new List<EvaluationParticipant>() { participant }, profile, stage);
                        if (recepients.Count > 0)
                            result = ReplaceMacroses(template.UIMessage, recepients[0]);
                    }
                }
            }
            return result;
        }


        public void SendNotificationTemplatesOfStage(int? stageId, int? stageEvolutionId, int? participantTemplateId, int? evaluatorTemplateId, int? trainerTemplateId, int? managerTemplateId)
        {
            var stage = SelectStage(stageId, stageEvolutionId);
            var participants = stage.StageGroup.EvaluationParticipants.Where(ep => ep.IsLocked == false).ToList();

            SendStageNotification(stage, participantTemplateId, evaluatorTemplateId, trainerTemplateId, managerTemplateId, participants, false, true);
        }

        public void SendParticipantNotificationTemplatesOfStage(int stageId, int? stageEvolutionId, int? participantTemplateId, int? evaluatorTemplateId, int participantId)
        {
            var stage = SelectStage(stageId, stageEvolutionId);
            var participants = stage.StageGroup.EvaluationParticipants.Where(ep => ep.IsLocked == false && ep.UserId == participantId).ToList();
            if (participantTemplateId.HasValue)
            {
                SendStageNotification(stage, participantTemplateId, null, null, null, participants, false, true);
            }
            if (evaluatorTemplateId.HasValue)
            {
                SendStageNotification(stage, null, evaluatorTemplateId, null, null, participants, false, true);

            }
        }

        public void SendStartNewStageNotification(int? stageId, int? stageEvolutionId, bool toNotInvitedOnly)
        {
            var stage = SelectStage(stageId, stageEvolutionId);
            var participants = stage.StageGroup.EvaluationParticipants.Where(ep => ep.IsLocked == false).ToList();

            if (toNotInvitedOnly)
            {
                var filteredParticipants = new List<EvaluationParticipant>();
                foreach (var participant in participants)
                {
                    var hasToBeNotified = true;
                    if (participant.EvaluationStatuses != null && participant.EvaluationStatuses.Count > 0)
                    {
                        EvaluationStatus status = participant.EvaluationStatuses.FirstOrDefault(s => s.StageId == stageId);
                        if (status != null)
                        {
                            hasToBeNotified = !status.InvitedAt.HasValue || status.IsOpen;
                        }
                    }
                    if (hasToBeNotified)
                        filteredParticipants.Add(participant);
                }
                participants = filteredParticipants;
            }

            var recepients = SendStageNotification(
                stage,
                stage.ExternalStartNotificationTemplateId,
                stage.EvaluatorStartNotificationTemplateId,
                stage.TrainerStartNotificationTemplateId,
                stage.ManagerStartNotificationTemplateId,
                participants,
                false,
                true
                );

            if (recepients != null && recepients.Count > 0)
            {
                using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
                {
                    try
                    {
                        foreach (var recepient in recepients)
                        {
                            if ((recepient.IsEmailNotificationDelivered || recepient.IsSMSNotificationDelivered) && recepient.RecipientParticipantId > 0)
                            {
                                _evaluationService.SetEvaluationStatusInvited(recepient.NotifyAboutStage.StageId, recepient.NotifyAboutStage.StageEvolutionId, recepient.RecipientParticipantId, _ipsDataContext);
                            }
                        }

                        if (stageId.HasValue)
                        {
                            Stage updStage = _ipsDataContext.Stages.FirstOrDefault(s => s.Id == stageId);
                            updStage.InvitedAt = DateTime.Now;
                            _ipsDataContext.SaveChanges();
                        }

                        dbContextTransaction.Commit();
                    }
                    catch
                    {
                        dbContextTransaction.Rollback();
                        throw;
                    }
                }
            }
        }





        private List<NotificationRecipient> SendStageNotification(IpsStageNotification stage, int? participantTemplateId, int? evaluatorTemplateId, int? trainerTemplateId, int? managerTemplateId, List<EvaluationParticipant> evaluationParticipants, bool participantsWithSelfEvaluationOnly, bool ignoreAlreadyCompletedStage = false)
        {
            Profile profile = stage.StageGroup.Profiles.FirstOrDefault();
            var participantTemplate = SelectTemplate(participantTemplateId);
            var evaluatorTemplate = SelectTemplate(evaluatorTemplateId);
            var trainerTemplate = stage.TrainerId.HasValue ? SelectTemplate(trainerTemplateId) : null;
            var managerTemplate = stage.ManagerId.HasValue ? SelectTemplate(managerTemplateId) : null;
            List<NotificationRecipient> allRecepients = new List<NotificationRecipient>();

            if (trainerTemplate != null)
            {
                VerifyTemplate(trainerTemplate, stage.EmailNotification, stage.SMSNotification);
                User recipientUser = _ipsDataContext.Users
                    .Include("Organization")
                    .Where(u => u.Id == stage.TrainerId).AsNoTracking().FirstOrDefault();
                NotificationRecipient trainer = new NotificationRecipient
                {
                    RecipientUser = recipientUser,
                    NotifyAboutProfile = profile,
                    NotifyAboutUser = null,
                    NotifyAboutStage = stage,
                    RecipientParticipantId = 0,
                    SendEmail = stage.EmailNotification,
                    SendSMS = stage.SMSNotification,
                };

                System.Threading.Tasks.Task.Factory.StartNew(() =>
                {
                    SendNotification(new List<NotificationRecipient> { trainer }, trainerTemplate);
                });

                allRecepients.Add(trainer);
            }

            if (managerTemplate != null)
            {
                VerifyTemplate(managerTemplate, stage.EmailNotification, stage.SMSNotification);
                User managerUser = _ipsDataContext.Users
                    .Include("Organization")
                    .Where(u => u.Id == stage.ManagerId).AsNoTracking().FirstOrDefault();
                NotificationRecipient manager = new NotificationRecipient
                {
                    RecipientUser = managerUser,
                    NotifyAboutProfile = profile,
                    NotifyAboutUser = null,
                    NotifyAboutStage = stage,
                    RecipientParticipantId = 0,
                    SendEmail = stage.EmailNotification,
                    SendSMS = stage.SMSNotification,
                };

                System.Threading.Tasks.Task.Factory.StartNew(() =>
                {
                    SendNotification(new List<NotificationRecipient> { manager }, managerTemplate);
                });

                allRecepients.Add(manager);
            }

            if (participantTemplate != null)
            {
                var participants = participantsWithSelfEvaluationOnly ?
                    evaluationParticipants.Where(e => e.EvaluationRoleId == (int)EvaluationRoleEnum.Participant && e.IsSelfEvaluation == true).ToList() :
                    evaluationParticipants.Where(e => e.EvaluationRoleId == (int)EvaluationRoleEnum.Participant).ToList();

                if (ignoreAlreadyCompletedStage)
                {
                    if (stage.StageId.HasValue) //Commented by Feng[21st/Jun/2017]: the completed one is a stage.
                    {
                        int index;
                        int count = participants.Count;

                        for (index = 0; index < count; index++)
                        {
                            IpsUserProfiles profiles = performanceService.GetUserProfiles(participants[index].UserId);
                            if (profiles.ActiveProfiles.Any(x => x.Stage.Id == stage.StageId && x.IsSurveyPassed == true))
                            {
                                participants.RemoveAt(index);
                                index--;
                                count--;
                            }
                            else if (profiles.CompletedProfiles.Any(p => p.Stage.Id == stage.StageId) || profiles.History.Any(p => p.Stage.Id == stage.StageId))
                            {
                                participants.RemoveAt(index);
                                index--;
                                count--;
                            }
                            else if (profiles.ActiveProfiles.Any(x => x.Stage.Id == stage.StageId && x.IsBlocked == true))
                            {
                                participants.RemoveAt(index);
                                index--;
                                count--;
                            }
                        }
                    }
                    else
                    {
                        if (stage.StageEvolutionId.HasValue) //Commented by Feng[21st/Jun/2017]: the completed one is a KT stage evolution. (Stupid idea from the previous developers to separate KT stage evolution from stage. Completely unnecessary and make much more codes.)
                        {
                            int index;
                            int count = participants.Count;

                            for (index = 0; index < count; index++)
                            {
                                IpsUserProfiles profiles = performanceService.GetUserProfiles(participants[index].UserId);

                                if (profiles.CompletedProfiles.Any(p => p.Stage.StageEvolutionId == stage.StageEvolutionId) || profiles.History.Any(p => p.Stage.StageEvolutionId == stage.StageEvolutionId))
                                {
                                    participants.RemoveAt(index);
                                    index--;
                                    count--;
                                }
                            }
                        }
                    }
                }

                var recepients = ParticipantsToRecepients(participants, profile, stage);

                System.Threading.Tasks.Task.Factory.StartNew(() =>
                {
                    SendNotification(recepients, participantTemplate);
                });

                allRecepients.AddRange(recepients);
            }

            if (evaluatorTemplate != null)
            {
                var participants = evaluationParticipants.Where(e => e.EvaluationRoleId == (int)EvaluationRoleEnum.Evaluator).ToList();

                if (ignoreAlreadyCompletedStage)
                {
                    if (stage.StageId.HasValue) //Commented by Feng[21st/Jun/2017]: the completed one is a stage.
                    {
                        int index;
                        int count = participants.Count;

                        for (index = 0; index < count; index++)
                        {
                            IpsUserProfiles profiles = performanceService.GetUserProfiles(participants[index].UserId);

                            if (profiles.ActiveProfiles.Any(x => x.Stage.Id == stage.StageId && x.IsSurveyPassed == true))
                            {
                                participants.RemoveAt(index);
                                index--;
                                count--;
                            }
                            else if (profiles.CompletedProfiles.Any(p => p.Stage.Id == stage.StageId) || profiles.History.Any(p => p.Stage.Id == stage.StageId))
                            {
                                participants.RemoveAt(index);
                                index--;
                                count--;
                            }
                        }
                    }
                    else
                    {
                        if (stage.StageEvolutionId.HasValue) //Commented by Feng[21st/Jun/2017]: the completed one is a KT stage evolution. (Stupid idea from the previous developers to separate KT stage evolution from stage. Completely unnecessary and make much more codes.)
                        {
                            int index;
                            int count = participants.Count;

                            for (index = 0; index < count; index++)
                            {
                                IpsUserProfiles profiles = performanceService.GetUserProfiles(participants[index].UserId);

                                if (profiles.CompletedProfiles.Any(p => p.Stage.StageEvolutionId == stage.StageEvolutionId) || profiles.History.Any(p => p.Stage.StageEvolutionId == stage.StageEvolutionId))
                                {
                                    participants.RemoveAt(index);
                                    index--;
                                    count--;
                                }
                            }
                        }
                    }
                }

                var recepients = ParticipantsToRecepients(participants, profile, stage);

                System.Threading.Tasks.Task.Factory.StartNew(() =>
                {
                    SendNotification(recepients, evaluatorTemplate);
                });

                allRecepients.AddRange(recepients);
            }



            return allRecepients;
        }

        private List<NotificationRecipient> ParticipantsToRecepients(List<EvaluationParticipant> participants, Profile profile, IpsStageNotification stage)
        {
            List<NotificationRecipient> recipients = new List<NotificationRecipient>();
            List<int> userIds = new List<int>();
            foreach (var participant in participants)
            {
                userIds.Add(participant.UserId);
                if (participant.EvaluationParticipant1 != null)
                    userIds.Add(participant.EvaluationParticipant1.UserId);
            }
            List<User> users = new List<User>();
            if (userIds.Count > 0)
            {
                users = _ipsDataContext.Users.Where(u => userIds.Contains(u.Id)).AsNoTracking().ToList();
            }
            foreach (var participant in participants)
            {
                recipients.Add(
                    new NotificationRecipient
                    {
                        RecipientUser = users.FirstOrDefault(u => u.Id == participant.UserId),
                        NotifyAboutProfile = profile,
                        NotifyAboutUser = participant.EvaluationParticipant1 != null ? users.FirstOrDefault(u => u.Id == participant.EvaluationParticipant1.UserId) : null,
                        NotifyAboutStage = stage,
                        RecipientParticipantId = participant.Id,
                        SendEmail = stage.EmailNotification,
                        SendSMS = stage.SMSNotification,
                    }
                );
            }
            return recipients;
        }



        public void SendTaskEmailNotification(int taskId)
        {
            var task = SelectTask(taskId);
            var recepients = SendTaskEmailNotification(task);
        }
        private List<TaskNotificationRecipient> SendTaskEmailNotification(Task task)
        {
            List<TaskNotificationRecipient> allRecepients = new List<TaskNotificationRecipient>();
            var taskTemplate = SelectTaskTemplate(task.NotificationTemplateId);

            if (taskTemplate != null)
            {
                VerifyTemplate(taskTemplate, task.IsEmailNotification, task.IsSMSNotification);

                User recipientUser = _ipsDataContext.Users
                    .Include("Organization")
                    .Where(u => u.Id == task.AssignedToId).AsNoTracking().FirstOrDefault();
                User trainerUser = _ipsDataContext.Users
                    .Include("Organization")
                    .Where(u => u.Id == task.CreatedById).AsNoTracking().FirstOrDefault();
                TaskNotificationRecipient taskUser = new TaskNotificationRecipient
                {
                    RecipientUser = recipientUser,
                    TrainerUser = trainerUser,
                    Task = task,
                    SendEmail = task.IsEmailNotification,
                    SendSMS = false,
                };
                System.Threading.Tasks.Task.Factory.StartNew(() =>
                {
                    TaskSendNotification(new List<TaskNotificationRecipient> { taskUser }, taskTemplate);
                });

                allRecepients.Add(taskUser);
            }

            return allRecepients;
        }

        public void SendTaskSMSNotification(int taskId)
        {
            var task = SelectTask(taskId);
            var recepients = SendTaskSMSNotification(task);
        }
        private List<TaskNotificationRecipient> SendTaskSMSNotification(Task task)
        {
            List<TaskNotificationRecipient> allRecepients = new List<TaskNotificationRecipient>();
            var taskTemplate = SelectTaskTemplate(task.NotificationTemplateId);

            if (taskTemplate != null)
            {
                VerifyTemplate(taskTemplate, task.IsEmailNotification, task.IsSMSNotification);
                User recipientUser = _ipsDataContext.Users.Where(u => u.Id == task.AssignedToId).AsNoTracking().FirstOrDefault();
                User trainerUser = _ipsDataContext.Users.Where(u => u.Id == task.CreatedById).AsNoTracking().FirstOrDefault();
                //User trainerUser = _ipsDataContext.Users.Where(u => u.Id == task.AssignedToId).AsNoTracking().FirstOrDefault();
                TaskNotificationRecipient taskUser = new TaskNotificationRecipient
                {
                    RecipientUser = recipientUser,
                    TrainerUser = trainerUser,
                    Task = task,
                    SendEmail = false,
                    SendSMS = task.IsSMSNotification,
                };

                System.Threading.Tasks.Task.Factory.StartNew(() =>
                {
                    TaskSendNotification(new List<TaskNotificationRecipient> { taskUser }, taskTemplate);
                });

                allRecepients.Add(taskUser);
            }

            return allRecepients;
        }

        private void TaskSendNotification(List<TaskNotificationRecipient> recipients, NotificationTemplate template)
        {
            if (recipients.Count > 0)
            {
                foreach (var recipient in recipients)
                {
                    recipient.IsEmailNotificationDelivered = false;
                    if (recipient.SendEmail)
                    {
                        try
                        {
                            SendTaskEmailNotification(recipient, template);
                            recipient.IsEmailNotificationDelivered = true;
                            Log.Debug(String.Format("Send email to participant with Id {0}, name {1} {2} successful", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName));
                        }
                        catch (Exception ex)
                        {
                            Log.Error(String.Format("Send email to participant with Id {0}, name {1} {2} failed", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                    }
                    recipient.IsSMSNotificationDelivered = false;
                    if (recipient.SendSMS)
                    {
                        try
                        {
                            SendTaskSMSNotification(recipient, template);
                            recipient.IsSMSNotificationDelivered = true;
                            Log.Debug(String.Format("Send sms to participant with Id {0}, name {1} {2} successful", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName));
                        }
                        catch (TwilioException ex)
                        {
                            Log.Error(String.Format("Send sms to participant with Id {0}, name {1} {2} failed", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                        catch (Exception ex)
                        {
                            Log.Error(String.Format("Send sms to participant with Id {0}, name {1} {2} failed", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                    }
                }
            }
        }

        public void SendTrainingEmailNotification(int trainingId, int userId, string trainingType, DateTime start, DateTime end)
        {
            var training = SelectTraining(trainingId, userId);
            training.StartDate = start;
            training.EndDate = end;
            var recepients = SendTrainingEmailNotification(training, trainingType);
        }
        private List<TrainingNotificationRecipient> SendTrainingEmailNotification(Training training, string trainingType)
        {
            List<TrainingNotificationRecipient> allRecepients = new List<TrainingNotificationRecipient>();
            var taskTemplate = SelectTrainingTemplate(training.NotificationTemplateId, trainingType);

            if (taskTemplate != null)
            {
                VerifyTemplate(taskTemplate, training.IsNotificationByEmail, training.IsNotificationBySMS);

                User recipientUser = _ipsDataContext.Users
                    .Include("Organization")
                    .Where(u => u.Id == training.UserId).AsNoTracking().FirstOrDefault();
                //User trainerUser = _ipsDataContext.Users.Include("Organization").Where(u => u.Id == training.ec).AsNoTracking().FirstOrDefault();
                TrainingNotificationRecipient taskUser = new TrainingNotificationRecipient
                {
                    RecipientUser = recipientUser,
                    //TrainerUser = trainerUser,
                    Training = training,
                    SendEmail = training.IsNotificationByEmail,
                    SendSMS = false,
                };
                System.Threading.Tasks.Task.Factory.StartNew(() =>
                {
                    TrainingSendNotification(new List<TrainingNotificationRecipient> { taskUser }, taskTemplate);
                });

                allRecepients.Add(taskUser);
            }

            return allRecepients;
        }

        public bool EvalutionReminderNotificaition(int profileId, int stageid, int participantId)
        {
            Profile profile = _ipsDataContext.Profiles.Where(x => x.Id == profileId).FirstOrDefault();

            bool issent = PushEvalutionReminderNotificaition(profile, stageid, participantId);
            if (issent)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        public bool PushEvalutionReminderNotificaition(Profile profile, int stageid, int evaluationParticipantId)
        {
            // 
            IpsUser ipsUser = _authService.getCurrentUser();
            User user = _ipsDataContext.Users.Where(x => x.UserKey == ipsUser.Id).FirstOrDefault();
            if (user != null)
            {
                NotificationTemplate template = _ipsDataContext.NotificationTemplates.Where(x => x.Name == "Evaluator Evaluation Reminder Notification").FirstOrDefault();
                var stage = SelectStage(stageid, null);
                EvaluationParticipant evaluationParticipant = _ipsDataContext.EvaluationParticipants.Where(x => x.Id == evaluationParticipantId).FirstOrDefault();
                SendEvalutionReminderEmailNotification(user, evaluationParticipant, template, stage);
                return true;
            }
            return false;
        }

        public void SendEvalutionReminderEmailNotification(User participant, EvaluationParticipant evaluationParticipant, NotificationTemplate template, IpsStageNotification stage)
        {
            if (!string.IsNullOrWhiteSpace(template.EmailSubject) && !string.IsNullOrWhiteSpace(template.EmailBody))
            {
                IpsAddress emailAddress = new IpsAddress();
                IpsMessage emailMessage = new IpsMessage();

                User evaluator = participant;

                if (evaluationParticipant.IsSelfEvaluation != true)
                {
                    evaluator = _ipsDataContext.Users.Where(x => x.Id == evaluationParticipant.UserId).FirstOrDefault();
                }

                emailAddress.Address = new List<string>
                {
                    evaluator.WorkEmail
                };

                emailMessage.Subject = ReplaceEvalutionMacroses(template.EmailSubject, evaluator, participant, stage);
                emailMessage.Message = ReplaceEvalutionMacroses(template.EmailBody, evaluator, participant, stage);
                _mailNotification.Send(emailAddress, emailMessage);
            }
        }


        public bool PushTrainingEmailNotification(int trainingId, int userId, string trainingType)
        {
            var training = SelectTraining(trainingId, userId);
            var recepients = PushTrainingEmailNotification(training, trainingType);
            if (recepients.Count() > 0)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        private List<TrainingNotificationRecipient> PushTrainingEmailNotification(Training training, string trainingType)
        {
            List<TrainingNotificationRecipient> allRecepients = new List<TrainingNotificationRecipient>();
            var taskTemplate = SelectTrainingTemplate(training.NotificationTemplateId, trainingType);

            if (taskTemplate != null)
            {
                VerifyTemplate(taskTemplate, training.IsNotificationByEmail, training.IsNotificationBySMS);

                User recipientUser = _ipsDataContext.Users
                    .Include("Organization")
                    .Where(u => u.Id == training.UserId).AsNoTracking().FirstOrDefault();
                //User trainerUser = _ipsDataContext.Users.Include("Organization").Where(u => u.Id == training.ec).AsNoTracking().FirstOrDefault();
                TrainingNotificationRecipient taskUser = new TrainingNotificationRecipient
                {
                    RecipientUser = recipientUser,
                    //TrainerUser = trainerUser,
                    Training = training,
                    SendEmail = true,
                    SendSMS = false,
                };
                bool ismailSent = PushSendNotification(new List<TrainingNotificationRecipient> { taskUser }, taskTemplate);
                if (ismailSent)
                {
                    allRecepients.Add(taskUser);
                }
            }

            return allRecepients;
        }
        private bool PushSendNotification(List<TrainingNotificationRecipient> recipients, NotificationTemplate template)
        {
            bool result = false;
            if (recipients.Count > 0)
            {
                foreach (var recipient in recipients)
                {
                    recipient.IsEmailNotificationDelivered = false;
                    if (recipient.SendEmail)
                    {
                        try
                        {
                            //template.EmailSubject = "Auto Test " + template.EmailSubject;
                            SendTrainingEmailNotification(recipient, template);
                            recipient.IsEmailNotificationDelivered = true;
                            result = true;
                            Log.Debug(String.Format("Send email to participant with Id {0}, name {1} {2} successful", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName));
                        }
                        catch (Exception ex)
                        {
                            Log.Error(String.Format("Send email to participant with Id {0}, name {1} {2} failed", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                    }
                    recipient.IsSMSNotificationDelivered = false;
                    if (recipient.SendSMS)
                    {
                        try
                        {
                            SendTrainingSMSNotification(recipient, template);
                            recipient.IsSMSNotificationDelivered = true;
                            Log.Debug(String.Format("Send sms to participant with Id {0}, name {1} {2} successful", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName));
                        }
                        catch (TwilioException ex)
                        {
                            Log.Error(String.Format("Send sms to participant with Id {0}, name {1} {2} failed", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                        catch (Exception ex)
                        {
                            Log.Error(String.Format("Send sms to participant with Id {0}, name {1} {2} failed", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                    }
                }
            }
            return result;
        }

        public void SendTrainingSMSNotification(int trainingId, int userId)
        {
            var training = SelectTraining(trainingId, userId);
            var recepients = SendTrainingSMSNotification(training);
        }
        private List<TrainingNotificationRecipient> SendTrainingSMSNotification(Training training)
        {
            List<TrainingNotificationRecipient> allRecepients = new List<TrainingNotificationRecipient>();
            var taskTemplate = SelectTemplate(training.NotificationTemplateId);

            if (taskTemplate != null)
            {
                VerifyTemplate(taskTemplate, training.IsNotificationByEmail, training.IsNotificationBySMS);
                User recipientUser = _ipsDataContext.Users.Where(u => u.Id == training.UserId).AsNoTracking().FirstOrDefault();
                //User trainerUser = _ipsDataContext.Users.Where(u => u.Id == training.ec).AsNoTracking().FirstOrDefault();
                TrainingNotificationRecipient taskUser = new TrainingNotificationRecipient
                {
                    RecipientUser = recipientUser,
                    //TrainerUser = trainerUser,
                    Training = training,
                    SendEmail = false,
                    SendSMS = training.IsNotificationBySMS,
                };
                System.Threading.Tasks.Task.Factory.StartNew(() =>
                {
                    TrainingSendNotification(new List<TrainingNotificationRecipient> { taskUser }, taskTemplate);
                });

                allRecepients.Add(taskUser);
            }

            return allRecepients;
        }

        private void TrainingSendNotification(List<TrainingNotificationRecipient> recipients, NotificationTemplate template)
        {
            if (recipients.Count > 0)
            {
                foreach (var recipient in recipients)
                {
                    recipient.IsEmailNotificationDelivered = false;
                    if (recipient.SendEmail)
                    {
                        try
                        {
                            //template.EmailSubject = "Auto Test " + template.EmailSubject;
                            SendTrainingEmailNotification(recipient, template);
                            recipient.IsEmailNotificationDelivered = true;
                            Log.Debug(String.Format("Send email to participant with Id {0}, name {1} {2} successful", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName));
                        }
                        catch (Exception ex)
                        {
                            Log.Error(String.Format("Send email to participant with Id {0}, name {1} {2} failed", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                    }
                    recipient.IsSMSNotificationDelivered = false;
                    if (recipient.SendSMS)
                    {
                        try
                        {
                            SendTrainingSMSNotification(recipient, template);
                            recipient.IsSMSNotificationDelivered = true;
                            Log.Debug(String.Format("Send sms to participant with Id {0}, name {1} {2} successful", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName));
                        }
                        catch (TwilioException ex)
                        {
                            Log.Error(String.Format("Send sms to participant with Id {0}, name {1} {2} failed", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                        catch (Exception ex)
                        {
                            Log.Error(String.Format("Send sms to participant with Id {0}, name {1} {2} failed", recipient.RecipientUser.Id, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                    }
                }
            }
        }

        public void SendCompleteNotification(int participantId, int? stageId, int? stageEvolutionId)
        {
            var stage = SelectStage(stageId, stageEvolutionId);
            var participants = stage.StageGroup.EvaluationParticipants.Where(ep => ep.IsLocked == false).ToList();
            var filteredParticipants = participants.Where(p => p.EvaluateeId == participantId).ToList();
            var evaluatee = participants.FirstOrDefault(p => p.Id == participantId);
            if (evaluatee != null)
                filteredParticipants.Add(evaluatee);
            SendStageNotification(
                stage,
                stage.ExternalCompletedNotificationTemplateId,
                stage.EvaluatorCompletedNotificationTemplateId,
                stage.TrainerCompletedNotificationTemplateId,
                stage.ManagerCompletedNotificationTemplateId,
                filteredParticipants,
                false
                );
        }

        public void SendResultsNotification(int participantId, int? stageId, int? stageEvolutionId)
        {
            var stage = SelectStage(stageId, stageEvolutionId);
            var participants = stage.StageGroup.EvaluationParticipants.Where(ep => ep.IsLocked == false).ToList();
            var filteredParticipants = participants.Where(p => p.EvaluateeId == participantId).ToList();
            var evaluatee = participants.FirstOrDefault(p => p.Id == participantId);
            if (evaluatee != null)
                filteredParticipants.Add(evaluatee);
            SendStageNotification(
                stage,
                stage.ExternalResultsNotificationTemplateId,
                stage.EvaluatorResultsNotificationTemplateId,
                stage.TrainerResultsNotificationTemplateId,
                stage.ManagerResultsNotificationTemplateId,
                filteredParticipants,
                false
            );
        }

        public void NotifyByUserId(int userId, int? stageId, int? stageEvolutionId, int templateId)
        {
            NotifyByUserId(userId, stageId, stageEvolutionId, templateId, null);
        }

        public void NotifyByUserId(int userId, int? stageId, int? stageEvolutionId, int templateId, EvaluationParticipant notifyAbout)
        {
            var stage = SelectStage(stageId, stageEvolutionId);
            _evaluateeId = notifyAbout.Id;

            var template = SelectTemplate(templateId);

            User user = new User();

            if (stage.EmailNotification || stage.SMSNotification)
            {
                user = (from u in _ipsDataContext.Users
                        where u.Id == userId
                        select u).FirstOrDefault();
            }

            if (stage.EmailNotification)
            {
                SendEmailNotification(user, notifyAbout, template, stage);
            }

            if (stage.SMSNotification)
            {
                SendSMSNotification(user, notifyAbout, template, stage);
            }
        }

        private IpsStageNotification SelectStage(int? stageId, int? stageEvolutionId)
        {
            IpsStageNotification stage = new IpsStageNotification();
            if (stageEvolutionId.HasValue)
            {
                var foundStage = _ipsDataContext.StagesEvolutions
                    .Include(x => x.Stage.StageGroup.EvaluationParticipants.Select(e => e.EvaluationParticipant1))
                    .Include(x => x.Stage.StageGroup.EvaluationParticipants.Select(e => e.EvaluationStatuses))
                    .Include(x => x.Stage.StageGroup.Profiles)
                    .Where(x => x.Id == stageEvolutionId.Value)
                    .FirstOrDefault();
                stage.StageEvolutionId = foundStage.Id;
                stage.EmailNotification = foundStage.Stage.EmailNotification;
                stage.SMSNotification = foundStage.Stage.SMSNotification;
                stage.StageGroup = foundStage.Stage.StageGroup;
                stage.EvaluatorCompletedNotificationTemplateId = foundStage.Stage.EvaluatorCompletedNotificationTemplateId;
                stage.EvaluatorStartNotificationTemplateId = foundStage.Stage.EvaluatorStartNotificationTemplateId;
                stage.ExternalCompletedNotificationTemplateId = foundStage.Stage.ExternalCompletedNotificationTemplateId;
                stage.ExternalStartNotificationTemplateId = foundStage.Stage.ExternalStartNotificationTemplateId;
                stage.StartDate = foundStage.StartDate;
                stage.DueDate = foundStage.DueDate;
                stage.EvaluatorResultsNotificationTemplateId = foundStage.Stage.EvaluatorResultsNotificationTemplateId;
                stage.ExternalResultsNotificationTemplateId = foundStage.Stage.ExternalResultsNotificationTemplateId;
                stage.ManagerCompletedNotificationTemplateId = foundStage.Stage.ManagerCompletedNotificationTemplateId;
                stage.ManagerId = foundStage.Stage.ManagerId;
                stage.ManagerResultsNotificationTemplateId = foundStage.Stage.ManagerResultsNotificationTemplateId;
                stage.ManagerStartNotificationTemplateId = foundStage.Stage.ManagerStartNotificationTemplateId;
                stage.Name = foundStage.Name;
                stage.TrainerCompletedNotificationTemplateId = foundStage.Stage.TrainerCompletedNotificationTemplateId;
                stage.TrainerId = foundStage.Stage.TrainerId;
                stage.TrainerResultsNotificationTemplateId = foundStage.Stage.TrainerResultsNotificationTemplateId;
                stage.TrainerStartNotificationTemplateId = foundStage.Stage.TrainerStartNotificationTemplateId;
            }
            else
            {
                var foundStage = _ipsDataContext.Stages
                    .Include(x => x.StageGroup.EvaluationParticipants)
                    .Include(x => x.StageGroup.EvaluationParticipants.Select(e => e.EvaluationParticipant1))
                    .Include(x => x.StageGroup.EvaluationParticipants.Select(e => e.EvaluationStatuses))
                    .Include(x => x.StageGroup.Profiles)
                    .Where(s => s.Id == stageId)
                    .AsNoTracking()
                    .FirstOrDefault();
                stage.StageId = foundStage.Id;
                stage.EmailNotification = foundStage.EmailNotification;
                stage.SMSNotification = foundStage.SMSNotification;
                stage.StageGroup = foundStage.StageGroup;
                stage.EvaluatorCompletedNotificationTemplateId = foundStage.EvaluatorCompletedNotificationTemplateId;
                stage.EvaluatorStartNotificationTemplateId = foundStage.EvaluatorStartNotificationTemplateId;
                stage.ExternalCompletedNotificationTemplateId = foundStage.ExternalCompletedNotificationTemplateId;
                stage.ExternalStartNotificationTemplateId = foundStage.ExternalStartNotificationTemplateId;
                stage.StartDate = foundStage.StartDateTime;
                stage.ManagerResultsNotificationTemplateId = foundStage.ManagerResultsNotificationTemplateId;
                stage.ManagerStartNotificationTemplateId = foundStage.ManagerStartNotificationTemplateId;
                stage.Name = foundStage.Name;
                stage.TrainerCompletedNotificationTemplateId = foundStage.TrainerCompletedNotificationTemplateId;
                stage.TrainerId = foundStage.TrainerId;
                stage.TrainerResultsNotificationTemplateId = foundStage.TrainerResultsNotificationTemplateId;
                stage.TrainerStartNotificationTemplateId = foundStage.TrainerStartNotificationTemplateId;
                stage.DueDate = foundStage.EndDateTime;
                stage.EvaluatorResultsNotificationTemplateId = foundStage.EvaluatorResultsNotificationTemplateId;
                stage.ExternalResultsNotificationTemplateId = foundStage.ExternalResultsNotificationTemplateId;
                stage.ManagerCompletedNotificationTemplateId = foundStage.ManagerCompletedNotificationTemplateId;
                stage.ManagerId = foundStage.ManagerId;
            }
            return stage;
        }

        private Task SelectTask(int taskId)
        {
            Task task = new Task();
            if (taskId > 0)
            {
                task = _ipsDataContext.Tasks.Include("NotificationTemplate").Where(x => x.Id == taskId).FirstOrDefault();
            }
            return task;
        }

        private Training SelectTraining(int taskId, int userId)
        {
            Training training = new Training();
            if (taskId > 0)
            {
                training = _ipsDataContext.Trainings
                    .Include("EvaluationAgreements")
                    .Include("EvaluationAgreements.Stage")
                    .Include("EvaluationAgreements.Stage.StageGroup")
                    .Include("EvaluationAgreements.Stage.StageGroup.Profiles")
                    .Include("Link_PerformanceGroupSkills")
                    .Include("Link_PerformanceGroupSkills.PerformanceGroup")
                    .Include("Link_PerformanceGroupSkills.PerformanceGroup.Profile")
                    .Where(x => x.Id == taskId).FirstOrDefault();
                training.UserId = userId;
            }
            return training;
        }

        private NotificationTemplate SelectTemplate(int? templateId)
        {
            if (templateId.HasValue)
                return (from t in _ipsDataContext.NotificationTemplates
                        .Include("Culture")
                        where t.Id == templateId
                        select t).FirstOrDefault();
            return null;
        }
        private NotificationTemplate SelectTaskTemplate(int? templateId)
        {
            if (templateId.HasValue)
            {
                return (from t in _ipsDataContext.NotificationTemplates
                        where t.Id == templateId
                        select t).FirstOrDefault();
            }
            else
            {
                return (from t in _ipsDataContext.NotificationTemplates
                        where t.Name.Contains("Task Reminder Notification") == true
                        select t).FirstOrDefault();
            }
        }
        private NotificationTemplate SelectTrainingTemplate(int? templateId, string trainingType)
        {
            if (trainingType == "Profile")
            {
                if (templateId.HasValue)
                {
                    return (from t in _ipsDataContext.NotificationTemplates
                            where t.Id == templateId
                            select t).FirstOrDefault();
                }
                else
                {
                    return (from t in _ipsDataContext.NotificationTemplates
                            where t.Name.Contains("Profile Training Reminder Notification") == true
                            select t).FirstOrDefault();
                }
            }
            else
            {
                if (templateId.HasValue)
                {
                    return (from t in _ipsDataContext.NotificationTemplates
                            where t.Id == templateId
                            select t).FirstOrDefault();
                }
                else
                {
                    return (from t in _ipsDataContext.NotificationTemplates
                            where t.Name.Contains("Personal Training Reminder Notification") == true
                            select t).FirstOrDefault();
                }

            }
        }

        private void VerifyTemplate(NotificationTemplate template, bool verifyEmail, bool verifySMS)
        {
            if (verifyEmail && (String.IsNullOrWhiteSpace(template.EmailSubject) || String.IsNullOrWhiteSpace(template.EmailBody)))
                throw new Exception("Email Subject or/and Email Body is not defined in the template " + template.Name);
            if (verifySMS && String.IsNullOrWhiteSpace(template.SMSMessage))
                throw new Exception("SMS Message is not defined in the template " + template.Name);
        }

        private void SendNotification(IpsStageNotification stage, List<EvaluationParticipant> participants, NotificationTemplate template, bool isInvite)
        {

            if (participants.Count > 0)
            {
                User user = new User();

                foreach (var participant in participants)
                {
                    bool isSent = false;
                    if (stage.EmailNotification || stage.SMSNotification)
                    {
                        user = (from u in _ipsDataContext.Users
                                where u.Id == participant.UserId
                                select u).FirstOrDefault();
                        SetEvaluateeId(participant);
                    }

                    if (stage.EmailNotification && !string.IsNullOrWhiteSpace(template.EmailBody) && !string.IsNullOrWhiteSpace(template.EmailSubject))
                    {
                        try
                        {
                            SendEmailNotification(user, participant, template, stage);
                            isSent = true;
                            Log.Debug(String.Format("Send email to participant with Id {0}, name {1} {2} successful", participant.Id, user.FirstName, user.LastName));
                        }
                        catch (Exception ex)
                        {
                            Log.Error(String.Format("Send email to participant with Id {0}, name {1} {2} failed", participant.Id, user.FirstName, user.LastName), ex);
                        }
                    }

                    if (stage.SMSNotification && !String.IsNullOrWhiteSpace(template.SMSMessage))
                    {
                        try
                        {
                            SendSMSNotification(user, participant, template, stage);
                            isSent = true;
                            Log.Debug(String.Format("Send sms to participant with Id {0}, name {1} {2} successful", participant.Id, user.FirstName, user.LastName));
                        }
                        catch (TwilioException ex)
                        {
                            Log.Error(String.Format("Send sms to participant with Id {0}, name {1} {2} failed", participant.Id, user.FirstName, user.LastName), ex);
                        }
                        catch (Exception ex)
                        {
                            Log.Error(String.Format("Send sms to participant with Id {0}, name {1} {2} failed", participant.Id, user.FirstName, user.LastName), ex);
                        }
                    }

                    if (isSent && isInvite)
                    {
                        _evaluationService.SetEvaluationStatusInvited(stage.StageId, stage.StageEvolutionId, participant.Id);
                    }
                }

                if ((stage.EmailNotification || stage.SMSNotification) && isInvite)
                {
                    SetInvitedTime(participants);
                }
            }
        }

        private void SendNotification(List<NotificationRecipient> recipients, NotificationTemplate template)
        {
            if (recipients.Count > 0)
            {
                foreach (var recipient in recipients)
                {
                    recipient.IsEmailNotificationDelivered = false;
                    if (recipient.SendEmail)
                    {
                        try
                        {
                            SendEmailNotification(recipient, template);
                            recipient.IsEmailNotificationDelivered = true;
                            Log.Debug(String.Format("Send email to participant with Id {0}, name {1} {2} successful", recipient.RecipientParticipantId, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName));
                        }
                        catch (Exception ex)
                        {
                            Log.Error(String.Format("Send email to participant with Id {0}, name {1} {2} failed", recipient.RecipientParticipantId, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                    }
                    recipient.IsSMSNotificationDelivered = false;
                    if (recipient.SendSMS)
                    {
                        try
                        {
                            SendSMSNotification(recipient, template);
                            recipient.IsSMSNotificationDelivered = true;
                            Log.Debug(String.Format("Send sms to participant with Id {0}, name {1} {2} successful", recipient.RecipientParticipantId, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName));
                        }
                        catch (TwilioException ex)
                        {
                            Log.Error(String.Format("Send sms to participant with Id {0}, name {1} {2} failed", recipient.RecipientParticipantId, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                        catch (Exception ex)
                        {
                            Log.Error(String.Format("Send sms to participant with Id {0}, name {1} {2} failed", recipient.RecipientParticipantId, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                    }
                }
            }
        }

        private void SetEvaluateeId(EvaluationParticipant participant)
        {
            if (participant.EvaluateeId != null)
            {
                _evaluateeId = participant.EvaluateeId;
            }
            else
            {
                _evaluateeId = null;
            }
        }

        public void SendEmailNotification(User user, EvaluationParticipant participant, NotificationTemplate template, IpsStageNotification stage)
        {
            if (!string.IsNullOrWhiteSpace(template.EmailSubject) && !string.IsNullOrWhiteSpace(template.EmailBody))
            {
                IpsAddress emailAddress = new IpsAddress();
                IpsMessage emailMessage = new IpsMessage();

                emailAddress.Address = new List<string>
                {
                    user.WorkEmail
                };

                emailMessage.Subject = ReplaceMacroses(template.EmailSubject, user, participant, stage);
                emailMessage.Message = ReplaceMacroses(template.EmailBody, user, participant, stage);
                _mailNotification.Send(emailAddress, emailMessage);
            }
        }

        private void SendEmailNotification(NotificationRecipient recipient, NotificationTemplate template)
        {
            if (!string.IsNullOrWhiteSpace(template.EmailSubject) && !string.IsNullOrWhiteSpace(template.EmailBody))
            {
                IpsAddress emailAddress = new IpsAddress();
                IpsMessage emailMessage = new IpsMessage();
                if (string.IsNullOrEmpty(recipient.RecipientUser.WorkEmail))
                {
                    recipient.RecipientUser.WorkEmail = "ronny@resultatpartner.no";
                }
                emailAddress.Address = new List<string> { recipient.RecipientUser.WorkEmail };
                emailMessage.Subject = ReplaceMacroses(template.EmailSubject, recipient);
                emailMessage.Message = ReplaceMacroses(template.EmailBody, recipient);
                _mailNotification.Send(emailAddress, emailMessage);
            }
        }
        private void SendTaskEmailNotification(TaskNotificationRecipient recipient, NotificationTemplate template)
        {
            if (!string.IsNullOrWhiteSpace(template.EmailSubject) && !string.IsNullOrWhiteSpace(template.EmailBody))
            {
                IpsAddress emailAddress = new IpsAddress();
                IpsMessage emailMessage = new IpsMessage();
                if (string.IsNullOrEmpty(recipient.RecipientUser.WorkEmail))
                {
                    recipient.RecipientUser.WorkEmail = "ronny@resultatpartner.no";
                }
                emailAddress.Address = new List<string> { recipient.RecipientUser.WorkEmail };
                emailMessage.Subject = ReplaceTaskMacroses(template.EmailSubject, recipient);
                emailMessage.Message = ReplaceTaskMacroses(template.EmailBody, recipient);
                _mailNotification.Send(emailAddress, emailMessage);
            }
        }

        private void SendTrainingEmailNotification(TrainingNotificationRecipient recipient, NotificationTemplate template)
        {
            if (!string.IsNullOrWhiteSpace(template.EmailSubject) && !string.IsNullOrWhiteSpace(template.EmailBody))
            {
                IpsAddress emailAddress = new IpsAddress();
                IpsMessage emailMessage = new IpsMessage();
                if (string.IsNullOrEmpty(recipient.RecipientUser.WorkEmail))
                {
                    recipient.RecipientUser.WorkEmail = "ronny@resultatpartner.no";
                }
                emailAddress.Address = new List<string> { recipient.RecipientUser.WorkEmail };
                emailMessage.Subject = ReplaceTrainingMacroses(template.EmailSubject, recipient);
                emailMessage.Message = ReplaceTrainingMacroses(template.EmailBody, recipient);
                _mailNotification.Send(emailAddress, emailMessage);
            }
        }

        private void SendSMSNotification(User user, EvaluationParticipant participant, NotificationTemplate template, IpsStageNotification stage)
        {
            if (!string.IsNullOrWhiteSpace(template.SMSMessage))
            {
                IpsAddress smsAddress = new IpsAddress();
                IpsMessage smsMessage = new IpsMessage();

                smsAddress.From = ConfigurationManager.AppSettings.Get("smsMobileNumber");
                smsAddress.Address = new List<string> { user.MobileNo };

                smsMessage.Subject = string.Empty;
                smsMessage.Message = ReplaceMacroses(template.SMSMessage, user, participant, stage);

                _smsNotification.Send(smsAddress, smsMessage);
            }
        }

        private void SendSMSNotification(NotificationRecipient recipient, NotificationTemplate template)
        {
            if (!string.IsNullOrWhiteSpace(template.SMSMessage))
            {
                IpsAddress smsAddress = new IpsAddress();
                IpsMessage smsMessage = new IpsMessage();

                smsAddress.From = ConfigurationManager.AppSettings.Get("smsMobileNumber");
                smsAddress.Address = new List<string> { recipient.RecipientUser.MobileNo };

                smsMessage.Subject = string.Empty;
                smsMessage.Message = ReplaceMacroses(template.SMSMessage, recipient);

                _smsNotification.Send(smsAddress, smsMessage);
            }
        }

        private void SendTaskSMSNotification(TaskNotificationRecipient recipient, NotificationTemplate template)
        {
            if (!string.IsNullOrWhiteSpace(template.SMSMessage))
            {
                IpsAddress smsAddress = new IpsAddress();
                IpsMessage smsMessage = new IpsMessage();

                smsAddress.From = ConfigurationManager.AppSettings.Get("smsMobileNumber");
                smsAddress.Address = new List<string> { recipient.RecipientUser.MobileNo };

                smsMessage.Subject = string.Empty;
                smsMessage.Message = ReplaceTaskMacroses(template.SMSMessage, recipient);

                _smsNotification.Send(smsAddress, smsMessage);
            }
        }

        private void SendTrainingSMSNotification(TrainingNotificationRecipient recipient, NotificationTemplate template)
        {
            if (!string.IsNullOrWhiteSpace(template.SMSMessage))
            {
                IpsAddress smsAddress = new IpsAddress();
                IpsMessage smsMessage = new IpsMessage();

                smsAddress.From = ConfigurationManager.AppSettings.Get("smsMobileNumber");
                smsAddress.Address = new List<string> { recipient.RecipientUser.MobileNo };

                smsMessage.Subject = string.Empty;
                smsMessage.Message = ReplaceTrainingMacroses(template.SMSMessage, recipient);

                _smsNotification.Send(smsAddress, smsMessage);
            }
        }

        private string ReplaceMacroses(string template, User user, EvaluationParticipant participant, IpsStageNotification stage)
        {
            foreach (var macros in _macroses)
            {
                if (template.Contains(macros))
                {
                    var value = GetTemplateValue(macros, user, participant, stage);
                    if (!string.IsNullOrEmpty(value))
                    {
                        template = template.Replace(macros, value);
                    }
                }
            }

            return template;
        }

        private string ReplaceMacroses(string templateText, NotificationRecipient recipient)
        {
            foreach (var macros in _macroses)
            {
                if (templateText.Contains(macros))
                {
                    var value = GetMacrosValue(macros, recipient);
                    templateText = templateText.Replace(macros, value);
                }
            }

            return templateText;
        }

        private string ReplaceTaskMacroses(string templateText, TaskNotificationRecipient recipient)
        {
            foreach (var macros in _taskMacroses)
            {
                if (templateText.Contains(macros))
                {
                    var value = GetTaskMacrosValue(macros, recipient);
                    templateText = templateText.Replace(macros, value);
                }
            }

            return templateText;
        }

        private string ReplaceTrainingMacroses(string templateText, TrainingNotificationRecipient recipient)
        {
            foreach (var macros in _taskMacroses)
            {
                if (templateText.Contains(macros))
                {
                    var value = GetTrainingMacrosValue(macros, recipient);
                    templateText = templateText.Replace(macros, value);
                }
            }

            return templateText;
        }


        private string ReplaceEvalutionMacroses(string template, User evaluatorUser, User participant, IpsStageNotification stage)
        {
            foreach (var macros in _evaluationMacroses)
            {
                if (template.Contains(macros))
                {
                    var value = GetEvaluationTemplateValue(macros, evaluatorUser, participant, stage);
                    if (!string.IsNullOrEmpty(value))
                    {
                        template = template.Replace(macros, value);
                    }
                }
            }

            return template;
        }



        private string GetTemplateValue(string macros, User user, EvaluationParticipant participant, IpsStageNotification stage)
        {
            switch (macros)
            {
                case "[ProfileName]":
                    return GetProfileName(stage.StageGroup.Id);
                case "[PersonName]":
                    return (user.FirstName + " " + user.LastName);
                case "[UserName]":
                    return GetUserLoginName(user.UserKey);
                case "[PassWord]":
                    return GetUserPassword(user.UserKey);
                case "[Stage]":
                    return stage.Name;
                case "[SurveyURL]":
                    return (participant != null) ? GetSurveyUrl(participant.Id, stage) : string.Empty;
                case "[KTSurveyURL]":
                    return (participant != null) ? GetKTSurveyUrl(participant.Id, stage) : string.Empty;
                case "[TargetName]":
                    return GetTargetName();
                case "[StartDate]":
                    return stage.StartDate.ToString("g");
                case "[DueDate]":
                    return stage.DueDate.ToString("g");
                default:
                    return string.Empty;
            }
        }

        private string GetEvaluationTemplateValue(string macros, User evaluatorUser, User participant, IpsStageNotification stage)
        {
            switch (macros)
            {
                case "[ProfileName]":
                    return GetProfileName(stage.StageGroup.Id);
                case "[PersonName]":
                    return (evaluatorUser.FirstName + " " + evaluatorUser.LastName);
                case "[Stage]":
                    return stage.Name;
                case "[StartDate]":
                    return stage.StartDate.ToString("g");
                case "[DueDate]":
                    return stage.DueDate.ToString("g");
                case "[Participant]":
                    return (participant.FirstName + " " + participant.LastName);
                case "[UserEmail]":
                    return evaluatorUser.WorkEmail;
                case "[OrganizationName]":
                    return evaluatorUser.Organization == null ? string.Empty : evaluatorUser.Organization.Name;
                default:
                    return string.Empty;
            }
        }

        private string GetMacrosValue(string macros, NotificationRecipient recipient)
        {
            switch (macros)
            {
                case "[ProfileName]":
                    return recipient.NotifyAboutProfile == null ? string.Empty : recipient.NotifyAboutProfile.Name;
                case "[PersonName]":
                    return GetUserName(recipient.RecipientUser);
                case "[UserName]":
                    return GetUserLoginName(recipient.RecipientUser.UserKey);
                case "[PassWord]":
                    return GetUserPassword(recipient.RecipientUser.UserKey);
                case "[Stage]":
                    return recipient.NotifyAboutStage == null ? string.Empty : recipient.NotifyAboutStage.Name;
                case "[SurveyURL]":
                    return (recipient.RecipientParticipantId != 0
                            && recipient.NotifyAboutProfile != null
                            && recipient.NotifyAboutStage != null)
                        ? GetSurveyUrl(recipient.RecipientParticipantId, recipient.NotifyAboutProfile.Id,
                            recipient.NotifyAboutStage.StageId)
                        : string.Empty;
                case "[KTSurveyURL]":
                    return (recipient.RecipientParticipantId != 0
                            && recipient.NotifyAboutProfile != null
                            && recipient.NotifyAboutStage != null)
                        ? GetKTSurveyUrl(recipient.RecipientParticipantId, recipient.NotifyAboutProfile.Id,
                            recipient.NotifyAboutStage.StageId, recipient.NotifyAboutStage.StageEvolutionId)
                        : string.Empty;
                case "[TargetName]":
                    return GetUserName(recipient.NotifyAboutUser);
                case "[StartDate]":
                    return recipient.NotifyAboutStage == null
                        ? string.Empty
                        : recipient.NotifyAboutStage.StartDate.ToString("g");
                case "[DueDate]":
                    return recipient.NotifyAboutStage == null
                        ? string.Empty
                        : recipient.NotifyAboutStage.DueDate.ToString("g");
                default:
                    return string.Empty;
            }
        }

        public void SendParticipantStageResultNotification(int participantUserId, int? stageId, int? stageEvolutionId, int participantId)
        {
            var stage = SelectStage(stageId, stageEvolutionId);
            var participants = stage.StageGroup.EvaluationParticipants.Where(ep => ep.IsLocked == false).ToList();
            var filteredParticipants = participants.Where(p => p.UserId == participantUserId).ToList();
            EvaluationParticipant evaluator = participants.FirstOrDefault(p => p.EvaluateeId == participantId);
            if (evaluator != null)
            {
                filteredParticipants.Add(evaluator);
            }
            SendParticipantStageResultNotification(
                participantUserId,
                stage,
                stage.ExternalResultsNotificationTemplateId,
                stage.EvaluatorResultsNotificationTemplateId,
                stage.TrainerResultsNotificationTemplateId,
                stage.ManagerResultsNotificationTemplateId,
                filteredParticipants,
                participantId,
                false
            );
        }
        private List<StageResultNotificationRecipient> SendParticipantStageResultNotification(int participantUserId, IpsStageNotification stage, int? participantResultTemplateId, int? evaluatorResultTemplateId, int? trainerResultTemplateId, int? managerResultTemplateId, List<EvaluationParticipant> evaluationParticipants, int participantId, bool participantsWithSelfEvaluationOnly, bool ignoreAlreadyCompletedStage = false)
        {
            Profile profile = stage.StageGroup.Profiles.FirstOrDefault();
            var participantTemplate = SelectTemplate(participantResultTemplateId);
            var evaluatorTemplate = SelectTemplate(evaluatorResultTemplateId);
            var trainerTemplate = stage.TrainerId.HasValue ? SelectTemplate(trainerResultTemplateId) : null;
            var managerTemplate = stage.ManagerId.HasValue ? SelectTemplate(managerResultTemplateId) : null;
            List<StageResultNotificationRecipient> allRecepients = new List<StageResultNotificationRecipient>();
            if (managerTemplate != null)
            {
                VerifyTemplate(managerTemplate, stage.EmailNotification, stage.SMSNotification);
                User managerUser = _ipsDataContext.Users
                    .Include("Organization")
                    .Where(u => u.Id == stage.ManagerId).AsNoTracking().FirstOrDefault();
                User participantUser = _ipsDataContext.Users.Where(x => x.Id == participantUserId).AsNoTracking().FirstOrDefault();
                if (!(participantId > 0))
                {
                    if (evaluationParticipants.Count > 0)
                    {
                        EvaluationParticipant participantObj = evaluationParticipants.Where(x => x.EvaluationRoleId == (int)EvaluationRoleEnum.Participant).FirstOrDefault();
                        if (participantObj != null)
                        {
                            participantId = participantObj.Id;
                        }
                    }
                }
                StageResultNotificationRecipient manager = new StageResultNotificationRecipient
                {
                    RecipientUser = managerUser,
                    NotifyAboutProfile = profile,
                    NotifyAboutUser = participantUser,
                    NotifyAboutStage = stage,
                    ParticipantId = participantId,
                    SendEmail = stage.EmailNotification,
                    SendSMS = stage.SMSNotification,
                };

                System.Threading.Tasks.Task.Factory.StartNew(() =>
                {
                    SendOutResultNotification(new List<StageResultNotificationRecipient> { manager }, managerTemplate);
                });

                allRecepients.Add(manager);
            }
            if (evaluatorTemplate != null)
            {
                VerifyTemplate(evaluatorTemplate, stage.EmailNotification, stage.SMSNotification);
                EvaluationParticipant evaluationEvaluator = evaluationParticipants.Where(e => e.EvaluationRoleId == (int)EvaluationRoleEnum.Evaluator).FirstOrDefault();
                if (evaluationEvaluator != null)
                {
                    User evaluatorUser = _ipsDataContext.Users
                        .Include("Organization")
                        .Where(u => u.Id == evaluationEvaluator.UserId).AsNoTracking().FirstOrDefault();
                    User participantUser = _ipsDataContext.Users.Where(x => x.Id == participantUserId).AsNoTracking().FirstOrDefault();
                    if (!(participantId > 0))
                    {
                        if (evaluationParticipants.Count > 0)
                        {
                            EvaluationParticipant participantObj = evaluationParticipants.Where(x => x.EvaluationRoleId == (int)EvaluationRoleEnum.Participant).FirstOrDefault();
                            if (participantObj != null)
                            {
                                participantId = participantObj.Id;
                            }
                        }
                    }
                    StageResultNotificationRecipient evaluator = new StageResultNotificationRecipient
                    {
                        RecipientUser = evaluatorUser,
                        NotifyAboutProfile = profile,
                        NotifyAboutUser = participantUser,
                        NotifyAboutStage = stage,
                        ParticipantId = participantId,
                        SendEmail = stage.EmailNotification,
                        SendSMS = stage.SMSNotification,
                    };

                    System.Threading.Tasks.Task.Factory.StartNew(() =>
                    {
                        SendOutResultNotification(new List<StageResultNotificationRecipient> { evaluator }, evaluatorTemplate);
                    });

                    allRecepients.Add(evaluator);
                }
            }
            return allRecepients;
        }
        private void SendOutResultNotification(List<StageResultNotificationRecipient> recipients, NotificationTemplate template)
        {
            if (recipients.Count > 0)
            {
                foreach (var recipient in recipients)
                {
                    recipient.IsEmailNotificationDelivered = false;
                    if (recipient.SendEmail)
                    {
                        try
                        {
                            SendResultEmailNotification(recipient, template);
                            recipient.IsEmailNotificationDelivered = true;
                            Log.Debug(String.Format("Send email to participant with Id {0}, name {1} {2} successful", recipient.ParticipantId, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName));
                        }
                        catch (Exception ex)
                        {
                            Log.Error(String.Format("Send email to participant with Id {0}, name {1} {2} failed", recipient.ParticipantId, recipient.RecipientUser.FirstName, recipient.RecipientUser.LastName), ex);
                        }
                    }
                }
            }
        }
        private void SendResultEmailNotification(StageResultNotificationRecipient recipient, NotificationTemplate template)
        {
            if (!string.IsNullOrWhiteSpace(template.EmailSubject) && !string.IsNullOrWhiteSpace(template.EmailBody))
            {
                IpsAddress emailAddress = new IpsAddress();
                IpsMessage emailMessage = new IpsMessage();
                if (string.IsNullOrEmpty(recipient.RecipientUser.WorkEmail))
                {
                    recipient.RecipientUser.WorkEmail = "ronny@resultatpartner.no";
                }
                emailAddress.Address = new List<string> { recipient.RecipientUser.WorkEmail };
                string culture = template.Culture != null ? template.Culture.CultureName : "en-US";
                emailMessage.Subject = ReplaceResultMacroses(template.EmailSubject, recipient, culture);
                emailMessage.Message = ReplaceResultMacroses(template.EmailBody, recipient, culture);
                _mailNotification.Send(emailAddress, emailMessage);

                // Update Result Send Out
                if (recipient.ParticipantId > 0)
                {
                    EvaluationParticipant original = _ipsDataContext.EvaluationParticipants.Where(x => x.Id == recipient.ParticipantId).FirstOrDefault();
                    if (original != null)
                    {
                        EvaluationParticipant newEvaluationParticipant = new EvaluationParticipant()
                        {
                            Id = original.Id,
                            EvaluateeId = original.EvaluateeId,
                            EvaluationRoleId = original.EvaluationRoleId,
                            StageGroupId = original.StageGroupId,
                            UserId = original.UserId,
                            Invited = original.Invited,
                            IsLocked = original.IsLocked,
                            IsSelfEvaluation = original.IsSelfEvaluation,
                            IsScoreManager = original.IsScoreManager,
                            ResultSendOutAt = DateTime.Now,
                            IsResultSendOut = true,
                        };

                        _ipsDataContext.Entry(original).CurrentValues.SetValues(newEvaluationParticipant);
                        _ipsDataContext.SaveChanges();
                    }
                }

            }
        }
        private string ReplaceResultMacroses(string templateText, StageResultNotificationRecipient recipient, string culture)
        {
            foreach (var macros in _stageResultMacroses)
            {
                if (templateText.Contains(macros))
                {
                    var value = GetStageResultMacrosValue(macros, recipient, culture);
                    templateText = templateText.Replace(macros, value);
                }
            }

            return templateText;
        }
        private string GetStageResultMacrosValue(string macros, StageResultNotificationRecipient recipient, string culture)
        {
            switch (macros)
            {
                case "[Profile]":
                    return recipient.NotifyAboutProfile == null ? string.Empty : recipient.NotifyAboutProfile.Name;
                case "[CurrentMilestoneName]":
                    return recipient.NotifyAboutStage == null ? string.Empty : recipient.NotifyAboutStage.Name;

                case "[SurveyURL]":
                    return (recipient.ParticipantId != 0
                            && recipient.NotifyAboutProfile != null
                            && recipient.NotifyAboutStage != null)
                        ? GetSurveyUrl(recipient.ParticipantId, recipient.NotifyAboutProfile.Id,
                            recipient.NotifyAboutStage.StageId)
                        : string.Empty;
                case "[KTSurveyURL]":
                    return (recipient.ParticipantId != 0
                            && recipient.NotifyAboutProfile != null
                            && recipient.NotifyAboutStage != null)
                        ? GetKTSurveyUrl(recipient.ParticipantId, recipient.NotifyAboutProfile.Id,
                            recipient.NotifyAboutStage.StageId, recipient.NotifyAboutStage.StageEvolutionId)
                        : string.Empty;
                case "[Participant]":
                    return GetUserName(recipient.NotifyAboutUser);
                case "[UserName]":
                    return GetUserLoginName(recipient.RecipientUser.UserKey);
                case "[UserEmail]":
                    return recipient.RecipientUser.WorkEmail;
                case "[StartDate]":
                    return recipient.NotifyAboutStage == null
                        ? string.Empty
                        : recipient.NotifyAboutStage.StartDate.ToString("g");
                case "[DueDate]":
                    return recipient.NotifyAboutStage == null
                        ? string.Empty
                        : recipient.NotifyAboutStage.DueDate.ToString("g");
                case "[OrganizationName]":
                    return recipient.RecipientUser.Organization == null ? string.Empty : recipient.RecipientUser.Organization.Name;
                case "[ParticipantName]":
                    return GetUserName(recipient.NotifyAboutUser);
                case "[TimeSummary]":
                    return getStageResultKPITimeSummaryData(recipient, culture);
                case "[KPIScoreSummary]":
                    return getStageResultKPISummaryData(recipient, culture);
                case "[OrganizationLogo]":
                    return recipient.RecipientUser.Organization == null ? string.Empty : recipient.RecipientUser.Organization.LogoLink;
                case "[LoginURL]":
                    return ConfigurationManager.AppSettings.Get("loginUrl");
                case "[CurrentDate]":
                    return (DateTime.Now).ToString("g");
                default:
                    return string.Empty;
            }
        }

        private string GetTaskMacrosValue(string macros, TaskNotificationRecipient recipient)
        {
            switch (macros)
            {
                case "[UserName]":
                    return recipient.RecipientUser.FirstName + " " + recipient.RecipientUser.LastName;
                case "[Title]":
                    return recipient.Task == null ? string.Empty : recipient.Task.Title;
                case "[StartDate]":
                    return recipient.Task == null ? string.Empty : ((DateTime)recipient.Task.StartDate).ToString("g");
                case "[DueDate]":
                    return recipient.Task == null ? string.Empty : ((DateTime)recipient.Task.DueDate).ToString("g");
                case "[UserEmail]":
                    return recipient.RecipientUser.WorkEmail;
                case "[OrganizationName]":
                    return recipient.RecipientUser.Organization == null ? string.Empty : recipient.RecipientUser.Organization.Name;
                case "[LoginURL]":
                    return ConfigurationManager.AppSettings.Get("loginUrl");

                default:
                    return string.Empty;
            }
        }

        private string GetTrainingMacrosValue(string macros, TrainingNotificationRecipient recipient)
        {
            switch (macros)
            {
                case "[Profile]":
                    {
                        string result = string.Empty;
                        if (recipient.Training.EvaluationAgreements != null)
                        {
                            EvaluationAgreement agreement = recipient.Training.EvaluationAgreements.FirstOrDefault();
                            if (agreement.Stage != null)
                            {
                                if (agreement.Stage.StageGroup != null)
                                {
                                    if (agreement.Stage.StageGroup.Profiles != null)
                                    {
                                        Profile profile = agreement.Stage.StageGroup.Profiles.FirstOrDefault();
                                        result = profile.Name;
                                    }

                                }

                            }
                        }
                        return result;

                    }
                case "[UserName]":
                    return recipient.RecipientUser.FirstName + " " + recipient.RecipientUser.LastName;
                case "[Title]":
                    return recipient.Training == null ? string.Empty : recipient.Training.Name;
                case "[StartDate]":
                    return recipient.Training == null ? string.Empty : ((DateTime)recipient.Training.StartDate).ToString("g");
                case "[DueDate]":
                    return recipient.Training == null ? string.Empty : ((DateTime)recipient.Training.EndDate).ToString("g");
                case "[UserEmail]":
                    return recipient.RecipientUser.WorkEmail;
                case "[OrganizationName]":
                    return recipient.RecipientUser.Organization == null ? string.Empty : recipient.RecipientUser.Organization.Name;
                case "[LoginURL]":
                    return ConfigurationManager.AppSettings.Get("loginUrl"); ;

                default:
                    return string.Empty;
            }
        }

        private string GetTargetName()
        {
            if (_evaluateeId != null)
            {
                return (from u in _ipsDataContext.Users
                        join p in _ipsDataContext.EvaluationParticipants on u.Id equals p.UserId
                        where p.Id == _evaluateeId
                        select u.FirstName + " " + u.LastName).FirstOrDefault();
            }
            return string.Empty;
        }

        private string GetUserName(User u)
        {
            if (u != null)
                return ((u.FirstName == null ? String.Empty : u.FirstName) + " " + (u.LastName == null ? string.Empty : u.LastName)).Trim();
            return string.Empty;
        }

        private string GetKTSurveyUrl(int participantId, IpsStageNotification stage)
        {
            var profileId = (from p in _ipsDataContext.StageGroups
                             where p.Id == stage.StageGroup.Id
                             select p.Profiles.FirstOrDefault().Id).FirstOrDefault();

            var staticUrlPart = ConfigurationManager.AppSettings.Get("ktSurveyUrl");
            var stageId = stage.StageId?.ToString() ?? "null";
            var stageEvolutionId = stage.StageEvolutionId?.ToString() ?? "null";
            return staticUrlPart + "/" + profileId + "/" + stageId + "/" + participantId + "/" + stageEvolutionId;
        }

        private string GetSurveyUrl(int participantId, IpsStageNotification stage)
        {
            string isStandAloneMode = "true";
            var profileId = (from p in _ipsDataContext.StageGroups
                             where p.Id == stage.StageGroup.Id
                             select p.Profiles.FirstOrDefault().Id).FirstOrDefault();

            var staticUrlPart = ConfigurationManager.AppSettings.Get("surveyUrl");

            return staticUrlPart + "/" + profileId + "/" + stage.StageId + "/" + participantId + "/" + isStandAloneMode;
        }

        private string GetKTSurveyUrl(int participantId, int profileId, int? stageId, int? stageEvolutionId)
        {
            var staticUrlPart = ConfigurationManager.AppSettings.Get("ktSurveyUrl");
            var strStageId = stageId?.ToString() ?? "null";
            var strStageEvolutionId = stageEvolutionId?.ToString() ?? "null";
            return staticUrlPart + "/" + profileId + "/" + strStageId + "/" + participantId + "/" + strStageEvolutionId;
        }

        private string GetSurveyUrl(int participantId, int profileId, int? stageId)
        {
            string isStandAloneMode = "true";
            var staticUrlPart = ConfigurationManager.AppSettings.Get("surveyUrl");
            return staticUrlPart + "/" + profileId + "/" + stageId + "/" + participantId + "/" + isStandAloneMode;
        }

        private string GetProfileName(int stageGroupId)
        {
            return (from p in _ipsDataContext.StageGroups
                    where p.Id == stageGroupId
                    select p.Profiles.FirstOrDefault().Name).FirstOrDefault();
        }

        private string GetUserLoginName(string userKey)
        {
            AuthService service = new AuthService();
            var user = service.GetUserById(userKey);
            if (user != null)
                return user.UserName;
            return string.Empty;
        }

        private string GetUserPassword(string userKey)
        {
            AuthService service = new AuthService();
            string pwd = service.GetUserPlainPassword(userKey);
            return pwd;
        }

        private void SetInvitedTime(List<EvaluationParticipant> participants)
        {
            var currentDate = DateTime.Now;
            foreach (var participant in participants)
            {
                participant.Invited = currentDate;
            }
            _ipsDataContext.SaveChanges();
        }

        public void SendTextEvaluationNotification(int? stageId, int? stageEvolutionId, int participantId)
        {
            var evaluators = _ipsDataContext.EvaluationParticipants
                .Where(x => x.EvaluateeId == participantId || (x.Id == participantId && x.IsSelfEvaluation == true))
                .Select(x => x.Id).ToArray();
            if (evaluators.Length > 0)
            {
                var templateId = stageEvolutionId.HasValue
                    ? _ipsDataContext.StagesEvolutions
                    .Include(x => x.Stage)
                    .Where(x => x.Id == stageEvolutionId.Value)
                    .Select(x => x.Stage.EvaluatorCompletedNotificationTemplateId)
                    .FirstOrDefault()
                : _ipsDataContext.Stages.Where(x => x.Id == stageId)
                        .Select(x => x.EvaluatorCompletedNotificationTemplateId)
                        .FirstOrDefault();
                if (templateId.HasValue)
                {
                    Notify(evaluators, stageId, stageEvolutionId, templateId.Value);
                }
            }
        }

        public void SendTrainingNotificationEmail(Training trainng, User user)
        {
            if (string.IsNullOrEmpty(user.WorkEmail))
            {
                IpsAddress emailAddress = new IpsAddress();
                IpsMessage emailMessage = new IpsMessage();

                emailAddress.Address = new List<string> { user.WorkEmail };

                emailMessage.Subject = "Reminder : Your Training " + trainng.Name;
                emailMessage.Message = "Please Login to IPS,You have to perform your training  '" + trainng.Name + "'";
                _mailNotification.Send(emailAddress, emailMessage);
            }
        }

        public void SendTrainingNotificationEmail(Task task, User user)
        {
            if (string.IsNullOrEmpty(user.WorkEmail))
            {
                IpsAddress emailAddress = new IpsAddress();
                IpsMessage emailMessage = new IpsMessage();

                emailAddress.Address = new List<string> { user.WorkEmail };

                emailMessage.Subject = "Reminder :Your Task " + task.Title;
                emailMessage.Message = "Please Login to IPS, you have to do youe task: '" + task.Title + "'";
                _mailNotification.Send(emailAddress, emailMessage);
            }
        }

        public void SendMeetingTaskCreatedEmailNotification(int taskId, int prospectingCustomerId, string notificationTemplate)
        {
            Task task = SelectTask(taskId);
            Customer customer = SelectCustomer(prospectingCustomerId);
            var recepients = SendMeetingTaskCreatedEmailNotification(task, customer, prospectingCustomerId, notificationTemplate);
        }

        public void SendSalesAgreedItemsEmailNotification(ProspectingCustomerResult prospectingCustomerResult)
        {
            Customer customer = SelectCustomer(prospectingCustomerResult.ProspectingCustomerId);
            var recepients = SendSalesAgreedItemCreatedEmailNotification(customer, prospectingCustomerResult.ProspectingCustomerId, prospectingCustomerResult.ProspectingCustomerSalesAgreedDatas.ToList(), prospectingCustomerResult.SalesNotification);
        }

        public void SendFollowupTaskCreatedEmailNotification(int taskId, int prospectingCustomerId, string notificationTemplate)
        {
            Task task = SelectTask(taskId);
            Customer customer = SelectCustomer(prospectingCustomerId);
            var recepients = SendFollowupTaskCreatedEmailNotification(task, customer, prospectingCustomerId, notificationTemplate);
        }

        private Task SelectProspectingTaskByProspectingCustomerId(int prospectingCustomerId)
        {
            Task task = null;
            ProspectingCustomer prospectingCustomer = _ipsDataContext.ProspectingCustomers.Where(x => x.Id == prospectingCustomerId).FirstOrDefault();
            if (prospectingCustomer != null)
            {
                ProspectingGoalInfo prospectingGoalInfo = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.Id == prospectingCustomer.ProspectingGoalId).FirstOrDefault();
                if (prospectingGoalInfo != null)
                {
                    if (prospectingGoalInfo.TaskId.HasValue)
                    {
                        task = _ipsDataContext.Tasks.Where(x => x.Id == prospectingGoalInfo.TaskId.Value).FirstOrDefault();
                    }
                }
            }
            return task;
        }
        private NotificationTemplate SelectMeetingScheduleTemplate(int? templateId)
        {
            NotificationTemplate defaultNotificationTemplate = null;
            if (templateId.HasValue)
            {
                if (templateId.Value > 0)
                {
                    defaultNotificationTemplate = _ipsDataContext.NotificationTemplates.Include("Culture")
                   .Where(t => t.Id == templateId)
                   .FirstOrDefault();
                }
                else
                {
                    int currentOrganizationId = _authService.GetCurrentUserOrgId();
                    defaultNotificationTemplate = _ipsDataContext.NotificationTemplates.Include("Culture")
                    .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.MeetingSchedule && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == currentOrganizationId)
                    .FirstOrDefault();
                    if (defaultNotificationTemplate == null)
                    {
                        defaultNotificationTemplate = _ipsDataContext.NotificationTemplates.Include("Culture")
                     .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.MeetingSchedule && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == currentOrganizationId)
                     .FirstOrDefault();
                    }
                    //if (GetCurrentCulture().ToLower() == "nb-no")
                    //{
                    //    defaultNotificationTemplate = _ipsDataContext.NotificationTemplates.Include("Culture")
                    //.Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.MeetingSchedule && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == currentOrganizationId)
                    //.FirstOrDefault();
                    //}
                    //else
                    //{
                    //    defaultNotificationTemplate = _ipsDataContext.NotificationTemplates.Include("Culture")
                    // .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.MeetingSchedule && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == currentOrganizationId)
                    // .FirstOrDefault();
                    //}
                }
            }
            else
            {
                int currentOrganizationId = _authService.GetCurrentUserOrgId();
                defaultNotificationTemplate = _ipsDataContext.NotificationTemplates.Include("Culture")
                .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.MeetingSchedule && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == currentOrganizationId)
                .FirstOrDefault();
                if (defaultNotificationTemplate == null)
                {
                    defaultNotificationTemplate = _ipsDataContext.NotificationTemplates.Include("Culture")
                 .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.MeetingSchedule && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == currentOrganizationId)
                 .FirstOrDefault();
                }
                return defaultNotificationTemplate;
            }

            return defaultNotificationTemplate;
        }

        private NotificationTemplate SelectFollowupScheduleTemplate(int? templateId)
        {
            NotificationTemplate result = new NotificationTemplate();
            if (templateId.HasValue)
            {
                if (templateId.Value > 0)
                {
                    result = _ipsDataContext.NotificationTemplates.Include("Culture").Where(t => t.Id == templateId)
                    .FirstOrDefault();
                }
                else
                {
                    int currentOrganizationId = _authService.GetCurrentUserOrgId();
                    if (GetCurrentCulture().ToLower() == "nb-no")
                    {
                        result = _ipsDataContext.NotificationTemplates.Include("Culture")
                        .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.FollowupSchedule && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == currentOrganizationId)
                        .FirstOrDefault();
                    }
                    else
                    {
                        result = _ipsDataContext.NotificationTemplates.Include("Culture")
                        .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.FollowupSchedule && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == currentOrganizationId)
                        .FirstOrDefault();
                    }
                }
            }
            else
            {
                int currentOrganizationId = _authService.GetCurrentUserOrgId();
                if (GetCurrentCulture().ToLower() == "nb-no")
                {
                    result = _ipsDataContext.NotificationTemplates.Include("Culture")
                    .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.FollowupSchedule && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == currentOrganizationId)
                    .FirstOrDefault();
                }
                else
                {
                    result = _ipsDataContext.NotificationTemplates.Include("Culture")
                    .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.FollowupSchedule && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == currentOrganizationId)
                    .FirstOrDefault();
                }
            }
            return result;
        }

        private NotificationTemplate SelectSalesAgreedTemplate(int? templateId)
        {
            NotificationTemplate result = new NotificationTemplate();
            if (templateId.HasValue)
            {
                if (templateId.Value > 0)
                {
                    result = _ipsDataContext.NotificationTemplates.Include("Culture").Where(t => t.Id == templateId)
                    .FirstOrDefault();
                }
                else
                {
                    int currentOrganizationId = _authService.GetCurrentUserOrgId();
                    if (GetCurrentCulture().ToLower() == "nb-no")
                    {
                        result = _ipsDataContext.NotificationTemplates.Include("Culture")
                        .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == currentOrganizationId)
                        .FirstOrDefault();

                        if (result == null)
                        {
                            result = _ipsDataContext.NotificationTemplates.Include("Culture")
                        .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == currentOrganizationId)
                        .FirstOrDefault();
                        }
                        if (result == null)
                        {
                            result = _ipsDataContext.NotificationTemplates.Include("Culture")
                       .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == null)
                       .FirstOrDefault();
                        }
                        if (result == null)
                        {
                            result = _ipsDataContext.NotificationTemplates.Include("Culture")
                        .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == null)
                        .FirstOrDefault();
                        }
                    }
                    else
                    {
                        result = _ipsDataContext.NotificationTemplates.Include("Culture")
                        .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == currentOrganizationId)
                        .FirstOrDefault();

                        if (result == null)
                        {
                            result = _ipsDataContext.NotificationTemplates.Include("Culture")
                        .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == currentOrganizationId)
                        .FirstOrDefault();
                        }
                        if (result == null)
                        {
                            result = _ipsDataContext.NotificationTemplates.Include("Culture")
                       .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == null)
                       .FirstOrDefault();
                        }
                        if (result == null)
                        {
                            result = _ipsDataContext.NotificationTemplates.Include("Culture")
                        .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == null)
                        .FirstOrDefault();
                        }
                    }
                }
            }
            else
            {
                Log.Debug("SelectSalesAgreedTemplate");
                Log.Debug(GetCurrentCulture().ToLower());
                int currentOrganizationId = _authService.GetCurrentUserOrgId();
                if (GetCurrentCulture().ToLower() == "nb-no")
                {
                    Log.Debug("Check for nb-no with Org Id");
                    result = _ipsDataContext.NotificationTemplates.Include("Culture")
                    .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == currentOrganizationId)
                    .FirstOrDefault();

                    if (result == null)
                    {
                        Log.Debug("Check for en-us with Org Id");
                        result = _ipsDataContext.NotificationTemplates.Include("Culture")
                    .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == currentOrganizationId)
                    .FirstOrDefault();
                    }
                    if (result == null)
                    {
                        Log.Debug("Check for nb-no without Org Id");
                        result = _ipsDataContext.NotificationTemplates.Include("Culture")
                   .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == null)
                   .FirstOrDefault();
                    }
                    if (result == null)
                    {
                        Log.Debug("Check for en-us without Org Id");
                        result = _ipsDataContext.NotificationTemplates.Include("Culture")
                    .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == null)
                    .FirstOrDefault();
                    }
                }
                else
                {
                    Log.Debug("Check for en-us with Org Id");
                    result = _ipsDataContext.NotificationTemplates.Include("Culture")
                    .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == currentOrganizationId)
                    .FirstOrDefault();

                    if (result == null)
                    {
                        Log.Debug("Check for no-nb with Org Id");
                        result = _ipsDataContext.NotificationTemplates.Include("Culture")
                    .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == currentOrganizationId)
                    .FirstOrDefault();
                    }
                    if (result == null)
                    {
                        Log.Debug("Check for en-us without Org Id");
                        result = _ipsDataContext.NotificationTemplates.Include("Culture")
                   .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "en-us" && t.OrganizationId == null)
                   .FirstOrDefault();
                    }
                    if (result == null)
                    {
                        Log.Debug("Check for no-nb without Org Id");
                        result = _ipsDataContext.NotificationTemplates.Include("Culture")
                    .Where(t => t.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && t.StageTypeId == (int)NotificationTemplateStageTypeEnum.SalesAgreed && t.IsDefualt == true && t.Culture.CultureName.ToLower() == "nb-no" && t.OrganizationId == null)
                    .FirstOrDefault();
                    }
                }
            }
            return result;
        }

        private Customer SelectCustomer(int customerId)
        {
            Customer customer = new Customer();
            ProspectingCustomer prospectingCustomer = _ipsDataContext.ProspectingCustomers.Where(x => x.Id == customerId).FirstOrDefault();
            if (prospectingCustomer != null)
            {
                if (prospectingCustomer.CustomerId > 0)
                {
                    customer = _ipsDataContext.Customers.Where(x => x.Id == prospectingCustomer.CustomerId).FirstOrDefault();
                }
            }
            return customer;
        }
        private List<CustomerTaskNotificationRecipient> SendMeetingTaskCreatedEmailNotification(Task task, Customer customer, int prospectingCustomerId, string notificationTemplate)
        {
            NotificationTemplate meetingScheduleTemplate = null;
            List<CustomerTaskNotificationRecipient> allRecepients = new List<CustomerTaskNotificationRecipient>();
            Task prospectingTask = SelectProspectingTaskByProspectingCustomerId(prospectingCustomerId);
            if (prospectingTask != null)
            {

                meetingScheduleTemplate = SelectMeetingScheduleTemplate(prospectingTask.MeetingNotificationTemplateId);
            }
            else
            {
                meetingScheduleTemplate = SelectMeetingScheduleTemplate(null);
            }
            if (meetingScheduleTemplate != null)
            {
                if (!string.IsNullOrEmpty(notificationTemplate))
                {
                    meetingScheduleTemplate.EmailBody = notificationTemplate;
                }
                VerifyTemplate(meetingScheduleTemplate, true, false);

                User taskAssignedUser = _ipsDataContext.Users
                    .Include("Organization")
                    .Where(u => u.Id == task.AssignedToId).AsNoTracking().FirstOrDefault();

                CustomerTaskNotificationRecipient taskCustomer = new CustomerTaskNotificationRecipient
                {
                    TaskAssignedUser = taskAssignedUser,
                    RecipientCustomer = customer,
                    Task = task,
                };
                System.Threading.Tasks.Task.Factory.StartNew(() =>
                {
                    SendCustomerTaskNotification(new List<CustomerTaskNotificationRecipient> { taskCustomer }, meetingScheduleTemplate);
                });
                //TaskSendNotification()
                allRecepients.Add(taskCustomer);
            }



            return allRecepients;
        }

        private List<CustomerSalesAgreedNotificationRecipient> SendSalesAgreedItemCreatedEmailNotification(Customer customer, int prospectingCustomerId, List<ProspectingCustomerSalesAgreedData> prospectingCustomerSalesAgreedDatas, string notificationTemplate)
        {
            List<CustomerSalesAgreedNotificationRecipient> allRecepients = new List<CustomerSalesAgreedNotificationRecipient>();
            Task prospectingTask = SelectProspectingTaskByProspectingCustomerId(prospectingCustomerId);
            if (prospectingTask != null)
            {
                var SalesAgreedTemplate = SelectSalesAgreedTemplate(prospectingTask.SalesNotificationTemplateId);
                if (SalesAgreedTemplate != null)
                {
                    if (!string.IsNullOrEmpty(notificationTemplate))
                    {
                        SalesAgreedTemplate.EmailBody = notificationTemplate;
                    }
                    VerifyTemplate(SalesAgreedTemplate, true, false);

                    User taskAssignedUser = _ipsDataContext.Users
                        .Include("Organization")
                        .Where(u => u.Id == prospectingTask.AssignedToId).AsNoTracking().FirstOrDefault();

                    CustomerSalesAgreedNotificationRecipient customerSalesAgreed = new CustomerSalesAgreedNotificationRecipient
                    {
                        TaskAssignedUser = taskAssignedUser,
                        RecipientCustomer = customer,
                        prospectingCustomerSalesAgreedDatas = prospectingCustomerSalesAgreedDatas,
                    };
                    System.Threading.Tasks.Task.Factory.StartNew(() =>
                    {
                        SendCustomerSalesAgreedNotification(new List<CustomerSalesAgreedNotificationRecipient> { customerSalesAgreed }, SalesAgreedTemplate);
                    });
                    //TaskSendNotification()
                    allRecepients.Add(customerSalesAgreed);
                }
            }
            return allRecepients;
        }

        private List<CustomerTaskNotificationRecipient> SendFollowupTaskCreatedEmailNotification(Task task, Customer customer, int prospectingCustomerId, string notificationTemplate)
        {
            NotificationTemplate followupTaskTemplate = null;
            List<CustomerTaskNotificationRecipient> allRecepients = new List<CustomerTaskNotificationRecipient>();
            Task prospectingTask = SelectProspectingTaskByProspectingCustomerId(prospectingCustomerId);
            if (prospectingTask != null)
            {
                followupTaskTemplate = SelectFollowupScheduleTemplate(prospectingTask.FollowUpNotificationTemplateId);
            }
            else
            {
                followupTaskTemplate = SelectFollowupScheduleTemplate(null);
            }
            if (followupTaskTemplate != null)
            {
                if (!string.IsNullOrEmpty(notificationTemplate))
                {
                    followupTaskTemplate.EmailBody = notificationTemplate;
                }
                VerifyTemplate(followupTaskTemplate, true, false);

                User taskAssignedUser = _ipsDataContext.Users
                    .Include("Organization")
                    .Where(u => u.Id == task.AssignedToId).AsNoTracking().FirstOrDefault();

                CustomerTaskNotificationRecipient taskCustomer = new CustomerTaskNotificationRecipient
                {
                    TaskAssignedUser = taskAssignedUser,
                    RecipientCustomer = customer,
                    Task = task,
                };
                System.Threading.Tasks.Task.Factory.StartNew(() =>
                {
                    SendCustomerTaskNotification(new List<CustomerTaskNotificationRecipient> { taskCustomer }, followupTaskTemplate);
                });
                //TaskSendNotification()
                allRecepients.Add(taskCustomer);
            }

            return allRecepients;
        }


        private void SendCustomerSalesAgreedNotification(List<CustomerSalesAgreedNotificationRecipient> recipients, NotificationTemplate template)
        {
            if (recipients.Count > 0)
            {
                foreach (var recipient in recipients)
                {
                    try
                    {
                        SendCustomerSalesAgreedNotification(recipient, template);
                        Log.Debug(String.Format("Send email to Customer with Id {0}, name {1} at {2} successful", recipient.RecipientCustomer.Id, recipient.RecipientCustomer.Name, DateTime.Now.ToLongDateString()));
                    }
                    catch (Exception ex)
                    {
                        Log.Error(String.Format("Send email to participant with Id {0}, name {1} at {2} failed", recipient.RecipientCustomer.Id, recipient.RecipientCustomer.Name, DateTime.Now.ToLongDateString()), ex);
                    }


                }
            }
        }
        private void SendCustomerTaskNotification(List<CustomerTaskNotificationRecipient> recipients, NotificationTemplate template)
        {
            if (recipients.Count > 0)
            {
                foreach (var recipient in recipients)
                {


                    try
                    {

                        SendCustomerTaskEmailNotification(recipient, template);
                        Log.Debug(String.Format("Send email to Customer with Id {0}, name {1} at {2} successful", recipient.RecipientCustomer.Id, recipient.RecipientCustomer.Name, DateTime.Now.ToLongDateString()));
                    }
                    catch (Exception ex)
                    {
                        Log.Error(String.Format("Send email to participant with Id {0}, name {1} at {2} failed", recipient.RecipientCustomer.Id, recipient.RecipientCustomer.Name, DateTime.Now.ToLongDateString()), ex);
                    }


                }
            }
        }

        private void SendCustomerSalesAgreedNotification(CustomerSalesAgreedNotificationRecipient recipient, NotificationTemplate template)
        {
            if (!string.IsNullOrWhiteSpace(template.EmailSubject) && !string.IsNullOrWhiteSpace(template.EmailBody))
            {
                IpsAddress emailAddress = new IpsAddress();
                IpsMessage emailMessage = new IpsMessage();
                Log.Debug("Process to send mail to Customer " + recipient.RecipientCustomer.Name + " - " + recipient.RecipientCustomer.Id);
                if (string.IsNullOrEmpty(recipient.RecipientCustomer.Email))
                {
                    Log.Debug(recipient.RecipientCustomer.Id + "-" + recipient.RecipientCustomer.Name + " has no email address ");
                }
                else
                {
                    emailAddress.Address = new List<string> { recipient.RecipientCustomer.Email };
                }
                if (!string.IsNullOrEmpty(recipient.TaskAssignedUser.WorkEmail))
                {
                    emailAddress.Address.Add(recipient.TaskAssignedUser.WorkEmail);
                }
                emailMessage.Subject = ReplaceCustomerSalesAgreedMacroses(template.EmailSubject, recipient);
                emailMessage.Message = ReplaceCustomerSalesAgreedMacroses(template.EmailBody, recipient);
                _mailNotification.Send(emailAddress, emailMessage);
            }
        }
        private void SendCustomerTaskEmailNotification(CustomerTaskNotificationRecipient recipient, NotificationTemplate template)
        {
            if (!string.IsNullOrWhiteSpace(template.EmailSubject) && !string.IsNullOrWhiteSpace(template.EmailBody))
            {
                IpsAddress emailAddress = new IpsAddress();
                IpsMessage emailMessage = new IpsMessage();
                Log.Debug("Process to send mail to Customer " + recipient.RecipientCustomer.Name + " - " + recipient.RecipientCustomer.Id);
                if (string.IsNullOrEmpty(recipient.RecipientCustomer.Email))
                {
                    Log.Debug(recipient.RecipientCustomer.Id + "-" + recipient.RecipientCustomer.Name + " has no email address ");
                }
                else
                {
                    emailAddress.Address = new List<string> { recipient.RecipientCustomer.Email };
                }
                if (!string.IsNullOrEmpty(recipient.TaskAssignedUser.WorkEmail))
                {
                    emailAddress.Address.Add(recipient.TaskAssignedUser.WorkEmail);
                }
                emailMessage.Subject = ReplaceCustomerTaskMacroses(template.EmailSubject, recipient);
                emailMessage.Message = ReplaceCustomerTaskMacroses(template.EmailBody, recipient);
                _mailNotification.Send(emailAddress, emailMessage);
            }
        }
        private string ReplaceCustomerTaskMacroses(string templateText, CustomerTaskNotificationRecipient recipient)
        {
            foreach (var macros in _customerTaskMacroses)
            {
                if (templateText.Contains(macros))
                {
                    var value = GetCustomerTaskMacrosValue(macros, recipient);
                    templateText = templateText.Replace(macros, value);
                }
            }

            return templateText;
        }

        private string ReplaceCustomerSalesAgreedMacroses(string templateText, CustomerSalesAgreedNotificationRecipient recipient)
        {
            foreach (var macros in _customerSalesAgreedMacroses)
            {
                if (templateText.Contains(macros))
                {
                    var value = GetCustomerSalesAgreedMacrosValue(macros, recipient);
                    templateText = templateText.Replace(macros, value);
                }
            }

            return templateText;
        }
        private string GetCustomerTaskMacrosValue(string macros, CustomerTaskNotificationRecipient recipient)
        {
            switch (macros)
            {
                case "[CustomerName]":
                    return recipient.RecipientCustomer.Name;
                case "[CustomerEmail]":
                    return recipient.RecipientCustomer.Email;
                case "[CustomerMobile]":
                    return recipient.RecipientCustomer.Mobile;
                case "[Title]":
                    return recipient.Task == null ? string.Empty : recipient.Task.Title;
                case "[StartDate]":
                    return recipient.Task == null ? string.Empty : ((DateTime)recipient.Task.StartDate).ToString("g");
                case "[DueDate]":
                    return recipient.Task == null ? string.Empty : ((DateTime)recipient.Task.DueDate).ToString("g");
                case "[SalesMan]":
                    return recipient.TaskAssignedUser.FirstName + " " + recipient.TaskAssignedUser.LastName;
                case "[SalesManEmail]":
                    return recipient.TaskAssignedUser.WorkEmail;
                case "[SalesManMobile]":
                    return recipient.TaskAssignedUser.MobileNo;
                case "[OrganizationName]":
                    return recipient.TaskAssignedUser.Organization == null ? string.Empty : recipient.TaskAssignedUser.Organization.Name;
                case "[OrganizationLogo]":
                    return recipient.TaskAssignedUser.Organization == null ? string.Empty : recipient.TaskAssignedUser.Organization.LogoLink;
                default:
                    return string.Empty;
            }
        }

        private string GetCustomerSalesAgreedMacrosValue(string macros, CustomerSalesAgreedNotificationRecipient recipient)
        {
            switch (macros)
            {
                case "[CustomerName]":
                    return recipient.RecipientCustomer.Name;
                case "[CustomerEmail]":
                    return recipient.RecipientCustomer.Email;
                case "[CustomerMobile]":
                    return recipient.RecipientCustomer.Mobile;
                case "[TalkDate]":
                    if (recipient.prospectingCustomerSalesAgreedDatas.FirstOrDefault() != null)
                    {
                        return (recipient.prospectingCustomerSalesAgreedDatas.FirstOrDefault().CreatedOn).ToString("g");
                    }
                    else
                    {
                        return (DateTime.Now).ToString("g");
                    }
                case "[CurrentDate]":
                    return (DateTime.Now).ToString("g");
                case "[SalesMan]":
                    return recipient.TaskAssignedUser.FirstName + " " + recipient.TaskAssignedUser.LastName;
                case "[SalesManEmail]":
                    return recipient.TaskAssignedUser.WorkEmail;
                case "[SalesManMobile]":
                    return recipient.TaskAssignedUser.MobileNo;
                case "[OrganizationName]":
                    return recipient.TaskAssignedUser.Organization == null ? string.Empty : recipient.TaskAssignedUser.Organization.Name;
                case "[OrganizationLogo]":
                    return recipient.TaskAssignedUser.Organization == null ? string.Empty : recipient.TaskAssignedUser.Organization.LogoLink;
                case "[List]":
                    return getSalesAgreedList(recipient.prospectingCustomerSalesAgreedDatas);
                default:
                    return string.Empty;
            }
        }

        private string getSalesAgreedList(List<ProspectingCustomerSalesAgreedData> prospectingCustomerSalesAgreedDatas)
        {
            string table = "<table class='table hide' style='width: 100%;'><tbody>";
            string headerRowTemplate = "<tr style='text-align:center;'> <th>{0}</th><th>{1}</th><th>{2}</th><th>{3}</th></tr>";
            if (prospectingCustomerSalesAgreedDatas.Count > 0)
            {
                table += string.Format(headerRowTemplate, "Sale", "Description", "Amount", "Delivery date");
                foreach (ProspectingCustomerSalesAgreedData customerSalesAgreedDataItem in prospectingCustomerSalesAgreedDatas)
                {
                    string rowTemplate = "<tr style='text-align:center;'> <td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td></tr>";
                    string categoryText = string.Empty;
                    if (customerSalesAgreedDataItem.SalesCategoryId == (int)SaleCategoryEnum.SaleProduct)
                    {
                        categoryText = "Sale Product";
                    }
                    else if (customerSalesAgreedDataItem.SalesCategoryId == (int)SaleCategoryEnum.SaleService)
                    {
                        categoryText = "Sale Service";
                    }
                    else if (customerSalesAgreedDataItem.SalesCategoryId == (int)SaleCategoryEnum.ServiceRepair)
                    {
                        categoryText = "Service Repair";
                    }
                    else if (customerSalesAgreedDataItem.SalesCategoryId == (int)SaleCategoryEnum.ServiceProduct)
                    {
                        categoryText = "Service Product";
                    }
                    table += string.Format(rowTemplate, categoryText, customerSalesAgreedDataItem.Description, customerSalesAgreedDataItem.Amount, customerSalesAgreedDataItem.DeliveryDate.ToString("g"));
                }
            }
            table += "</tbody></table>";
            return table;
        }

        private string getStageResultKPISummaryData(StageResultNotificationRecipient stageResultNotificationRecipient, string culture)
        {
            string kpiScoreSummaryTable = "<table class='table hide' style='width: 100%;'><tbody>";
            if (stageResultNotificationRecipient.NotifyAboutProfile.Id > 0)
            {
                List<KPIScoreSummaryData> kPIScoreSummaryDatas = new List<KPIScoreSummaryData>();

                TrainingDiaryService _trainingDiaryService = new TrainingDiaryService();
                IpsTrainingDiary profileData = _trainingDiaryService.GetUserProfileStageTrainings(stageResultNotificationRecipient.NotifyAboutUser.Id, stageResultNotificationRecipient.NotifyAboutProfile.Id).FirstOrDefault();
                if (profileData != null)
                {
                    bool isStartStage = false;
                    int stageIndex = 0;
                    foreach (IpsTrainingDiaryStage stageItem in profileData.IpsTrainingDiaryStages)
                    {
                        IpsTrainingDiaryStage previousStageItem = null;
                        if (stageIndex > 0)
                        {
                            previousStageItem = profileData.IpsTrainingDiaryStages[stageIndex - 1];
                        }
                        if (stageItem.Id == stageResultNotificationRecipient.NotifyAboutStage.StageId)
                        {
                            if (stageIndex == 0)
                            {
                                isStartStage = true;
                            }
                            foreach (IpsEvaluationAgreement evaluationAgreementItem in stageItem.EvaluationAgreement)
                            {
                                if (evaluationAgreementItem.Question != null)
                                {
                                    IpsMilestoneAgreementGoal selectedMilestoneAgreementGoal = null;
                                    if (evaluationAgreementItem.MilestoneAgreementGoals.Count() > 0)
                                    {
                                        selectedMilestoneAgreementGoal = evaluationAgreementItem.MilestoneAgreementGoals.Where(x => x.StageId == stageItem.Id).FirstOrDefault();
                                    }

                                    foreach (IpsSkillDDL skillItem in evaluationAgreementItem.Question.Skills)
                                    {
                                        decimal? previousStageScore = 0;
                                        if (previousStageItem != null)
                                        {
                                            foreach (IpsEvaluationAgreement previousStageEvaluationAgreementItem in previousStageItem.EvaluationAgreement)
                                            {
                                                if (previousStageEvaluationAgreementItem.Question != null)
                                                {
                                                    foreach (IpsSkillDDL previousStageSkillItem in previousStageEvaluationAgreementItem.Question.Skills)
                                                    {
                                                        if (previousStageSkillItem.Id == skillItem.Id)
                                                        {
                                                            previousStageScore = previousStageEvaluationAgreementItem.FinalScore;
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        KPIScoreSummaryData kpiScoreSummaryData = new KPIScoreSummaryData()
                                        {
                                            CurrentStageGoal = selectedMilestoneAgreementGoal != null ? selectedMilestoneAgreementGoal.Goal : 0,
                                            CurrentStageScore = evaluationAgreementItem.FinalScore,
                                            KpiType = evaluationAgreementItem.KPIType,
                                            SkillId = skillItem.Id,
                                            SkillName = skillItem.Name,
                                            PreviousStageName = previousStageItem != null ? previousStageItem.Name : string.Empty,
                                            PreviousStageScore = previousStageScore.HasValue ? previousStageScore.Value : 0,
                                        };

                                        kpiScoreSummaryData.StagePerformance = CalculateStagePerformance(kpiScoreSummaryData.CurrentStageScore, kpiScoreSummaryData.CurrentStageGoal);
                                        kpiScoreSummaryData.StageProgress = CalculateStageProgress(kpiScoreSummaryData.CurrentStageScore, kpiScoreSummaryData.PreviousStageScore);
                                        kPIScoreSummaryDatas.Add(kpiScoreSummaryData);
                                    }


                                }
                            }
                        }
                        stageIndex++;
                    }


                    if (isStartStage)
                    {
                        string headerRowTemplate = "<tr style='text-align:center;'> <th style='text-align:left;'>{0}</th><th style='text-align:left;'>{1}</th><td>{2}</td></tr>";
                        if (culture.ToLower() == "nb-no")
                        {
                            kpiScoreSummaryTable += string.Format(headerRowTemplate, "KPI", "Ferdighet", "Score");
                        }
                        else
                        {
                            kpiScoreSummaryTable += string.Format(headerRowTemplate, "KPI", "Skill", "Score");
                        }
                        foreach (KPIScoreSummaryData kpiScoreSummaryDataItem in kPIScoreSummaryDatas)
                        {
                            string rowTemplate = "<tr style='text-align:center;'> <td style='text-align:left;'>{0}</td><td style='text-align:left;'>{1}</td><td>{2}</td></tr>";
                            kpiScoreSummaryTable += string.Format(rowTemplate, GetKPIIcon(kpiScoreSummaryDataItem.KpiType), kpiScoreSummaryDataItem.SkillName, kpiScoreSummaryDataItem.CurrentStageScore);
                        }
                    }
                    else
                    {
                        string headerRowTemplate = "<tr style='text-align:center;'> <th style='text-align:left;'>{0}</th><th style='text-align:left;'>{1}</th><th>{2}</th><th>{3}</th><th>{4}</th><th>{5}</th><th>{6}</th></tr>";
                        if (culture.ToLower() == "nb-no")
                        {
                            kpiScoreSummaryTable += string.Format(headerRowTemplate, "KPI", "Ferdighet", "Score", "Mål", "Progresjon", "Prestasjon", "");
                        }
                        else
                        {
                            kpiScoreSummaryTable += string.Format(headerRowTemplate, "KPI", "Skill", "Score", "Goal", "Progress", "Performance", "");
                        }
                        foreach (KPIScoreSummaryData kpiScoreSummaryDataItem in kPIScoreSummaryDatas)
                        {
                            string rowTemplate = "<tr style='text-align:center;'> <td style='text-align:left;'>{0}</td><td style='text-align:left;'>{1}</td><td>{2}</td><td>{3}</td><td>{4}%</td><td>{5}%</td><td>{6}</td></tr>";
                            kpiScoreSummaryTable += string.Format(rowTemplate, GetKPIIcon(kpiScoreSummaryDataItem.KpiType), kpiScoreSummaryDataItem.SkillName, kpiScoreSummaryDataItem.CurrentStageScore, kpiScoreSummaryDataItem.CurrentStageGoal, kpiScoreSummaryDataItem.StageProgress, kpiScoreSummaryDataItem.StagePerformance, GetSmileyFace(kpiScoreSummaryDataItem.StagePerformance));
                        }
                    }


                }
            }
            kpiScoreSummaryTable += "</tbody></table>";
            return kpiScoreSummaryTable;
        }
        private string getStageResultKPITimeSummaryData(StageResultNotificationRecipient stageResultNotificationRecipient, string culture)
        {
            string kpiTimeSummaryTable = "<table class='table hide' style='width: 100%;'><tbody>";
            if (stageResultNotificationRecipient.NotifyAboutProfile.Id > 0)
            {
                List<KPITimeSummaryData> kPITimeSummaryDatas = new List<KPITimeSummaryData>();

                TrainingDiaryService _trainingDiaryService = new TrainingDiaryService();
                IpsTrainingDiary profileData = _trainingDiaryService.GetUserProfileStageTrainings(stageResultNotificationRecipient.NotifyAboutUser.Id, stageResultNotificationRecipient.NotifyAboutProfile.Id).FirstOrDefault();
                if (profileData != null)
                {
                    int stageIndex = 0;
                    foreach (IpsTrainingDiaryStage stageItem in profileData.IpsTrainingDiaryStages)
                    {
                        if (stageItem.Id == stageResultNotificationRecipient.NotifyAboutStage.StageId)
                        {
                            foreach (IpsEvaluationAgreement evaluationAgreementItem in stageItem.EvaluationAgreement)
                            {
                                if (evaluationAgreementItem.Question != null)
                                {
                                    foreach (IpsSkillDDL skillItem in evaluationAgreementItem.Question.Skills)
                                    {
                                        KPITimeSummaryData kpiTimeSummaryData = new KPITimeSummaryData()
                                        {
                                            KpiType = evaluationAgreementItem.KPIType,
                                            SkillId = skillItem.Id,
                                            SkillName = skillItem.Name,
                                        };

                                        if (evaluationAgreementItem.Trainings.Count() > 0)
                                        {
                                            foreach (IpsTrainingModel trainingItem in evaluationAgreementItem.Trainings)
                                            {
                                                if (trainingItem.Id > 0)
                                                {
                                                    int skillId = 0;
                                                    if (trainingItem.SkillId.HasValue)
                                                    {
                                                        skillId = trainingItem.SkillId.Value;
                                                    }
                                                    else if (trainingItem.Skills.Count > 0)
                                                    {
                                                        if (trainingItem.Skills[0].Id.HasValue)
                                                        {
                                                            skillId = trainingItem.Skills[0].Id.Value;
                                                        }
                                                    }
                                                    if (skillId == skillItem.Id)
                                                    {
                                                        foreach (IPSTrainingFeedback itemfeedback in trainingItem.TrainingFeedbacks)
                                                        {
                                                            if (itemfeedback.EvaluatorId == null)
                                                            {
                                                                bool isTrainingFinished = true;
                                                                if (itemfeedback.IsParticipantPaused == true)
                                                                {

                                                                    var finishedTraining = trainingItem.TrainingFeedbacks.Where(x => x.RecurrencesStartTime == itemfeedback.RecurrencesStartTime && x.RecurrencesEndTime == itemfeedback.RecurrencesEndTime && x.IsParticipantPaused == false).ToList();
                                                                    if (finishedTraining.Count > 0)
                                                                    {
                                                                        isTrainingFinished = true;
                                                                    }
                                                                    else
                                                                    {
                                                                        isTrainingFinished = false;
                                                                    }
                                                                }
                                                                if (!(itemfeedback.IsParticipantPaused == true && isTrainingFinished == true))
                                                                {
                                                                    if (trainingItem.UserId == null)
                                                                    {
                                                                        if (itemfeedback.TimeSpentMinutes.HasValue)
                                                                        {
                                                                            kpiTimeSummaryData.SpentTime += itemfeedback.TimeSpentMinutes.Value;
                                                                        }
                                                                    }

                                                                }
                                                            }
                                                        }
                                                        List<DateTime> occurances = RecurrenceRuleParser.GetRecurrenceDateTime(trainingItem.Frequency, (DateTime)trainingItem.StartDate, (DateTime)trainingItem.EndDate);
                                                        int totalPlannedTime = 0;
                                                        if (trainingItem.DurationMetricId == 1)
                                                        {
                                                            if (trainingItem.Duration.HasValue)
                                                            {
                                                                totalPlannedTime += (trainingItem.Duration.Value * 60);
                                                            }
                                                        }
                                                        else if (trainingItem.DurationMetricId == 3)
                                                        {
                                                            if (trainingItem.Duration.HasValue)
                                                            {
                                                                totalPlannedTime += (trainingItem.Duration.Value);
                                                            }
                                                        }
                                                        else if (trainingItem.DurationMetricId == 4)
                                                        {
                                                            if (trainingItem.Duration.HasValue)
                                                            {
                                                                totalPlannedTime += (trainingItem.Duration.Value / 60);
                                                            }
                                                        }
                                                        else if (trainingItem.DurationMetricId == 5)
                                                        {
                                                            if (trainingItem.Duration.HasValue)
                                                            {
                                                                totalPlannedTime += (trainingItem.Duration.Value * 1440);
                                                            }
                                                        }
                                                        if (occurances.Count > 0)
                                                        {
                                                            kpiTimeSummaryData.TotalPlanTime += totalPlannedTime * occurances.Count;
                                                        }


                                                    }
                                                }
                                            }
                                            kpiTimeSummaryData.StageTimePerformance = CalculateStageTimePerformance(kpiTimeSummaryData.SpentTime, kpiTimeSummaryData.TotalPlanTime);
                                            kPITimeSummaryDatas.Add(kpiTimeSummaryData);
                                        }
                                    }
                                }
                                stageIndex++;
                            }


                            string headerRowTemplate = "<tr style='text-align:center;'> <th style='text-align:left;'>{0}</th><th style='text-align:left;'>{1}</th><th>{2}</th><th>{3}</th><th>{4}</th></tr>";
                            if (culture.ToLower() == "nb-no")
                            {
                                kpiTimeSummaryTable += string.Format(headerRowTemplate, "KPI", "Ferdighet", "Tid Utført", "Tid planlagt", "Prestasjon");
                            }
                            else
                            {
                                kpiTimeSummaryTable += string.Format(headerRowTemplate, "KPI", "Skill", "Spent Time", "Time Planned", "Performance");
                            }

                            foreach (KPITimeSummaryData kPITimeSummaryData in kPITimeSummaryDatas)
                            {
                                string rowTemplate = "<tr style='text-align:center;'> <td style='text-align:left;'>{0}</td><td style='text-align:left;'>{1}</td><td>{2}</td><td>{3}</td><td>{4}%</td></tr>";
                                kpiTimeSummaryTable += string.Format(rowTemplate, GetKPIIcon(kPITimeSummaryData.KpiType), kPITimeSummaryData.SkillName, GetTimeString(kPITimeSummaryData.SpentTime), GetTimeString(kPITimeSummaryData.TotalPlanTime), kPITimeSummaryData.StageTimePerformance);
                            }


                        }
                    }

                }
            }
            kpiTimeSummaryTable += "</tbody></table>";
            return kpiTimeSummaryTable;
        }
        private string GetSmileyFace(decimal performance)
        {
            string result = string.Empty;
            if (performance > 0)
            {
                result = "<div style='width:15px;height: 15px;background: url(https://localhost:8477/app/images/progress-reached.png) no-repeat; background-size:100%;'></div>";
            }
            else
            {
                result = "<div style='width: 15px;height: 15px;background: url(https://localhost:8477/app/images/progress-notmet.png) no-repeat; background-size:100%;'></div>";
            }
            return result;
        }
        private string GetKPIIcon(int kpiType)
        {
            string result = string.Empty;
            if (kpiType == 1)
            {
                result = "<div style='border-radius:50%;background-color:green;height:15px;width:15px;'></div>";

            }
            else if (kpiType == 2)
            {
                result = "<div style='border-radius:50%;background-color:red;height:15px;width:15px;'></div>";
            }
            return result;
        }
        private string GetTimeString(double totalTime)
        {
            string result = string.Empty;

            TimeSpan timeSpan = TimeSpan.FromMinutes(totalTime);
            result = timeSpan.ToString(@"hh\:mm");
            return result;
        }
        private decimal CalculateStagePerformance(decimal? stageScore, decimal? stageGoal)
        {
            decimal avg = 0;
            try
            {
                if (stageScore.HasValue && stageGoal.HasValue)
                {
                    if (stageScore.Value > 0 && stageGoal.Value > 0)
                    {
                        avg = (stageScore.Value / stageGoal.Value) * 100;
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
            }
            return Math.Round(avg, 2);
        }
        private decimal CalculateStageProgress(decimal? stageScore, decimal? previousScore)
        {
            decimal avg = 0;
            try
            {
                if (stageScore.HasValue && previousScore.HasValue)
                {
                    if (stageScore.Value > 0 && previousScore.Value > 0)
                    {
                        decimal diff = stageScore.Value - previousScore.Value;
                        avg = (diff / previousScore.Value) * 100;
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
            }
            return Math.Round(avg, 2);
        }
        private double CalculateStageTimePerformance(double? stageSpentTime, double? stagePlannedTime)
        {
            double avg = 0;
            try
            {
                if (stageSpentTime.HasValue && stagePlannedTime.HasValue)
                {
                    if (stagePlannedTime.Value > 0 && stagePlannedTime.Value > 0)
                    {
                        avg = (stageSpentTime.Value / stagePlannedTime.Value) * 100;
                    }
                }
            }
            catch (Exception ex)
            {
                Log.Error(ex.Message);
            }
            return Math.Round(avg, 2);
        }
    }


    class KPIScoreSummaryData
    {
        public int KpiType { get; set; }
        public int? SkillId { get; set; }
        public string SkillName { get; set; }
        public double StartScore { get; set; }
        public Nullable<decimal> CurrentStageGoal { get; set; }
        public Nullable<decimal> CurrentStageScore { get; set; }
        public Nullable<decimal> PreviousStageScore { get; set; }
        public string PreviousStageName { get; set; }
        public decimal StageProgress { get; set; }
        public decimal StagePerformance { get; set; }

    }
    class KPITimeSummaryData
    {
        public int KpiType { get; set; }
        public int? SkillId { get; set; }
        public string SkillName { get; set; }
        public double TotalPlanTime { get; set; }
        public double SpentTime { get; set; }
        public double TotalAgreegatedPlanTime { get; set; }
        public double AgreegatedSpentTime { get; set; }
        public double StageTimePerformance { get; set; }
        public double StageAgreegatedTimePerformance { get; set; }
    }

    class StageResultNotificationRecipient
    {
        public User RecipientUser { get; set; }
        public int ParticipantId { get; set; }
        public User NotifyAboutUser { get; set; }
        public Profile NotifyAboutProfile { get; set; }
        public IpsStageNotification NotifyAboutStage { get; set; }
        public bool SendEmail { get; set; }
        public bool SendSMS { get; set; }
        public bool IsEmailNotificationDelivered { get; set; }
        public bool IsSMSNotificationDelivered { get; set; }
    }

    class NotificationRecipient
    {
        public User RecipientUser { get; set; }
        public int RecipientParticipantId { get; set; }
        public User NotifyAboutUser { get; set; }
        public Profile NotifyAboutProfile { get; set; }
        public IpsStageNotification NotifyAboutStage { get; set; }
        public bool SendEmail { get; set; }
        public bool SendSMS { get; set; }
        public bool IsEmailNotificationDelivered { get; set; }
        public bool IsSMSNotificationDelivered { get; set; }
    }
    class TaskNotificationRecipient
    {
        public string Profile { get; set; }
        public Task Task { get; set; }
        public User RecipientUser { get; set; }
        public User TrainerUser { get; set; }
        public bool SendEmail { get; set; }
        public bool SendSMS { get; set; }
        public bool IsEmailNotificationDelivered { get; set; }
        public bool IsSMSNotificationDelivered { get; set; }
    }

    class CustomerTaskNotificationRecipient
    {
        public string Prospecting { get; set; }
        public Task Task { get; set; }
        public Customer RecipientCustomer { get; set; }
        public User TaskAssignedUser { get; set; }
    }

    class CustomerSalesAgreedNotificationRecipient
    {
        public string Prospecting { get; set; }
        public List<ProspectingCustomerSalesAgreedData> prospectingCustomerSalesAgreedDatas { get; set; }
        public Customer RecipientCustomer { get; set; }
        public User TaskAssignedUser { get; set; }
    }

    class TrainingNotificationRecipient
    {
        public string Profile { get; set; }
        public Training Training { get; set; }
        public User RecipientUser { get; set; }
        public User TrainerUser { get; set; }
        public bool SendEmail { get; set; }
        public bool SendSMS { get; set; }
        public bool IsEmailNotificationDelivered { get; set; }
        public bool IsSMSNotificationDelivered { get; set; }
    }
}
