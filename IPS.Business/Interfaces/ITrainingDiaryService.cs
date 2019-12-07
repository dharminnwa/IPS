using System;
using IPS.Data;
using System.Collections.Generic;
using System.Linq;
using IPS.BusinessModels.TrainingDiaryModels;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.TaskModels;
using IPS.BusinessModels.TrainingModels;

namespace IPS.Business
{
    public interface ITrainingDiaryService
    {
        List<IpsTrainingDiary> GetUserActiveProfiles(int userId);
        List<IpsTrainingDiary> GetUserProfileStageTrainings(int userId, int profileId);
        List<IpsTrainingModel> GetUserTrainingsForTimeCalculation(int userId);
        List<IpsTrainingModel> GetUserPersonalTrainingsForToday(int userId);
        List<IpsTrainingModel> GetUserProfileTrainingsForToday(int userId);
        List<IpsProjectTrainingModel> GetProjectTrainings(int projectId);
        List<IpsTrainingDiary> GetUserPassedProfiles(int userId,DateTime StartDate,DateTime EndDate);

        List<IpsTrainingModel> GetOwnTraining(int userId,int statusId);
        IpsOwnTrainingsCounts GetOwnTrainingCounts(int userId);
       
        TrainingFeedback AddTrainingFeedback(TrainingFeedback trainingFeedback);
        int UpdateTrainingFeedback(TrainingFeedback trainingFeedback);
        List<IPSTrainingFeedback> getTrainingFeedbacks(int trainingId);
        IPSTrainingFeedback getTrainingFeedbackById(int trainingFeedbackId);
        List<IPSTrainingNote> getTrainingNotes(int trainingId);
        List<Training> GetAllPersonalTrainingsForEmail();
        List<Training> GetAllPersonalTrainingRecurrencesForEmail();
        List<Training> GetAllPersonalTrainingsForSMS();
        List<Training> GetAllPersonalTrainingRecurrencesForSMS();

        List<IpsTrainingModel> GetAllProfileTrainingsForEmail();
        List<IpsTrainingModel> GetAllProfileTrainingsForSMS();

        List<IPSParticipants> GetOrganizationParticipants(int organizationId);
        List<IpsCalenderEvents> getCalanderEventsByUserId(IpsCalenderEventFilterModel ipsCalenderEventFilterModel);
        int setEventsByUserId(IpsCalenderEvents ipsCalenderEvent);
        int SubmitTrainingMaterialRating(TrainingMaterialRating trainingMaterialRating);
        IPSUserStatsModel GetUserStats(int userId);
        TaskActivity AddTaskActivity(TaskActivity taskActivity);
        TrainingMaterial AddTrainingMaterial(TrainingMaterial trainingMaterial);
    }
}
