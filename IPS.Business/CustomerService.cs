using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Threading.Tasks;
using log4net;
using IPS.Data.Enums;
using IPS.Business.Utils;
using IPS.BusinessModels.TrainingDiaryModels;
using IPS.BusinessModels.ProfileModels;
using IPS.BusinessModels.Common;
using IPS.BusinessModels.Enum;
using IPS.BusinessModels.TrainingModels;
using IPS.BusinessModels.TaskModels;
using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.UserModel;
using IPS.BusinessModels.ProjectModel;
using IPS.BusinessModels.CustomerModels;
using IPS.BusinessModels.Entities;
//using IPS.BusinessModels.Entities;

namespace IPS.Business
{

    public class CustomerService : BaseService, IPS.Business.ICustomerService
    {

        private static readonly ILog Log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        public Customer GetCustomerById(int id)
        {
            Customer result = new Customer();
            result = _ipsDataContext.Customers.Include("CustomerSalesDatas").Where(x => x.Id == id).FirstOrDefault();
            return result;
        }

        public List<CustomerHistoryModel> GetCustomerHistoryById(int id)
        {
            List<CustomerHistoryModel> result = new List<CustomerHistoryModel>();

            Customer customer = _ipsDataContext.Customers.Where(x => x.Id == id).FirstOrDefault();
            if (customer != null)
            {
                // Customer Added
                IpsUserModel userInfo = null;
                if (customer.CreatedBy.HasValue)
                {
                    userInfo = _ipsDataContext.Users.Where(x => x.Id == customer.CreatedBy.Value).Select(u => new IpsUserModel()
                    {
                        Id = u.Id,
                        Email = u.WorkEmail,
                        FirstName = u.FirstName,
                        ImageUrl = u.ImagePath,
                        IsActive = u.IsActive,
                        LastName = u.LastName,
                        OrganizationName = u.Organization.Name,
                    }).FirstOrDefault();
                }
                CustomerHistoryModel customerAdded = new CustomerHistoryModel()
                {
                    ActivityBy = customer.CreatedBy,
                    ActivityByUser = userInfo,
                    ActivityDate = customer.CreatedOn,
                    ActivityName = "Registered on IPS",
                    ResultType = 1,
                };
                result.Add(customerAdded);
            }


            List<ProspectingCustomer> prospctingcustomers = _ipsDataContext.ProspectingCustomers.Include("CustomerSalesData").Where(x => x.CustomerId == id).OrderBy(x => x.CreatedOn).ToList();
            // Added For Prospecting
            foreach (ProspectingCustomer prospctingCustomer in prospctingcustomers)
            {
                IpsUserModel userInfo = null;
                if (prospctingCustomer.CreatedBy.HasValue)
                {
                    userInfo = _ipsDataContext.Users.Where(x => x.Id == prospctingCustomer.CreatedBy.Value).Select(u => new IpsUserModel()
                    {
                        Id = u.Id,
                        Email = u.WorkEmail,
                        FirstName = u.FirstName,
                        ImageUrl = u.ImagePath,
                        IsActive = u.IsActive,
                        LastName = u.LastName,
                        OrganizationName = u.Organization.Name,
                    }).FirstOrDefault();
                }
                string description = string.Empty;
                ProspectingGoalInfo prospectingGoal = _ipsDataContext.ProspectingGoalInfoes.Include("Project").Where(x => x.Id == prospctingCustomer.ProspectingGoalId).FirstOrDefault();
                CustomerHistoryModel customerAddedForProspecting = new CustomerHistoryModel()
                {
                    ActivityBy = prospctingCustomer.CreatedBy,
                    ActivityByUser = userInfo,
                    ActivityDate = prospctingCustomer.CreatedOn,
                    ActivityName = "Added For Prospecting",
                    CustomerDescription = GetCustomerSalesDataAsDescription(prospctingCustomer.CustomerSalesData),
                    ProjectId = prospectingGoal.ProjectId.HasValue ? prospectingGoal.ProjectId.Value : 0,
                    ProjectName = prospectingGoal.Project != null ? prospectingGoal.Project.Name : string.Empty,
                    ProspectingGoalId = prospectingGoal.Id,
                    ProspectingGoalName = prospectingGoal.Name,
                    ResultType = 2,
                };
                result.Add(customerAddedForProspecting);
                SkillsService _skillService = new SkillsService();
                List<IpsSkillDDL> skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id);
                skills = skills.OrderBy(x => x.SeqNo).ToList();


                // Customer Called // Customer Talked   // Customer Meeting
                foreach (IpsSkillDDL skill in skills)
                {
                    ProspectingCustomerResult customerResult = _ipsDataContext.ProspectingCustomerResults.Include("ProspectingSchedules").Where(x => x.ProspectingCustomerId == prospctingCustomer.Id && x.SkillId == skill.Id).FirstOrDefault();
                    if (customerResult != null)
                    {
                        CustomerHistoryModel customerProspectingResult = new CustomerHistoryModel()
                        {
                            ActivityBy = customerResult.CreatedBy,
                            ActivityByUser = userInfo,
                            ActivityDate = customerResult.CreatedOn,
                            ActivityName = skill.Name,
                            CustomerDescription = GetCustomerSalesDataAsDescription(prospctingCustomer.CustomerSalesData),
                            ProjectId = prospectingGoal.ProjectId.HasValue ? prospectingGoal.ProjectId.Value : 0,
                            ProjectName = prospectingGoal.Project != null ? prospectingGoal.Project.Name : string.Empty,
                            ProspectingGoalId = prospectingGoal.Id,
                            ProspectingGoalName = prospectingGoal.Name,
                            SeqNo = skill.SeqNo.HasValue ? skill.SeqNo.Value : 0,
                            ResultType = 3,
                            ProspectingActivityId = customerResult.ProspectingActivityId,
                            ProspectingCustomerId = customerResult.ProspectingCustomerId,
                            ResultDescription = customerResult.Description,
                        };
                        if (customerResult.ProspectingSchedules.Count() > 0)
                        {
                            customerProspectingResult.ScheduleDate = customerResult.ProspectingSchedules.FirstOrDefault().ScheduleDate;
                            customerProspectingResult.SchduledFor = customerResult.IsMeeting ? "Meeting" : "Follow-up";
                        }
                        else
                        {
                            if (customerResult.IsNoMeeting)
                            {
                                customerProspectingResult.SchduledFor = "Not Agreed";

                            }
                        }
                        result.Add(customerProspectingResult);
                    }

                }
            }
            return result;
        }

        public ProspectingCustomerOfferDetail saveCustomerOfferDetail(ProspectingCustomerOfferDetail prospectingCustomerOfferDetail)
        {
            if (!(prospectingCustomerOfferDetail.Id > 0))
            {
                prospectingCustomerOfferDetail.OfferSentTime = DateTime.Now;
                prospectingCustomerOfferDetail.OfferSentBy = _authService.GetCurrentUserId();
                _ipsDataContext.ProspectingCustomerOfferDetails.Add(prospectingCustomerOfferDetail);
                int result = _ipsDataContext.SaveChanges();
                if (result > 0)
                {
                    AddNewFollowUpTask(prospectingCustomerOfferDetail);
                }
            }
            else
            {
                ProspectingCustomerOfferDetail original = _ipsDataContext.ProspectingCustomerOfferDetails.Where(x => x.Id == prospectingCustomerOfferDetail.Id).FirstOrDefault();
                if(original != null)
                {
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(prospectingCustomerOfferDetail);
                    _ipsDataContext.SaveChanges();
                }
            }
            return prospectingCustomerOfferDetail;
        }




        public List<ProspectingCustomerOfferDetail> getCustomerOfferDetails(int prospectingCustomerId)
        {
            List<ProspectingCustomerOfferDetail> result = new List<ProspectingCustomerOfferDetail>();
            result = _ipsDataContext.ProspectingCustomerOfferDetails.Include("OfferClosingDetails").Where(x => x.ProspectingCustomerId == prospectingCustomerId).ToList();
            return result;
        }

        public OfferClosingDetail saveOfferClosingDetail(OfferClosingDetail offerClosingDetail)
        {
            offerClosingDetail.ClosedBy = _authService.GetCurrentUserId();
            offerClosingDetail.ClosedTime = DateTime.Now;
            if (offerClosingDetail.Status != 2)
            {
                offerClosingDetail.IsClosed = true;
            }
            _ipsDataContext.OfferClosingDetails.Add(offerClosingDetail);

            _ipsDataContext.SaveChanges();
            return offerClosingDetail;

        }


        public string GetCustomerSalesDataAsDescription(CustomerSalesData customerSalesData)
        {
            string result = string.Empty;
            if (customerSalesData != null)
            {
                if (!string.IsNullOrEmpty(customerSalesData.Model))
                {
                    result += " Model : " + customerSalesData.Model;
                }
                if (!string.IsNullOrEmpty(customerSalesData.Type))
                {
                    result += " Type : " + customerSalesData.Type;
                }
                if (!string.IsNullOrEmpty(customerSalesData.RegistrationNo))
                {
                    result += " Registration No : " + customerSalesData.RegistrationNo;
                }

            }
            return result;

        }


        private Data.Task AddNewFollowUpTask(ProspectingCustomerOfferDetail prospectingCustomerOfferDetail)
        {
            Data.Task newTask = new Data.Task();
            ProspectingCustomer customer = _ipsDataContext.ProspectingCustomers.Where(x => x.Id == prospectingCustomerOfferDetail.ProspectingCustomerId).FirstOrDefault();

            ProspectingGoalInfo prospectingGoalInfo = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.Id == customer.ProspectingGoalId).FirstOrDefault();
            int userId = 0;
            if (prospectingGoalInfo != null)
            {
                if (prospectingGoalInfo.UserId != null)
                {
                    userId = prospectingGoalInfo.UserId.Value;
                }
                else if (prospectingGoalInfo.ParticipantId != null)
                {
                    EvaluationParticipant evaluationParticipant = new EvaluationParticipant();
                    // get user id by participant id
                    EvaluationParticipantsService evaluationParticipantsService = new EvaluationParticipantsService();
                    evaluationParticipant = evaluationParticipantsService.GetEvaluationParticipantsById(prospectingGoalInfo.ParticipantId.Value).FirstOrDefault();
                    userId = evaluationParticipant.UserId;
                }
            }

            // get user id by participant id

            newTask.AssignedToId = userId;
            // check for categort List 
            TaskCategoryListsService TaskCategoryListsService = new TaskCategoryListsService();

            TaskCategoryList taskCategoryList = TaskCategoryListsService.GetUserlist(userId).FirstOrDefault();
            if (taskCategoryList != null)
            {
                TaskCategoryListItem taskCategoryListItem = new TaskCategoryListItem();
                taskCategoryListItem = taskCategoryList.TaskCategoryListItems.Where(x => x.Name.ToLower().Contains("follow-up") == true).FirstOrDefault();
                if (taskCategoryListItem == null)
                {
                    taskCategoryListItem = new TaskCategoryListItem();
                    taskCategoryListItem.Name = "Follow-Up";
                    taskCategoryListItem.CategoryListId = taskCategoryList.Id;
                    taskCategoryListItem.Color = "#c3c3c3";
                    taskCategoryListItem.Description = "Follow-Up Schedule";
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
            newTask.Description = prospectingCustomerOfferDetail.Description;
            //Get and Set Profile based on evaluationAgreement

            newTask.ProfileId = null;

            // Get And set Priority 
            TaskPriorityListsService taskPriorityListsService = new TaskPriorityListsService();
            TaskPriorityList taskPriorityList = taskPriorityListsService.GetUserlist(userId).FirstOrDefault();

            TaskPriorityListItem taskPriorityListItem = taskPriorityList.TaskPriorityListItems.Where(x => x.Name.Contains("High")).FirstOrDefault();
            if (taskPriorityListItem != null)
            {
                newTask.PriorityId = taskPriorityListItem.Id;
            }
            TaskList taskList = _ipsDataContext.TaskLists.Where(x => x.UserId == userId).FirstOrDefault();
            newTask.TaskListId = taskList.Id;
            TaskStatusListItem statusListItem = _ipsDataContext.TaskStatusListItems.Where(x => x.TaskStatusListId == taskList.TaskStatusListId && x.Name.Contains("Not Started")).FirstOrDefault();
            if (statusListItem != null)
            {
                newTask.StatusId = statusListItem.Id;
            }
            newTask.TimeEstimateMinutes = 10;
            newTask.StartDate = prospectingCustomerOfferDetail.OfferFollowUpScheduleDate;
            newTask.DueDate = prospectingCustomerOfferDetail.OfferFollowUpScheduleDate;
            newTask.IsEmailNotification = true;
            NotificationTemplate defaultTaskNotification = _ipsDataContext.NotificationTemplates.Where(x => x.IsDefualt == true && x.NotificationTemplateTypeId == (int)NotificationTemplateTypeEnum.Tasks && x.EvaluationRoleId == null).FirstOrDefault();
            if (defaultTaskNotification != null)
            {
                newTask.EmailBefore = -15;
                newTask.NotificationTemplateId = defaultTaskNotification.Id;
            }
            newTask.Title = "Offer Follow Up of " + customer.Name; ;
            _ipsDataContext.Tasks.Add(newTask);
            _ipsDataContext.SaveChanges();
            return newTask;
        }
    }
}
