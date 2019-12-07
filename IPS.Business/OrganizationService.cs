using System.Globalization;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Threading.Tasks;
using IPS.BusinessModels.Common;
using System.IO;
using IPS.BusinessModels.SalesActivityModels;
using IPS.BusinessModels.SkillModels;
using IPS.BusinessModels.RoleModels;
using IPS.BusinessModels.Entities;
using IPS.AuthData.Models;
using IPS.BusinessModels.ResourceModels;
using IPS.BusinessModels.Enum;
using IPS.Fx.Security.Crytography;

namespace IPS.Business
{
    public class OrganizationService : BaseService, IPS.Business.IOrganizationService
    {
        public IQueryable<Organization> Get()
        {
            IQueryable<Organization> organizations;
            List<int> idList = _authService.GetUserOrganizations();

            if (_authService.IsSuperAdmin())
            {
                organizations = _ipsDataContext.Organizations.Include("Country").Include("Industry").AsNoTracking().AsQueryable();
            }
            else
            {
                organizations = _ipsDataContext.Organizations.Include("Country").Include("Industry").Where(o => idList.Contains(o.Id)).AsQueryable();
                IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = _authService.GetCurrentUserRoleLevelAdvancePermission();
                if (ipsRoleLevelAdvancePermission != null)
                {
                    if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnOrganization)
                    {
                        int currentOrgnaizationId = _authService.GetCurrentUserOrgId();
                        IQueryable<Organization> dealerOrganizations = _ipsDataContext.Organizations.Include("Country").Include("Industry").Where(o => o.ParentId == currentOrgnaizationId).AsQueryable();
                        if (dealerOrganizations.Count() > 0)
                        {
                            organizations = organizations.Union(dealerOrganizations);
                        }
                    }
                }
            }
            return organizations;
        }

        public List<IPSDropDown> GetDDL()
        {
            List<IPSDropDown> organizations;

            List<int> idList = _authService.GetUserOrganizations();

            if (_authService.IsSuperAdmin())
            {
                organizations = _ipsDataContext.Organizations.Select(x => new IPSDropDown
                {
                    Id = x.Id,
                    Name = x.Name
                }).OrderBy(x => x.Name).ToList();

            }
            else
            {
                organizations = _ipsDataContext.Organizations.Where(o => idList.Contains(o.Id)).Select(x => new IPSDropDown
                {
                    Id = x.Id,
                    Name = x.Name
                }).OrderBy(x => x.Name).ToList();

                IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = _authService.GetCurrentUserRoleLevelAdvancePermission();
                if (ipsRoleLevelAdvancePermission != null)
                {
                    if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnOrganization)
                    {
                        int currentOrgnaizationId = _authService.GetCurrentUserOrgId();
                        List<IPSDropDown> dealerOrganizations = _ipsDataContext.Organizations.Include("Country").Include("Industry").Where(o => o.ParentId == currentOrgnaizationId).Select(x => new IPSDropDown
                        {
                            Id = x.Id,
                            Name = x.Name
                        }).OrderBy(x => x.Name).ToList();
                        if (dealerOrganizations.Count() > 0)
                        {
                            organizations.AddRange(dealerOrganizations);
                        }
                    }
                }
            }

            return organizations;
        }

        public List<Organization> GetSubOrganizations(int organizationId)
        {
            List<Organization> result = new List<Organization>();
            if (_authService.IsSuperAdmin())
            {
                result = _ipsDataContext.Organizations.Where(x => x.ParentId == organizationId).ToList();
            }
            else
            {
                IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = _authService.GetCurrentUserRoleLevelAdvancePermission();
                if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnOrganization)
                {
                    result = _ipsDataContext.Organizations.Where(x => x.ParentId == organizationId).ToList();
                }
                else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.AllOrganization)
                {
                    result = _ipsDataContext.Organizations.Where(x => x.ParentId == organizationId).ToList();
                }
            }
            return result;
        }

        public IQueryable<Organization> GetOrganizationsWithParticipants()
        {
            var orgs = Get();
            var currentUser = _authService.getCurrentUser();
            var ipsUser = _authService.GetUserById(currentUser.Id);

            var oIds = _ipsDataContext.StageGroups
                .Where(sg => sg.EvaluationParticipants.Select(ep => ep.UserId).Contains(ipsUser.User.Id))
                .SelectMany(_ => _.Profiles)
                .Select(profile => profile.OrganizationId)
                .AsQueryable();

            var extraOrgs =
                _ipsDataContext.Organizations.Where(org => oIds.Contains(org.Id) && !orgs.Contains(org)).AsQueryable();

            return orgs.Concat(extraOrgs);
        }


        public IQueryable<Organization> GetById(int id)
        {
            return _ipsDataContext.Organizations.Where(o => o.Id == id);
        }

        public Organization Add(Organization organization)
        {
            _ipsDataContext.Organizations.Add(organization);
            _ipsDataContext.SaveChanges();
            AssignRolesAndPermissions(organization);
            return organization;
        }
        private void AssignRolesAndPermissions(Organization organization)
        {
            if (organization.Id > 0)
            {
                RoleLevelService roleLevelService = new RoleLevelService();
                RoleService roleService = new RoleService();
                RoleLevelPermissionService roleLevelPermissionService = new RoleLevelPermissionService();
                List<IpsRoleLevelModel> defaultRoleLevels = roleLevelService.getRoleLevelsByOrganizationId(0);
                Dictionary<int, int> parentLevelIds = new Dictionary<int, int>();
                foreach (IpsRoleLevelModel defaultRoleLevel in defaultRoleLevels)
                {
                    UserRoleLevels newRoleLevel = new UserRoleLevels()
                    {
                        Name = defaultRoleLevel.Name,
                        OrganizationId = organization.Id,
                    };
                    if (defaultRoleLevel.ParentRoleLevelId.HasValue)
                    {
                        newRoleLevel.ParentRoleLevelId = parentLevelIds.Where(x => x.Key == defaultRoleLevel.ParentRoleLevelId).Select(x => x.Value).FirstOrDefault();
                    }
                    UserRoleLevels savedRoleLevel = roleLevelService.Save(newRoleLevel);
                    parentLevelIds.Add(defaultRoleLevel.Id, savedRoleLevel.Id);
                    List<IpsRole> roles = roleService.GetRolesByLevelId(defaultRoleLevel.Id);
                    foreach (IpsRole role in roles)
                    {
                        string[] splittedOrgName = organization.Name.Split(' ').ToArray();
                        IpsRole newRole = new IpsRole()
                        {
                            Name = role.Name + "_" + string.Join("", splittedOrgName),
                            OrganizationId = organization.Id,
                            RoleLevel = savedRoleLevel.Id,
                        };
                        roleService.Add(newRole);
                    }

                    List<IpsRoleLevelResourcesPermissionModel> roleLevelPermissions = roleLevelPermissionService.GetPermissionsByLevelId(defaultRoleLevel.Id);

                    IpsRoleLevelPermissionModel ipsRoleLevelPermissionModel = new IpsRoleLevelPermissionModel()
                    {
                        RoleLevelId = savedRoleLevel.Id,
                    };
                    foreach (IpsRoleLevelResourcesPermissionModel resourcesPermissionModel in roleLevelPermissions)
                    {
                        IpsRoleLevelResourcesPermissionModel roleLevelResourcesPermissionModel = new IpsRoleLevelResourcesPermissionModel()
                        {
                            OperationId = resourcesPermissionModel.OperationId,
                            ResourceId = resourcesPermissionModel.ResourceId,
                            RoleLevelId = savedRoleLevel.Id,
                        };
                        ipsRoleLevelPermissionModel.IpsRoleLevelResourcesPermissionModels.Add(roleLevelResourcesPermissionModel);

                    }
                    roleLevelPermissionService.Save(ipsRoleLevelPermissionModel);

                    IpsRoleLevelAdvancePermission roleLevelAdvancePermissions = roleLevelPermissionService.GetAdvancePermissionsByLevelId(defaultRoleLevel.Id);
                    if (roleLevelAdvancePermissions != null)
                    {
                        IpsRoleLevelAdvancePermission advancePermission = new IpsRoleLevelAdvancePermission()
                        {
                            PermissionLevelId = roleLevelAdvancePermissions.PermissionLevelId,
                            RoleLevelId = savedRoleLevel.Id,
                        };
                        roleLevelPermissionService.SaveAdvancePermission(advancePermission);
                    }
                }
            }
        }

        public bool Update(Organization organization)
        {

            var original = _ipsDataContext.Organizations.Find(organization.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(organization);
                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(Organization organization)
        {
            _ipsDataContext.Organizations.Remove(organization);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }

        public List<IPSParticipants> GetOrganizationUsers(int organizationId)
        {
            return _ipsDataContext.Users.Where(x => x.OrganizationId == organizationId).Select(x => new IPSParticipants
            {
                Id = x.Id,
                FirstName = x.FirstName,
                LastName = x.LastName,
                UserKey = x.UserKey,
                UserImage = x.ImagePath,
                WorkEmail = x.WorkEmail,
            }).ToList();
        }

        public List<UserCusotmerModel> GetOrganizationCustomers(int organizationId)
        {
            List<UserCusotmerModel> result = new List<UserCusotmerModel>();
            bool isAdmin = _authService.IsInOrganizationInRoleOf("Admin", organizationId) || _authService.IsInOrganizationInRoleOf("Super Admin", organizationId);
            if (isAdmin)
            {
                result = _ipsDataContext.CustomerSalesDatas.
                    Include("Customer")
                    .Where(x => x.Customer.OrganizationId == organizationId).Select(x => new UserCusotmerModel()
                    {
                        Id = x.Id,
                        CustomerId = x.Customer.Id,
                        AssignedUserId = x.Customer.AssignedUserId,
                        Email = x.Customer.Email,
                        Mobile = x.Customer.Mobile,
                        Model = x.Model,
                        Name = x.Customer.Name,
                        Offer = x.Offer,
                        PostCode = x.Customer.PostCode,
                        RegistrationNo = x.RegistrationNo,
                        Seller = x.Seller,
                        Type = x.Type,
                        Date = x.Date,
                        UploadDate = x.Customer.CreatedOn,
                        CSVFileName = x.Customer.CSVFile
                    }).ToList();
            }
            else
            {
                result = GetUserCustomersByOrganization(organizationId);
            }
            List<int> orgCustomerIds = result.Where(x => x.CustomerId > 0).Select(x => x.CustomerId).ToList();

            List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
            prospectingCustomers = _ipsDataContext.ProspectingCustomers.Include("ProspectingGoalInfo")
                .Include("CustomerSalesData")
                .Where(x => x.CustomerId > 0).ToList();


            List<int> customerIds = prospectingCustomers.Where(x => orgCustomerIds.IndexOf(x.CustomerId.Value) > -1).Select(x => x.Id).ToList();

            List<int> meeetingCustomers = new List<int>(); ;
            meeetingCustomers = _ipsDataContext.ProspectingCustomerResults.Where(x => customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.IsMeeting == true).Select(x => x.ProspectingCustomerId).Distinct().ToList();

            List<int> noMeeetingCustomers = new List<int>();
            noMeeetingCustomers = _ipsDataContext.ProspectingCustomerResults.Where(x => customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.IsNoMeeting == true).Select(x => x.ProspectingCustomerId).Distinct().ToList();

            List<int> followUpCustomers = new List<int>();
            followUpCustomers = _ipsDataContext.ProspectingCustomerResults.Where(x => customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.IsFollowUp == true && (!noMeeetingCustomers.Contains(x.ProspectingCustomerId)) && (!meeetingCustomers.Contains(x.ProspectingCustomerId))).Select(x => x.ProspectingCustomerId).Distinct().ToList();

            List<int> calledCustomers = new List<int>();
            calledCustomers = _ipsDataContext.ProspectingCustomerResults.Where(x => customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.IsNoMeeting == false && x.IsFollowUp == false && x.IsMeeting == false && (!followUpCustomers.Contains(x.ProspectingCustomerId))).Select(x => x.ProspectingCustomerId).Distinct().ToList();


            List<ProspectingCustomerModel> filteredMeeetingCustomers = prospectingCustomers.Where(x => meeetingCustomers.Contains(x.Id)).Select(x => new ProspectingCustomerModel()
            {
                CustomerId = x.CustomerId,
                Detail = x.Detail,
                Id = x.Id,
                Name = x.Name,
                Phone = x.Phone,
                GoalName = x.ProspectingGoalInfo.Name,
                ProspectingGoalUserId = x.ProspectingGoalInfo.UserId,
                ProspectingGoalId = x.ProspectingGoalId,
                ScheduleDate = x.ScheduleDate,
                CustomerSaleDataId = x.CustomerSaleDataId,
                CustomerSalesData = x.CustomerSalesData != null ? new CustomerSalesData()
                {
                    Date = x.CustomerSalesData.Date,
                    Model = x.CustomerSalesData.Model,
                    Type = x.CustomerSalesData.Type,
                    Seller = x.CustomerSalesData.Seller,
                } : null,
                AssignedByUserId = x.AssignedBy,
                AssignedOn = x.AssignedOn,
                AssignedToUserId = x.AssignedToUserId,

            }).ToList();
            List<ProspectingCustomerModel> filteredNoMeeetingCustomers = prospectingCustomers.Where(x => noMeeetingCustomers.Contains(x.Id)).Select(x => new ProspectingCustomerModel()
            {
                CustomerId = x.CustomerId,
                Detail = x.Detail,
                Id = x.Id,
                Name = x.Name,
                Phone = x.Phone,
                GoalName = x.ProspectingGoalInfo.Name,
                ProspectingGoalUserId = x.ProspectingGoalInfo.UserId,
                ProspectingGoalId = x.ProspectingGoalId,
                ScheduleDate = x.ScheduleDate,
                CustomerSaleDataId = x.CustomerSaleDataId,
                CustomerSalesData = x.CustomerSalesData != null ? new CustomerSalesData()
                {
                    Date = x.CustomerSalesData.Date,
                    Model = x.CustomerSalesData.Model,
                    Type = x.CustomerSalesData.Type,
                    Seller = x.CustomerSalesData.Seller,
                } : null,
                AssignedByUserId = x.AssignedBy,
                AssignedOn = x.AssignedOn,
                AssignedToUserId = x.AssignedToUserId,

            }).ToList();
            List<ProspectingCustomerModel> filteredFollowUpCustomers = prospectingCustomers.Where(x => followUpCustomers.Contains(x.Id)).Select(x => new ProspectingCustomerModel()
            {
                CustomerId = x.CustomerId,
                Detail = x.Detail,
                Id = x.Id,
                Name = x.Name,
                Phone = x.Phone,
                GoalName = x.ProspectingGoalInfo.Name,
                ProspectingGoalUserId = x.ProspectingGoalInfo.UserId,
                ProspectingGoalId = x.ProspectingGoalId,
                ScheduleDate = x.ScheduleDate,
                CustomerSaleDataId = x.CustomerSaleDataId,
                CustomerSalesData = x.CustomerSalesData != null ? new CustomerSalesData()
                {
                    Date = x.CustomerSalesData.Date,
                    Model = x.CustomerSalesData.Model,
                    Type = x.CustomerSalesData.Type,
                    Seller = x.CustomerSalesData.Seller,
                } : null,
                AssignedByUserId = x.AssignedBy,
                AssignedOn = x.AssignedOn,
                AssignedToUserId = x.AssignedToUserId,

            }).ToList();
            List<ProspectingCustomerModel> filteredCalledCustomers = prospectingCustomers.Where(x => calledCustomers.Contains(x.Id)).Select(x => new ProspectingCustomerModel()
            {
                CustomerId = x.CustomerId,
                Detail = x.Detail,
                Id = x.Id,
                Name = x.Name,
                Phone = x.Phone,
                GoalName = x.ProspectingGoalInfo.Name,
                ProspectingGoalUserId = x.ProspectingGoalInfo.UserId,
                ProspectingGoalId = x.ProspectingGoalId,
                ScheduleDate = x.ScheduleDate,
                CustomerSaleDataId = x.CustomerSaleDataId,
                CustomerSalesData = x.CustomerSalesData != null ? new CustomerSalesData()
                {
                    Date = x.CustomerSalesData.Date,
                    Model = x.CustomerSalesData.Model,
                    Type = x.CustomerSalesData.Type,
                    Seller = x.CustomerSalesData.Seller,
                } : null,
                AssignedByUserId = x.AssignedBy,
                AssignedOn = x.AssignedOn,
                AssignedToUserId = x.AssignedToUserId,

            }).ToList();


            foreach (UserCusotmerModel usercustomer in result)
            {
                if (filteredMeeetingCustomers.Any(x => x.CustomerId == usercustomer.CustomerId))
                {
                    foreach (ProspectingCustomerModel customerInfo in filteredMeeetingCustomers.Where(x => x.CustomerId == usercustomer.CustomerId))
                    {
                        List<ProspectingCustomerOfferDetail> offers = _ipsDataContext.ProspectingCustomerOfferDetails.Where(x => x.ProspectingCustomerId == customerInfo.Id).ToList();
                        if (offers.Count > 0)
                        {
                            ProspectingCustomerOfferDetail lastOffer = offers.LastOrDefault();
                            if (lastOffer != null)
                            {
                                usercustomer.IsCalled = true;
                                usercustomer.IsTalked = true;
                                usercustomer.IsMeeting = true;
                                usercustomer.IsOfferSent = true;
                                usercustomer.FollowUpDate = lastOffer.OfferFollowUpScheduleDate;
                                OfferClosingDetail offerClosingDetail = _ipsDataContext.OfferClosingDetails.Where(x => x.ProspectingCustomerOfferDetailId == lastOffer.Id).FirstOrDefault();
                                if (offerClosingDetail != null)
                                {
                                    usercustomer.IsOfferClosed = offerClosingDetail.IsClosed;
                                }
                            }
                        }
                    }
                }
                else if (filteredNoMeeetingCustomers.Any(x => x.CustomerId == usercustomer.CustomerId))
                {
                    foreach (ProspectingCustomerModel customerInfo in filteredNoMeeetingCustomers.Where(x => x.CustomerId == usercustomer.CustomerId))
                    {
                        usercustomer.IsCalled = true;
                        usercustomer.IsTalked = true;
                        usercustomer.IsNotInterested = true;
                    }
                }
                else if (filteredFollowUpCustomers.Any(x => x.CustomerId == usercustomer.CustomerId))
                {
                    foreach (ProspectingCustomerModel customerInfo in filteredFollowUpCustomers.Where(x => x.CustomerId == usercustomer.CustomerId))
                    {
                        usercustomer.IsCalled = true;
                        usercustomer.IsTalked = true;
                        usercustomer.IsFollowUp = true;
                    }
                }
                else if (filteredCalledCustomers.Any(x => x.CustomerId == usercustomer.CustomerId))
                {
                    foreach (ProspectingCustomerModel customerInfo in filteredCalledCustomers.Where(x => x.CustomerId == usercustomer.CustomerId))
                    {
                        usercustomer.IsCalled = true;
                        usercustomer.IsTalked = false;
                    }
                }
            }

            return result;
        }
        public List<UserCusotmerModel> GetUserCustomersByOrganization(int organizationId)
        {
            int userId = _authService.GetCurrentUserId();
            return _ipsDataContext.CustomerSalesDatas.Include("Customer").Where(x => x.Customer.OrganizationId == organizationId && x.Customer.AssignedUserId == userId).Select(x => new UserCusotmerModel()
            {
                Id = x.Id,
                CustomerId = x.Customer.Id,
                AssignedUserId = x.Customer.AssignedUserId,
                Email = x.Customer.Email,
                Mobile = x.Customer.Mobile,
                Model = x.Model,
                Name = x.Customer.Name,
                Offer = x.Offer,
                PostCode = x.Customer.PostCode,
                RegistrationNo = x.RegistrationNo,
                Seller = x.Seller,
                Type = x.Type,
                Date = x.Date,
                UploadDate = x.Customer.CreatedOn,
                CSVFileName = x.Customer.CSVFile
            }).ToList();
        }

        public List<UserCusotmerModel> GetUserCustomersForGoalId(int GoalId)
        {
            int userId = _authService.GetCurrentUserId();
            ProspectingGoalInfo ProspectingGoalInfo = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.Id == GoalId).FirstOrDefault();
            List<int> prospectingGoalIds = new List<int>();

            if (ProspectingGoalInfo.ProfileId.HasValue)
            {
                prospectingGoalIds = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.ProfileId == ProspectingGoalInfo.ProfileId).Select(x => x.Id).ToList();
            }
            if (ProspectingGoalInfo.TaskId.HasValue)
            {
                prospectingGoalIds = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.TaskId == ProspectingGoalInfo.TaskId).Select(x => x.Id).ToList();
            }
            else
            {
                prospectingGoalIds.Add(ProspectingGoalInfo.Id);
            }
            SkillsService _skillService = new SkillsService();
            List<IpsSkillDDL> skills = _skillService.getSkillsByProspectingGoalId(ProspectingGoalInfo.Id).OrderBy(x => x.SeqNo).ToList();
            List<int?> skillIds = skills.Where(x => x.SeqNo > 1).Select(x => x.Id).ToList();
            List<int> prospectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => prospectingGoalIds.Contains(x.ProspectingGoalActivityInfo.ProspectingGoalId)).Select(x => x.Id).ToList();


            List<int?> talkedCusotmerIds = _ipsDataContext.ProspectingCustomerResults.Include("ProspectingCustomer").Where(x => prospectingActivityIds.Contains(x.ProspectingActivityId) && (skillIds.Contains(x.SkillId) && x.IsDone == true)).Select(x => x.ProspectingCustomer.CustomerId).ToList();

            List<int?> completedCusotmerIds = _ipsDataContext.ProspectingCustomerResults.Include("ProspectingCustomer").Where(x => prospectingActivityIds.Contains(x.ProspectingActivityId) && (x.IsMeeting == true || x.IsNoMeeting == true)).Select(x => x.ProspectingCustomer.CustomerId).ToList();
            List<int?> followCusotmerIds = _ipsDataContext.ProspectingCustomerResults.Include("ProspectingCustomer").Where(x => prospectingActivityIds.Contains(x.ProspectingActivityId) && (x.IsFollowUp == true)).Select(x => x.ProspectingCustomer.CustomerId).ToList();
            List<ProspectingSchedule> followupCusotmers = _ipsDataContext.ProspectingSchedules.Include("ProspectingCustomer").Where(x => prospectingActivityIds.Contains(x.ProspectingActivityId != null ? x.ProspectingActivityId.Value : 0) && (x.IsFollowUp == true)).ToList();

            List<UserCusotmerModel> result = _ipsDataContext.CustomerSalesDatas.Include("Customer").Where(x => x.Customer.AssignedUserId == userId && (!completedCusotmerIds.Contains(x.Customer.Id)) && (!followCusotmerIds.Contains(x.Customer.Id)) && (!talkedCusotmerIds.Contains(x.Customer.Id))).Select(x => new UserCusotmerModel()
            {
                Id = x.Id,
                CustomerId = x.Customer.Id,
                CustomerSaleDataId = x.Id,
                AssignedUserId = x.Customer.AssignedUserId,
                Email = x.Customer.Email,
                Mobile = x.Customer.Mobile,
                Model = x.Model,
                Name = x.Customer.Name,
                Offer = x.Offer,
                PostCode = x.Customer.PostCode,
                RegistrationNo = x.RegistrationNo,
                Seller = x.Seller,
                Type = x.Type,
                Date = x.Date,
                UploadDate = x.Customer.CreatedOn,
                CSVFileName = x.Customer.CSVFile
            }).ToList();


            List<UserCusotmerModel> followCusotmerResult = _ipsDataContext.CustomerSalesDatas.Include("Customer").Where(x => x.Customer.AssignedUserId == userId && (followCusotmerIds.Contains(x.Customer.Id))).Select(x => new UserCusotmerModel()
            {
                Id = x.Id,
                CustomerId = x.Customer.Id,
                AssignedUserId = x.Customer.AssignedUserId,
                Email = x.Customer.Email,
                Mobile = x.Customer.Mobile,
                Model = x.Model,
                Name = x.Customer.Name,
                Offer = x.Offer,
                PostCode = x.Customer.PostCode,
                RegistrationNo = x.RegistrationNo,
                Seller = x.Seller,
                Type = x.Type,
                Date = x.Date,
                IsFollowUp = true,
                UploadDate = x.Customer.CreatedOn,
                CSVFileName = x.Customer.CSVFile,
            }).ToList();
            foreach (UserCusotmerModel followCusotmer in followCusotmerResult)
            {
                int? taskId = followupCusotmers.Where(x => x.ProspectingCustomer.CustomerId == followCusotmer.CustomerId).Select(x => x.TaskId).FirstOrDefault();
                if (taskId.HasValue)
                {
                    followCusotmer.TaskId = taskId;
                    followCusotmer.FollowUpDate = _ipsDataContext.Tasks.Where(x => x.Id == taskId.Value).Select(x => x.StartDate).FirstOrDefault();
                }
                result.Add(followCusotmer);
            }
            int orgId = _authService.GetCurrentUserOrgId();
            List<Organization> organizations = GetSubOrganizations(orgId);
            List<int?> orgIds = new List<int?>();
            orgIds = organizations.Select(x => (Nullable<int>)x.Id).ToList();
            orgIds.Add(orgId);
            List<UserCusotmerModel> contactPersons = _ipsDataContext.Users.Where(x => orgIds.IndexOf(x.OrganizationId) > -1).Select(x => new UserCusotmerModel()
            {
                Email = x.WorkEmail,
                Name = x.FirstName + " " + x.LastName,
                UserId = x.Id,
                Mobile = x.MobileNo,
            }).ToList();
            result.AddRange(contactPersons);
            return result;
        }


        public List<ProspectingCustomer> GetUsersForGoalId(int GoalId)
        {
            int userId = _authService.GetCurrentUserId();
            ProspectingGoalInfo ProspectingGoalInfo = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.Id == GoalId).FirstOrDefault();
            List<int> prospectingGoalIds = new List<int>();
            if (ProspectingGoalInfo.TaskId.HasValue)
            {
                prospectingGoalIds = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.TaskId == ProspectingGoalInfo.TaskId).Select(x => x.Id).ToList();
            }
            else if (ProspectingGoalInfo.ProfileId.HasValue)
            {
                prospectingGoalIds = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.ProfileId == ProspectingGoalInfo.ProfileId).Select(x => x.Id).ToList();
            }
            else
            {
                prospectingGoalIds.Add(ProspectingGoalInfo.Id);
            }
            SkillsService _skillService = new SkillsService();
            List<IpsSkillDDL> skills = _skillService.getSkillsByProspectingGoalId(ProspectingGoalInfo.Id).OrderBy(x => x.SeqNo).ToList();
            List<int?> skillIds = skills.Where(x => x.SeqNo > 1).Select(x => x.Id).ToList();
            List<int> prospectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => prospectingGoalIds.Contains(x.ProspectingGoalActivityInfo.ProspectingGoalId)).Select(x => x.Id).ToList();


            List<int?> talkedUserIds = _ipsDataContext.ProspectingCustomerResults.Include("ProspectingCustomer").Where(x => prospectingActivityIds.Contains(x.ProspectingActivityId) && (skillIds.Contains(x.SkillId) && x.IsDone == true) && x.ProspectingCustomer.UserId > 0).Select(x => x.ProspectingCustomer.UserId).ToList();

            List<int?> completedUserIds = _ipsDataContext.ProspectingCustomerResults.Include("ProspectingCustomer").Where(x => prospectingActivityIds.Contains(x.ProspectingActivityId) && (x.IsMeeting == true || x.IsNoMeeting == true) && x.ProspectingCustomer.UserId > 0).Select(x => x.ProspectingCustomer.UserId).ToList();
            List<int?> followUserIds = _ipsDataContext.ProspectingCustomerResults.Include("ProspectingCustomer").Where(x => prospectingActivityIds.Contains(x.ProspectingActivityId) && (x.IsFollowUp == true) && x.ProspectingCustomer.UserId > 0).Select(x => x.ProspectingCustomer.UserId).ToList();

            List<ProspectingSchedule> followupCusotmers = _ipsDataContext.ProspectingSchedules.Include("ProspectingCustomer").Where(x => prospectingActivityIds.Contains(x.ProspectingActivityId != null ? x.ProspectingActivityId.Value : 0) && (x.IsFollowUp == true)).ToList();
            int orgId = _authService.GetCurrentUserOrgId();
            List<Organization> Organizations = GetSubOrganizations(orgId);
            List<ProspectingCustomer> result = new List<ProspectingCustomer>();
            foreach (Organization org in Organizations)
            {
                List<User> orgUsers = GetOrganizationUsersbyOrganizationId(org.Id);
                foreach (User user in orgUsers)
                {
                    if (user.MobileNo == org.ContactPhone || org.ContactName.IndexOf(user.FirstName) > -1)
                    {
                        if ((!completedUserIds.Contains(user.Id)) && (!followUserIds.Contains(user.Id)) && (!talkedUserIds.Contains(user.Id)))
                        {
                            result.Add(new ProspectingCustomer()
                            {
                                Id = user.Id,
                                CustomerId = null,
                                CustomerSaleDataId = 0,
                                AssignedToUserId = userId,
                                Detail = user.WorkEmail,
                                Phone = user.MobileNo,
                                Name = user.FirstName + " " + user.LastName,
                                UserId = user.Id,
                                ProspectingGoalId = GoalId,


                            });
                        }
                    }
                }
            }
            return result;
        }

        public List<UserCusotmerModel> GetMeetingProspectingCustomersForGoalId(int GoalId)
        {
            int userId = _authService.GetCurrentUserId();
            ProspectingGoalInfo ProspectingGoalInfo = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.Id == GoalId).FirstOrDefault();
            List<int> prospectingcustomerIds = new List<int>();
            if (ProspectingGoalInfo.TaskId.HasValue)
            {
                Data.Task taskInfo = _ipsDataContext.Tasks.Where(x => x.Id == ProspectingGoalInfo.TaskId.Value && x.ProjectId > 0).FirstOrDefault();
                if (taskInfo != null)
                {
                    ProjectService _projectService = new ProjectService();
                    List<ProspectingCustomerModel> prospectingCustomers = _projectService.GetProjectCustomers(taskInfo.ProjectId.Value).Where(x => x.IsOfferClosed == true && x.ClosedOfferStatus == 1).ToList();
                    prospectingcustomerIds = prospectingCustomers.Select(x => x.CustomerId.Value).ToList();
                }
            }

            SkillsService _skillService = new SkillsService();
            List<IpsSkillDDL> skills = _skillService.getSkillsByProspectingGoalId(ProspectingGoalInfo.Id).OrderBy(x => x.SeqNo).ToList();
            List<int?> skillIds = skills.Where(x => x.SeqNo > 1).Select(x => x.Id).ToList();
            List<int> prospectingActivityIds = _ipsDataContext.ProspectingActivities.Include("ProspectingGoalActivityInfo").Where(x => x.ProspectingGoalActivityInfo.ProspectingGoalId == GoalId).Select(x => x.Id).ToList();


            List<int?> talkedCusotmerIds = _ipsDataContext.ProspectingCustomerResults.Include("ProspectingCustomer").Where(x => prospectingActivityIds.Contains(x.ProspectingActivityId) && (skillIds.Contains(x.SkillId) && x.IsDone == true)).Select(x => x.ProspectingCustomer.CustomerId).ToList();

            List<int?> completedCusotmerIds = _ipsDataContext.ProspectingCustomerResults.Include("ProspectingCustomer").Where(x => prospectingActivityIds.Contains(x.ProspectingActivityId) && (x.IsMeeting == true || x.IsNoMeeting == true)).Select(x => x.ProspectingCustomer.CustomerId).ToList();
            List<int?> followCusotmerIds = _ipsDataContext.ProspectingCustomerResults.Include("ProspectingCustomer").Where(x => prospectingActivityIds.Contains(x.ProspectingActivityId) && (x.IsFollowUp == true)).Select(x => x.ProspectingCustomer.CustomerId).ToList();
            List<ProspectingSchedule> followupCusotmers = _ipsDataContext.ProspectingSchedules.Include("ProspectingCustomer").Where(x => prospectingActivityIds.Contains(x.ProspectingActivityId != null ? x.ProspectingActivityId.Value : 0) && (x.IsFollowUp == true)).ToList();

            List<UserCusotmerModel> result = _ipsDataContext.CustomerSalesDatas.Include("Customer").Where(x => prospectingcustomerIds.Contains(x.Customer.Id) && (!completedCusotmerIds.Contains(x.Customer.Id)) && (!followCusotmerIds.Contains(x.Customer.Id)) && (!talkedCusotmerIds.Contains(x.Customer.Id))).Select(x => new UserCusotmerModel()
            {
                Id = x.Id,
                CustomerId = x.Customer.Id,
                CustomerSaleDataId = x.Id,
                AssignedUserId = x.Customer.AssignedUserId,
                Email = x.Customer.Email,
                Mobile = x.Customer.Mobile,
                Model = x.Model,
                Name = x.Customer.Name,
                Offer = x.Offer,
                PostCode = x.Customer.PostCode,
                RegistrationNo = x.RegistrationNo,
                Seller = x.Seller,
                Type = x.Type,
                Date = x.Date,
                UploadDate = x.Customer.CreatedOn,
                CSVFileName = x.Customer.CSVFile
            }).ToList();


            List<UserCusotmerModel> followCusotmerResult = _ipsDataContext.CustomerSalesDatas.Include("Customer").Where(x => prospectingcustomerIds.Contains(x.Customer.Id) && (followCusotmerIds.Contains(x.Customer.Id))).Select(x => new UserCusotmerModel()
            {
                Id = x.Id,
                CustomerId = x.Customer.Id,
                AssignedUserId = x.Customer.AssignedUserId,
                Email = x.Customer.Email,
                Mobile = x.Customer.Mobile,
                Model = x.Model,
                Name = x.Customer.Name,
                Offer = x.Offer,
                PostCode = x.Customer.PostCode,
                RegistrationNo = x.RegistrationNo,
                Seller = x.Seller,
                Type = x.Type,
                Date = x.Date,
                IsFollowUp = true,
                UploadDate = x.Customer.CreatedOn,
                CSVFileName = x.Customer.CSVFile,
            }).ToList();

            foreach (UserCusotmerModel followCusotmer in followCusotmerResult)
            {
                int? taskId = followupCusotmers.Where(x => x.ProspectingCustomer.CustomerId == followCusotmer.CustomerId).Select(x => x.TaskId).FirstOrDefault();
                if (taskId.HasValue)
                {
                    followCusotmer.TaskId = taskId;
                    followCusotmer.FollowUpDate = _ipsDataContext.Tasks.Where(x => x.Id == taskId.Value).Select(x => x.StartDate).FirstOrDefault();
                }
                result.Add(followCusotmer);
            }



            return result;
        }

        public Customer AddNewCustomer(Customer customer)
        {
            if (!(customer.Id > 0))
            {
                customer.OrganizationId = _authService.GetCurrentUserOrgId();
                customer.AssignedUserId = _authService.GetCurrentUserId();
                if (!(_ipsDataContext.Customers.Any(x => x.OrganizationId == customer.OrganizationId && (x.Mobile == customer.Mobile))))
                {
                    customer.CreatedOn = DateTime.Now;
                    customer.CreatedBy = _authService.GetCurrentUserId();
                    _ipsDataContext.Customers.Add(customer);
                    _ipsDataContext.SaveChanges();
                }
            }
            return customer;
        }

        public bool checkCustomerExist(string mobile)
        {
            int organizationId = _authService.GetCurrentUserOrgId();
            int userId = _authService.GetCurrentUserId();
            if (!string.IsNullOrEmpty(mobile))
            {
                return _ipsDataContext.Customers.Any(x => x.OrganizationId == organizationId && (x.Mobile == mobile));
            }
            else
            {
                return false;
            }
        }

        public List<User> GetOrganizationUsersbyOrganizationId(int organizationId)
        {
            List<User> result = new List<User>();
            int currentUserId = _authService.GetCurrentUserId();
            if (currentUserId > 0)
            {
                if (_authService.IsSuperAdmin())
                {
                    result = _ipsDataContext.Users.Where(x => x.OrganizationId == organizationId).ToList();
                }
                else
                {
                    IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = _authService.GetCurrentUserRoleLevelAdvancePermission();
                    if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnOrganization)
                    {
                        result = _ipsDataContext.Users.Where(x => x.OrganizationId == organizationId).ToList();
                    }
                    else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.SubLevel)
                    {

                        RoleLevelService roleLevelService = new RoleLevelService();
                        IpsPermissionModel currentUserAllPermissions = _authService.GetCurrentUserPermissions().Where(x => x.OrganizationId == organizationId).FirstOrDefault();
                        if (currentUserAllPermissions != null)
                        {
                            List<UserRoleLevels> childUserRoleLevels = roleLevelService.GetRoleLevelChildsRecursive(currentUserAllPermissions.RoleLevelId);
                            List<IpsUser> users = new List<IpsUser>();
                            foreach (UserRoleLevels userroleLevel in childUserRoleLevels)
                            {
                                users.AddRange(roleLevelService.GetChildRoleLevelUsersRecursive(userroleLevel.Id));
                            }
                            List<int> userIds = users.Select(x => x.User.Id).ToList();
                            userIds.Add(currentUserId);
                            result = _ipsDataContext.Users.Where(x => userIds.Contains(x.Id)).ToList();
                        }

                    }
                    else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnData)
                    {
                        List<int> userIds = new List<int>();
                        userIds.Add(currentUserId);
                        List<Department> Departments = _ipsDataContext.Departments.Include("Users").Where(_ => _.OrganizationId == organizationId).ToList();
                        foreach (Department department in Departments)
                        {
                            if (department.ManagerId == currentUserId)
                            {
                                userIds.AddRange(department.Users.Select(x => x.Id).ToList());
                            }
                        }
                        List<Team> teams = _ipsDataContext.Teams.Include("Link_TeamUsers").Where(_ => _.OrganizationId == organizationId).ToList();
                        foreach (Team team in teams)
                        {
                            if (team.TeamLeadId == currentUserId)
                            {
                                userIds.AddRange(team.Link_TeamUsers.Select(x => x.UserId).ToList());
                            }
                        }
                        result = _ipsDataContext.Users.Where(x => userIds.Contains(x.Id)).ToList();
                    }
                    else
                    {
                        List<int> userIds = new List<int>();
                        userIds.Add(currentUserId);
                        List<Department> Departments = _ipsDataContext.Departments.Include("Users").Where(_ => _.OrganizationId == organizationId).ToList();
                        foreach (Department department in Departments)
                        {
                            if (department.ManagerId == currentUserId)
                            {
                                userIds.AddRange(department.Users.Select(x => x.Id).ToList());
                            }
                        }
                        List<Team> teams = _ipsDataContext.Teams.Include("Link_TeamUsers").Where(_ => _.OrganizationId == organizationId).ToList();
                        foreach (Team team in teams)
                        {
                            if (team.TeamLeadId == currentUserId)
                            {
                                userIds.AddRange(team.Link_TeamUsers.Select(x => x.UserId).ToList());
                            }
                        }
                        result = _ipsDataContext.Users.Where(x => userIds.Contains(x.Id)).ToList();
                    }
                }
            }
            return result;
        }

        public List<User> GetAccessibleUsersbyOrganizationId(int organizationId, int userId)
        {
            List<User> result = new List<User>();
            if (userId > 0)
            {
                IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = _authService.GetUserRoleLevelAdvancePermissionByUserId(userId);
                if (ipsRoleLevelAdvancePermission != null)
                {
                    if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnOrganization)
                    {
                        result = _ipsDataContext.Users.Where(x => x.OrganizationId == organizationId).ToList();
                    }
                    else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.SubLevel)
                    {

                        RoleLevelService roleLevelService = new RoleLevelService();
                        IpsPermissionModel currentUserAllPermissions = _authService.GetUserPermissionsByUserId(userId).Where(x => x.OrganizationId == organizationId).FirstOrDefault();
                        if (currentUserAllPermissions != null)
                        {
                            List<UserRoleLevels> childUserRoleLevels = roleLevelService.GetRoleLevelChildsRecursive(currentUserAllPermissions.RoleLevelId);
                            List<IpsUser> users = new List<IpsUser>();
                            foreach (UserRoleLevels userroleLevel in childUserRoleLevels)
                            {
                                users.AddRange(roleLevelService.GetChildRoleLevelUsersRecursive(userroleLevel.Id));
                            }
                            List<int> userIds = users.Select(x => x.User.Id).ToList();
                            userIds.Add(userId);
                            result = _ipsDataContext.Users.Where(x => userIds.Contains(x.Id)).ToList();
                        }

                    }
                    else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnData)
                    {
                        List<int> userIds = new List<int>();
                        userIds.Add(userId);
                        List<Department> Departments = _ipsDataContext.Departments.Include("Users").Where(_ => _.OrganizationId == organizationId).ToList();
                        foreach (Department department in Departments)
                        {
                            if (department.ManagerId == userId)
                            {
                                userIds.AddRange(department.Users.Select(x => x.Id).ToList());
                            }
                        }
                        List<Team> teams = _ipsDataContext.Teams.Include("Link_TeamUsers").Where(_ => _.OrganizationId == organizationId).ToList();
                        foreach (Team team in teams)
                        {
                            if (team.TeamLeadId == userId)
                            {
                                userIds.AddRange(team.Link_TeamUsers.Select(x => x.UserId).ToList());
                            }
                        }
                        result = _ipsDataContext.Users.Where(x => userIds.Contains(x.Id)).ToList();
                    }
                    else
                    {
                        List<int> userIds = new List<int>();
                        userIds.Add(userId);
                        List<Department> Departments = _ipsDataContext.Departments.Include("Users").Where(_ => _.OrganizationId == organizationId).ToList();
                        foreach (Department department in Departments)
                        {
                            if (department.ManagerId == userId)
                            {
                                userIds.AddRange(department.Users.Select(x => x.Id).ToList());
                            }
                        }
                        List<Team> teams = _ipsDataContext.Teams.Include("Link_TeamUsers").Where(_ => _.OrganizationId == organizationId).ToList();
                        foreach (Team team in teams)
                        {
                            if (team.TeamLeadId == userId)
                            {
                                userIds.AddRange(team.Link_TeamUsers.Select(x => x.UserId).ToList());
                            }
                        }
                        result = _ipsDataContext.Users.Where(x => userIds.Contains(x.Id)).ToList();
                    }
                }
                else
                {
                    List<int> userIds = new List<int>();
                    userIds.Add(userId);
                    List<Department> Departments = _ipsDataContext.Departments.Include("Users").Where(_ => _.OrganizationId == organizationId).ToList();
                    foreach (Department department in Departments)
                    {
                        if (department.ManagerId == userId)
                        {
                            userIds.AddRange(department.Users.Select(x => x.Id).ToList());
                        }
                    }
                    List<Team> teams = _ipsDataContext.Teams.Include("Link_TeamUsers").Where(_ => _.OrganizationId == organizationId).ToList();
                    foreach (Team team in teams)
                    {
                        if (team.TeamLeadId == userId)
                        {
                            userIds.AddRange(team.Link_TeamUsers.Select(x => x.UserId).ToList());
                        }
                    }
                    result = _ipsDataContext.Users.Where(x => userIds.Contains(x.Id)).ToList();
                }
            }
            return result;
        }

        public bool AddCustomersByCsv(string csvPath, int organizationId, int salesManId)
        {
            bool result = false;
            if ((!string.IsNullOrEmpty(csvPath)) && organizationId > 0 && salesManId > 0)
            {
                var csv = File.ReadAllLines(csvPath, Encoding.Default);
                List<Customer> customers = new List<Customer>();

                Dictionary<string, int> columns = new Dictionary<string, int>();
                int i = 0;
                foreach (var lineItem in csv)
                {
                    var item = lineItem.Split(',').ToArray();
                    if (i == 0)
                    {

                    }
                    else
                    {
                        if (item.Length >= 7)
                        {
                            Customer newcustomer = new Customer()
                            {
                                CreatedBy = _authService.GetCurrentUserId(),
                                CreatedOn = DateTime.Now,
                                OrganizationId = organizationId,
                                AssignedUserId = salesManId,
                                CSVFile = Path.GetFileName(csvPath),
                            };
                            if (!string.IsNullOrEmpty(item[0]))
                            {
                                newcustomer.Name = item[0];
                            }
                            if (!string.IsNullOrEmpty(item[1]))
                            {
                                newcustomer.Email = item[1];
                            }
                            if (!string.IsNullOrEmpty(item[2]))
                            {
                                newcustomer.Mobile = item[2];
                            }
                            if (item.Length >= 8)
                            {
                                if (!string.IsNullOrEmpty(item[7]))
                                {
                                    newcustomer.PostCode = item[7];
                                }
                            }


                            if ((!string.IsNullOrEmpty(item[3])) || (!string.IsNullOrEmpty(item[4])) || (!string.IsNullOrEmpty(item[5])) || (!string.IsNullOrEmpty(item[6])))
                            {
                                CustomerSalesData customerSalesData = new CustomerSalesData()
                                {
                                    CSVFile = Path.GetFileName(csvPath),
                                    CreatedBy = newcustomer.CreatedBy,
                                    CreatedDate = newcustomer.CreatedOn,
                                };

                                DateTime minDate = DateTime.MinValue;
                                if (!string.IsNullOrEmpty(item[3]))
                                {
                                    bool isDate = DateTime.TryParse(item[3], out minDate);
                                    if (isDate)
                                    {
                                        customerSalesData.Date = Convert.ToDateTime(item[3]);
                                    }
                                }
                                if (!string.IsNullOrEmpty(item[4]))
                                {
                                    customerSalesData.Model = item[4];
                                }
                                if (!string.IsNullOrEmpty(item[5]))
                                {
                                    customerSalesData.Type = item[5];
                                }
                                if (!string.IsNullOrEmpty(item[6]))
                                {
                                    customerSalesData.RegistrationNo = item[6];
                                }
                                if (item.Length >= 9)
                                {
                                    int offer = 0;
                                    bool isoffer = int.TryParse(item[8], out offer);
                                    if (isoffer)
                                    {
                                        customerSalesData.Offer = offer;
                                    }
                                }
                                if (item.Length >= 10)
                                {
                                    customerSalesData.Seller = item[9];
                                }
                                if ((!string.IsNullOrEmpty(item[0])) && (!string.IsNullOrEmpty(item[2])))
                                {
                                    newcustomer.CustomerSalesDatas.Add(customerSalesData);
                                }
                                else if ((string.IsNullOrEmpty(item[0])) && (string.IsNullOrEmpty(item[1])) && (string.IsNullOrEmpty(item[2])))
                                {
                                    if (customers.Count() > 0)
                                    {
                                        if (customers[customers.Count - 1] != null)
                                        {
                                            customers[customers.Count - 1].CustomerSalesDatas.Add(customerSalesData);
                                        }
                                    }
                                }
                            }
                            if (!(string.IsNullOrEmpty(newcustomer.Name) || string.IsNullOrEmpty(newcustomer.Mobile)))
                            {

                                if (!(_ipsDataContext.Customers.Any(x => x.OrganizationId == organizationId && x.AssignedUserId == newcustomer.AssignedUserId && (x.Mobile == newcustomer.Mobile))))
                                {
                                    if (!(customers.Any(x => x.OrganizationId == organizationId && x.AssignedUserId == newcustomer.AssignedUserId && (x.Mobile == newcustomer.Mobile))))
                                    {
                                        customers.Add(newcustomer);
                                    }
                                    else
                                    {
                                        if (customers.Count() > 0)
                                        {
                                            foreach (Customer cust in customers)
                                            {
                                                if (cust.OrganizationId == organizationId && cust.AssignedUserId == newcustomer.AssignedUserId && (cust.Mobile == newcustomer.Mobile))
                                                {
                                                    if (cust != null)
                                                    {
                                                        foreach (CustomerSalesData saleData in newcustomer.CustomerSalesDatas)
                                                        {
                                                            if (!cust.CustomerSalesDatas.Any(x => x.Type == saleData.Type && x.Model == saleData.Model && x.RegistrationNo == saleData.RegistrationNo))
                                                            {
                                                                cust.CustomerSalesDatas.Add(saleData);
                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                        }
                                    }
                                }
                                else
                                {
                                    Customer customer = _ipsDataContext.Customers.Where(x => x.OrganizationId == organizationId && x.AssignedUserId == newcustomer.AssignedUserId && (x.Mobile == newcustomer.Mobile)).FirstOrDefault();
                                    if (customer != null)
                                    {
                                        foreach (CustomerSalesData customerSalesData in customer.CustomerSalesDatas)
                                        {
                                            bool isExist = _ipsDataContext.CustomerSalesDatas.Any(x => x.CustomerId == customer.Id && x.Type == customerSalesData.Type && x.Model == customerSalesData.Model);
                                            if (!isExist)
                                            {
                                                customerSalesData.CustomerId = customer.Id;
                                                _ipsDataContext.CustomerSalesDatas.Add(customerSalesData);
                                                _ipsDataContext.SaveChanges();
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    i++;
                }

                if (customers.Count() > 0)
                {
                    _ipsDataContext.Customers.AddRange(customers);
                    _ipsDataContext.SaveChanges();
                    result = true;
                }
            }
            return result;
        }

        public bool AddOrganizationByCsv(string csvPath, int organizationId)
        {
            bool result = false;
            IpsUserService ipsUserService = new IpsUserService();
            if ((!string.IsNullOrEmpty(csvPath)) && organizationId > 0)
            {
                var csv = File.ReadAllLines(csvPath, Encoding.Default);
                List<Organization> organizations = new List<Organization>();

                Dictionary<string, int> columns = new Dictionary<string, int>();
                int i = 0;
                foreach (var lineItem in csv)
                {
                    var item = lineItem.Split(',').ToArray();
                    if (i == 0)
                    {
                        //for (int c = 0; c < item.Length; c++)
                        //{
                        //    columns.Add(item[c], c);
                        //}
                    }
                    else
                    {
                        if (item.Count() > 0)
                        {
                            Organization newOrganization = new Organization()
                            {
                                CreatedBy = _authService.GetCurrentUserId(),
                                CreatedOn = DateTime.Now,
                                ParentOrganizationId = organizationId,
                                ParentId = organizationId,
                                CSVFile = Path.GetFileName(csvPath),
                            };
                            //foreach (var columnItem in columns)
                            //{
                            //    //columnItem["Orgnr"] 
                            //    if (columnItem.Key == "Orgnr")
                            //    {

                            //        if (!string.IsNullOrEmpty(item[columnItem.Value]))
                            //        {
                            //            newOrganization.OrgCode = item[columnItem.Value];
                            //        }
                            //    }
                            //    if (columnItem.Key == "Company name")
                            //    {

                            //        if (!string.IsNullOrEmpty(item[columnItem.Value]))
                            //        {
                            //            newOrganization.Name = item[columnItem.Value];
                            //        }
                            //    }
                            //}

                            if (!string.IsNullOrEmpty(item[0]))
                            {
                                newOrganization.OrgCode = item[0];
                            }
                            if (!string.IsNullOrEmpty(item[1]))
                            {
                                string indusrtyName = item[1];
                                Industry industry = _ipsDataContext.Industries.Where(x => x.Name == indusrtyName).FirstOrDefault();
                                if (industry != null)
                                {
                                    newOrganization.IndustryId = industry.Id;
                                }
                                else
                                {
                                    newOrganization.Industry = new Industry()
                                    {
                                        Name = indusrtyName,
                                        OrganizationId = organizationId,
                                    };
                                }

                            }

                            if (!string.IsNullOrEmpty(item[2]))
                            {
                                newOrganization.Name = item[2];
                            }

                            if (!string.IsNullOrEmpty(item[3]))
                            {
                                newOrganization.ContactName = item[3];
                            }

                            if (!string.IsNullOrEmpty(item[4]))
                            {
                                newOrganization.Phone = item[4];
                            }
                            if (!string.IsNullOrEmpty(item[5]))
                            {
                                newOrganization.Website = item[5];
                            }
                            if (!string.IsNullOrEmpty(item[6]))
                            {
                                newOrganization.City = item[6];
                            }
                            if (!string.IsNullOrEmpty(item[7]))
                            {
                                newOrganization.State = item[7];
                            }
                            if (!string.IsNullOrEmpty(item[8]))
                            {
                                newOrganization.Address = item[8];
                            }
                            if (!string.IsNullOrEmpty(item[9]))
                            {
                                newOrganization.ZipPostalCode = item[9];
                            }

                            if (!string.IsNullOrEmpty(item[10]))
                            {
                                newOrganization.PostCity = item[10];
                            }
                            if (!string.IsNullOrEmpty(item[11]))
                            {
                                newOrganization.PostAddressLine1 = item[11];
                            }
                            if (!string.IsNullOrEmpty(item[12]))
                            {
                                newOrganization.PostZipPostalCode = item[12];
                            }
                            if (!string.IsNullOrEmpty(item[13]))
                            {
                                newOrganization.PostAddressLine2 = item[13];
                            }
                            if (!string.IsNullOrEmpty(item[14]))
                            {
                                newOrganization.Email = item[14];
                            }

                            if (!string.IsNullOrEmpty(item[15]))
                            {
                                newOrganization.ContactName = item[15];
                            }


                            //if (!string.IsNullOrEmpty(item[15]))
                            //{
                            //    newOrganization.Email = item[15];
                            //    newOrganization.ContactEmail = item[15];
                            //}

                            if (item.Count() > 15)
                            {
                                if (!string.IsNullOrEmpty(item[16]))
                                {
                                    string roleName = item[16];
                                    var lookupItem = _ipsDataContext.LookupItems.Where(x => x.LookupItemType == "OrgContactRole" && x.Name == roleName).FirstOrDefault();
                                    if (lookupItem != null)
                                    {
                                        newOrganization.ContactRoleId = lookupItem.Id;
                                    }
                                    else
                                    {
                                        LookupItem newLookupItem = new LookupItem()
                                        {
                                            Name = item[16],
                                            LookupItemType = "OrgContactRole",
                                        };
                                        _ipsDataContext.LookupItems.Add(newLookupItem);
                                        _ipsDataContext.SaveChanges();
                                        newOrganization.ContactRoleId = newLookupItem.Id;
                                    }
                                }
                                if (!string.IsNullOrEmpty(item[17]))
                                {
                                    newOrganization.ContactEmail = item[17];
                                }
                                if (!string.IsNullOrEmpty(item[18]))
                                {
                                    string titleName = item[18];
                                    var lookupItem = _ipsDataContext.LookupItems.Where(x => x.LookupItemType == "OrgContactTitle" && x.Name == titleName).FirstOrDefault();
                                    if (lookupItem != null)
                                    {
                                        newOrganization.ContactTitleId = lookupItem.Id;
                                    }
                                    else
                                    {
                                        LookupItem newLookupItem = new LookupItem()
                                        {
                                            Name = item[18],
                                            LookupItemType = "OrgContactTitle",
                                        };
                                        _ipsDataContext.LookupItems.Add(newLookupItem);
                                        _ipsDataContext.SaveChanges();
                                        newOrganization.ContactTitleId = newLookupItem.Id;
                                    }
                                }
                                if (!string.IsNullOrEmpty(item[19]))
                                {
                                    newOrganization.LinkedIn = item[19];
                                }
                                if (!string.IsNullOrEmpty(item[20]))
                                {
                                    newOrganization.ContactPhone = item[20];
                                }
                            }
                            if (!_ipsDataContext.Organizations.Any(x => (x.Name == newOrganization.Name || x.OrgCode == newOrganization.OrgCode) && x.ParentId == organizationId))
                            {
                                newOrganization.Departments.Add(new Department()
                                {
                                    Name = "Top Management",
                                    Description = "Top Management Department",
                                });
                                String[] strlist = newOrganization.ContactName.Split(' ');

                                RSAAsymmetricProvider rsaAsymmetricProvider = new RSAAsymmetricProvider();

                                ApplicationUser user = new ApplicationUser();
                                user.Email = newOrganization.Email;
                                user.UserName = newOrganization.Email;
                                user.IsActive = true;
                                user.EmailConfirmed = false;
                                user.PhoneNumberConfirmed = false;
                                user.TwoFactorEnabled = false;
                                user.LockoutEnabled = false;
                                user.AccessFailedCount = 0;
                                user.Id = Guid.NewGuid().ToString();
                                if (strlist.Count() == 2)
                                {
                                    user.FirstName = strlist.FirstOrDefault();
                                    user.LastName = strlist.Last();
                                }
                                else if (strlist.Count() > 2)
                                {
                                    List<string> newName = new List<string>();
                                    for (int s = 0; s < (strlist.Count() - 1); s++)
                                    {
                                        newName.Add(strlist[s]);
                                    }
                                    user.FirstName = string.Join(" ", newName.ToArray());
                                    user.LastName = strlist.Last();
                                }
                                else
                                {
                                    if (!string.IsNullOrEmpty(newOrganization.Email))
                                    {
                                        String[] stremaillist = newOrganization.Email.Split('@');
                                        if (stremaillist.Count() > 1)
                                        {
                                            user.FirstName = stremaillist.FirstOrDefault();
                                            user.LastName = strlist.Last();
                                        }
                                    }
                                    else if (!string.IsNullOrEmpty(newOrganization.ContactEmail))
                                    {
                                        String[] stremaillist = newOrganization.ContactEmail.Split('@');
                                        if (stremaillist.Count() > 1)
                                        {
                                            user.FirstName = stremaillist.FirstOrDefault();
                                            user.LastName = strlist.Last();
                                        }
                                    }

                                }
                                string passkey = user.FirstName.FirstOrDefault().ToString() + user.LastName.FirstOrDefault().ToString() + "123456";
                                user.Password = rsaAsymmetricProvider.Encrypt(passkey);
                                _authService.CreateUser(user, passkey);

                                newOrganization.Users.Add(new User()
                                {
                                    FirstName = user.FirstName,
                                    LastName = user.LastName,
                                    WorkEmail = user.Email,
                                    UserKey = user.Id,
                                    MobileNo = newOrganization.ContactPhone,
                                    UserTypeId = 2,
                                });

                                organizations.Add(newOrganization);
                            }
                        }
                    }
                    i++;
                }

                if (organizations.Count() > 0)
                {
                    _ipsDataContext.Organizations.AddRange(organizations);
                    _ipsDataContext.SaveChanges();
                    RoleLevelService roleLevelService = new RoleLevelService();
                    DepartmentService _departmentService = new DepartmentService();
                    RoleService roleService = new RoleService();

                    foreach (Organization organization in organizations)
                    {
                        AssignRolesAndPermissions(organization);

                        IpsRoleLevelModel orgTopRoleLevel = roleLevelService.getRoleLevelsByOrganizationId(organization.Id).Where(x => x.ParentRoleLevelId == null).FirstOrDefault();
                        if (orgTopRoleLevel != null)
                        {

                            IpsRole role = roleService.GetRolesByLevelId(orgTopRoleLevel.Id).FirstOrDefault();
                            if (role != null)
                            {
                                foreach (User orgUser in organization.Users)
                                {
                                    IpsUser ipsUser = new IpsUser()
                                    {
                                        Email = orgUser.WorkEmail,
                                        FirstName = orgUser.FirstName,
                                        Id = orgUser.UserKey,
                                        LastName = orgUser.LastName,
                                        OrganizationName = organization.Name,
                                        UserName = orgUser.WorkEmail,
                                        Roles = new List<IpsUserRole>()
                                    };
                                    ipsUser.Roles.Add(new IpsUserRole()
                                    {
                                        OrganizationId = organization.Id,
                                        RoleId = role.Id,
                                        RoleLevelId = role.RoleLevel,
                                        UserId = ipsUser.Id,
                                    });
                                    bool isuserUpdated = ipsUserService.Update(ipsUser);

                                    foreach (Department department in organization.Departments)
                                    {
                                        department.Users.Add(orgUser);
                                        _departmentService.Update(department);
                                    }

                                }
                            }
                        }

                    }
                    result = true;
                }
            }
            return result;
        }



        public List<Organization> GetAccessibleOrganizations(int organizationId, int userId)
        {
            List<Organization> result = new List<Organization>();
            if (userId > 0)
            {
                IpsRoleLevelAdvancePermission ipsRoleLevelAdvancePermission = _authService.GetUserRoleLevelAdvancePermissionByUserId(userId);
                if (ipsRoleLevelAdvancePermission != null)
                {
                    if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.OwnOrganization)
                    {
                        result = _ipsDataContext.Organizations.Where(x => x.ParentId == organizationId).ToList();
                    }
                    else if (ipsRoleLevelAdvancePermission.PermissionLevelId == (int)PermissionLevelEnum.AllOrganization)
                    {
                        result = _ipsDataContext.Organizations.Where(x => x.ParentId == organizationId).ToList();
                    }
                }
            }
            return result;
        }


    }
}
