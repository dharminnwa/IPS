using System;
using IPS.Data;
using System.Linq;
using IPS.BusinessModels.Common;
using System.Collections.Generic;
using IPS.BusinessModels.ProfileModels;
using IPS.BusinessModels.SalesActivityModels;
using IPS.BusinessModels.TaskModels;

namespace IPS.Business
{
    public interface IProfileService
    {
        Profile Add(Profile profile);

        Profile AddProfile(Profile profile);
        List<IpsProjectProfileModel> GetProjectProfiles(int projectId);

        void Delete(Profile profile);
        IQueryable<Profile> Get();
        IQueryable<Profile> GetById(int id);
        void Update(Profile profile);
        Profile CreateCopy(Profile profile, string copyName);
        void AddPerformanceGroupToProfileFromTemplate(int profileId, PerformanceGroup[] performanceGroups);
        Profile CloneProfile(Profile profile, string namePattern, int? projectId);
        bool IsProfileInUse(int profileId);
        bool IsProfileInUseByQuestion(int questionId);
        List<IPSDropDown> GetProfileStageGroupsByProfileId(int profileId);
        List<Profile> getProfileTemplates(int projectId, int profileTypeId);
        Profile getTemplateProfileById(int id);
        Profile getFullProfileById(int id);
        bool ChangeProfileStatus(int id);
        ProspectingGoalInfo AddProspectingGoal(ProspectingGoalInfo prospectingGoal);
        ProspectingGoalInfo UpadateProspectingGoal(ProspectingGoalInfo prospectingGoal);
        List<ProspectingGoalInfoModel> GetProspectingGoals();
        List<ProspectingGoalInfoModel> GetProspectingGoalsByUserId(int userId);
        List<ProspectingGoalInfoModel> GetServiceProspectingGoalsByUserId(int userId);
        List<ProspectingGoalInfoModel> GetProjectProspectingGoalsByUserId(int userId, int projectId);
        List<ProspectingGoalInfoModel> GetProjectServiceProspectingGoalsByUserId(int userId, int projectId);
        ProspectingCustomer AddProspectingCustomer(ProspectingCustomer prospectingCustomer);
        ProspectingCustomer UpadateProspectingCustomer(ProspectingCustomer prospectingCustomer);
        List<ProspectingCustomerModel> GetProspectingCustomers();
        List<ProspectingCustomerModel> GetProspectingCustomersByUserId(int userId);
        List<ProspectingCustomerModel> GetProspectingCustomersByUserIds(List<int> userIds);

        List<ProspectingCustomerModel> GetServiceProspectingCustomersByUserId(int userId);
        List<ProspectingCustomerModel> GetServiceProspectingCustomersByUserIds(List<int> userIds);

        List<ScaleRange> getScaleRanges(int profileId);
        ProspectingGoalActivityInfo AddProspectingGoalActivityInfo(ProspectingGoalActivityInfo prospectingGoalActivityInfo);
        ProspectingGoalActivityInfo UpdateProspectingGoalActivityInfo(ProspectingGoalActivityInfo prospectingGoalActivityInfo);
        bool DeleteProspectingActivity(int activityId);
        List<ProspectingGoalActivityInfoModel> GetProspectingGoalActivityInfoes();
        List<ProspectingGoalActivityInfoModel> GetProspectingGoalActivityInfoesByUserId(int userId);
        List<ProspectingGoalActivityInfoModel> GetServiceProspectingGoalActivityInfoesByUserId(int userId);

        List<ProspectingGoalActivityInfoModel> GetProspectingGoalActivityInfoesByUserIds(List<int> userIds);
        List<ProspectingGoalActivityInfoModel> GetServiceProspectingGoalActivityInfoesByUserIds(List<int> userIds);
        List<ProspectingCustomerResult> getCustomerActivityResult(int activityId, int customerId);
        List<ProspectingCustomerSalesAgreedData> GetCustomerSalesAgreedDatas(int activityId, int customerId);

        ProspectingCustomerResult saveCustomerActivityResult(ProspectingCustomerResult prospectingCustomerResult);
        List<ProspectingCustomerResult> getProspectingCustomerResults();
        List<ProspectingCustomerResult> getProspectingCustomerResultsByUserId(int userId);
        List<ProspectingCustomerResult> getServiceProspectingCustomerResultsByUserId(int userId);

        List<ProspectingCustomerResult> getProspectingCustomerResultsByUserIds(List<int> userIds);
        List<ProspectingCustomerResult> getServiceProspectingCustomerResultsByUserIds(List<int> userIds);

        ProspectingActivityLog saveActivityLog(ProspectingActivityLog prospectingActivityLog);
        ProspectingActivity updateProspectingActivity(ProspectingActivity prospectingActivity);
        ProspectingActivity saveProspectingActivity(ProspectingActivity prospectingActivity);
        List<int> uncheckCustomerActivityResult(ProspectingCustomerResult prospectingCustomerResult);
        List<ProspectingGoalInfoModel> getTaskProspectingGoals(int? taskId);
        List<ProspectingActivity> getTaskProspectingActivities(int goalId);
        List<ProspectingGoalScaleRanx> getProspectingScaleRangesByGoalId(int goalId);
        ProspectingActivityFeedback saveProspectingActivityFeedback(ProspectingActivityFeedback prospectingActivityFeedback);
        ProspectingActivityFeedback getProspectingActivityFeedbackByActivityId(int activityId);
        bool restartProspectingActivity(int prospectingActivityId);
        ExpiredProspectingActivityReason SaveActivityReason(ExpiredProspectingActivityReason expiredProspectingActivityReason);
    }
}
