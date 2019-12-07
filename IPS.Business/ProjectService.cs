using System.Linq;
using IPS.Business.Interfaces;
using IPS.Data;
using IPS.BusinessModels.Common;
using System.Collections.Generic;
using IPS.BusinessModels.ProjectModel;
using System;
using System.Data.Entity.Infrastructure;
using IPS.BusinessModels.Entities;
using IPS.BusinessModels.TrainingDiaryModels;
using Newtonsoft.Json;
using IPS.BusinessModels.ProfileModels;
using IPS.BusinessModels.SalesActivityModels;
using IPS.Data.Enums;
using IPS.BusinessModels.SkillModels;

namespace IPS.Business
{
    public class ProjectService : BaseService, IProjectService
    {
        public List<IpsProjectListModel> Get()
        {
            List<IpsProjectListModel> result = new List<IpsProjectListModel>();
            var currentUser = _authService.getCurrentUser();
            var realCurrentUser = _authService.GetUserById(currentUser.Id);
            int userOrganizationId = _authService.GetCurrentUserOrgId();

            List<int> idList = _authService.GetUserOrganizations();
            if (_authService.IsFromGlobalOrganization(idList))
            {
                result = _ipsDataContext.Projects.Include("ProjectGoals").Select(x => new IpsProjectListModel()
                {
                    ExpectedEndDate = x.ExpectedEndDate,
                    ExpectedStartDate = x.ExpectedStartDate,
                    Id = x.Id,
                    IsActive = x.IsActive,
                    MissionStatement = x.MissionStatement,
                    Name = x.Name,
                    Summary = x.Summary,
                    VisionStatement = x.VisionStatement,
                    GoalStatement = x.ProjectGoals.Select(y => y.Goal).ToList(),
                    StratagiesStatement = x.ProjectGoals.Select(y => y.Strategy).ToList(),
                    OrganizationId = x.OrganizationId,
                }).ToList();
            }
            else
            {
                foreach (int orgId in idList)
                {
                    var isAdminOrSuperAdmin = _authService.IsInOrganizationInRoleOf("Admin", orgId) || _authService.IsInOrganizationInRoleOf("Super Admin", orgId);
                    if (isAdminOrSuperAdmin)
                    {
                        List<IpsProjectListModel> adminProjects = _ipsDataContext.Projects.Include("ProjectGoals").Select(x => new IpsProjectListModel()
                        {
                            ExpectedEndDate = x.ExpectedEndDate,
                            ExpectedStartDate = x.ExpectedStartDate,
                            Id = x.Id,
                            IsActive = x.IsActive,
                            MissionStatement = x.MissionStatement,
                            Name = x.Name,
                            Summary = x.Summary,
                            VisionStatement = x.VisionStatement,
                            GoalStatement = x.ProjectGoals.Select(y => y.Goal).ToList(),
                            StratagiesStatement = x.ProjectGoals.Select(y => y.Strategy).ToList(),
                            OrganizationId = x.OrganizationId,
                        }).Where(x => x.OrganizationId == userOrganizationId).ToList();
                        result.AddRange(adminProjects);
                    }
                }

                List<IpsProjectListModel> normalUserProjects = _ipsDataContext.Link_ProjectUsers.Include("Projects").Include("ProjectGoals").Where(_ => _.UserId == realCurrentUser.User.Id)
                       .Select(x => new IpsProjectListModel()
                       {
                           ExpectedEndDate = x.Project.ExpectedEndDate,
                           ExpectedStartDate = x.Project.ExpectedStartDate,
                           Id = x.Project.Id,
                           IsActive = x.Project.IsActive,
                           MissionStatement = x.Project.MissionStatement,
                           Name = x.Project.Name,
                           Summary = x.Project.Summary,
                           VisionStatement = x.Project.VisionStatement,
                           GoalStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == x.Project.Id).Select(y => y.Goal).ToList(),
                           StratagiesStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == x.Project.Id).Select(y => y.Strategy).ToList(),
                           OrganizationId = x.Project.OrganizationId,
                       }).ToList();
                result.AddRange(normalUserProjects);


            }
            result = result.GroupBy(x => x.Id).Select(g => g.First()).ToList();
            return result;
        }


        public IpsUserProjects getOrganizationProjects(int organizationId)
        {

            IpsUserProjects result = new IpsUserProjects();
            DateTime today = DateTime.Today;
            int userOrganizationId = _authService.GetCurrentUserOrgId();
            PerformanceService performanceService = new PerformanceService();
            List<IpsUserProjectListModel> list = new List<IpsUserProjectListModel>();

            List<Project> allProjects = _ipsDataContext.Projects.Include("ProjectGoals").Include("Link_ProjectUsers").Where(x => x.OrganizationId == organizationId).ToList();
            foreach (Project project in allProjects)
            {


                list.Add(new IpsUserProjectListModel()
                {
                    ExpectedEndDate = project.ExpectedEndDate,
                    ExpectedStartDate = project.ExpectedStartDate,
                    Id = project.Id,
                    IsActive = project.IsActive,
                    MissionStatement = project.MissionStatement,
                    Name = project.Name,
                    Summary = project.Summary,
                    VisionStatement = project.VisionStatement,
                    GoalStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == project.Id).Select(y => y.Goal).ToList(),
                    StratagiesStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == project.Id).Select(y => y.Strategy).ToList(),
                    Link_ProjectUsers = project.Link_ProjectUsers.ToList(),
                });

            }
            foreach (IpsUserProjectListModel project in list)
            {

                if (project.IsActive)
                {
                    foreach (Link_ProjectUsers projectUser in project.Link_ProjectUsers)
                    {
                        if (projectUser.RoleId == 4)
                        {
                            IpsUserProfiles userProfiles = performanceService.GetUserProfilesByProjectProfile(projectUser.UserId, project.Id, null);
                            if (userProfiles != null)
                            {
                                List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
                                expiredProfiles = userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList();
                                List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
                                if (expiredStageGroupIds.Count() > 0)
                                {
                                    foreach (IpsUserProfile profile in userProfiles.ActiveProfiles)
                                    {
                                        if (profile.IsExpired == false && profile.PreviousStage == true)
                                        {
                                            if (expiredStageGroupIds.Contains(profile.Stage.StageGroupId))
                                            {
                                                profile.IsExpired = true;
                                                profile.IsBlocked = true;
                                            }
                                        }
                                    }
                                }

                                project.ActiveProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == false).ToList());
                                project.ExpiredProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList());
                                project.CompletedProfiles.AddRange(userProfiles.CompletedProfiles.ToList());
                                project.HistoryProfiles.AddRange(userProfiles.History.ToList());
                            }
                        }
                    }
                    if (project.ActiveProfiles.Count() > 0)
                    {
                        // active or completed
                        result.ActiveProjects.Add(project);
                    }
                    else if (project.ActiveProfiles.Count() == 0 && project.ExpiredProfiles.Count() > 0)
                    {
                        if (project.ExpectedStartDate <= today && project.ExpectedEndDate > today)
                        {
                            result.ActiveProjects.Add(project);
                        }
                        else
                        {
                            result.ExpiredProjects.Add(project);
                        }

                    }
                    else if (project.CompletedProfiles.Count() > 0)
                    {
                        // active or completed


                        result.ActiveProjects.Add(project);
                    }
                    else if (project.HistoryProfiles.Count() > 0)
                    {
                        if (project.ExpectedStartDate <= today && project.ExpectedEndDate > today)
                        {
                            result.ActiveProjects.Add(project);
                        }
                        else
                        {
                            result.HistoryProjects.Add(project);
                        }
                    }
                    else
                    {
                        // active or completed
                        if (project.ExpectedStartDate <= today && project.ExpectedEndDate > today)
                        {
                            result.ActiveProjects.Add(project);
                        }
                        else
                        {
                            result.PendingProjects.Add(project);
                        }
                    }
                }
                else
                {
                    // active or completed
                    result.PendingProjects.Add(project);
                }
            }
            return result;

        }

        public IpsUserProjects GetUserProjects()
        {
            IpsUserProjects result = new IpsUserProjects();
            DateTime todayDate = DateTime.Today;

            List<IpsUserProjectListModel> list = new List<IpsUserProjectListModel>();
            var currentUser = _authService.getCurrentUser();
            var realCurrentUser = _authService.GetUserById(currentUser.Id);
            int userOrganizationId = _authService.GetCurrentUserOrgId();
            PerformanceService performanceService = new PerformanceService();


            List<Project> allProjects = _ipsDataContext.Projects.Include("ProjectGoals").Include("Link_ProjectUsers").ToList();
            foreach (Project project in allProjects)
            {

                if (project.Link_ProjectUsers.Any(x => x.UserId == realCurrentUser.User.Id))
                {
                    int roleId = project.Link_ProjectUsers.Where(x => x.UserId == realCurrentUser.User.Id).Select(x => x.RoleId).FirstOrDefault();

                    list.Add(new IpsUserProjectListModel()
                    {
                        ExpectedEndDate = project.ExpectedEndDate,
                        ExpectedStartDate = project.ExpectedStartDate,
                        Id = project.Id,
                        IsActive = project.IsActive,
                        MissionStatement = project.MissionStatement,
                        Name = project.Name,
                        Summary = project.Summary,
                        VisionStatement = project.VisionStatement,
                        GoalStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == project.Id).Select(y => y.Goal).ToList(),
                        StratagiesStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == project.Id).Select(y => y.Strategy).ToList(),
                        ProjectRoleId = roleId,
                        ProjectRoleName = _ipsDataContext.ProjectRoles.Where(x => x.Id == roleId).Select(x => x.Name).FirstOrDefault(),
                        Link_ProjectUsers = project.Link_ProjectUsers.ToList(),

                    });
                }
                else
                {
                    if (project.CreatedBy == realCurrentUser.User.Id)
                    {

                    }

                }
            }
            foreach (IpsUserProjectListModel project in list)
            {

                if (project.IsActive)
                {
                    bool isManager = project.Link_ProjectUsers.Any(x => x.UserId == realCurrentUser.User.Id && x.RoleId == 1);
                    if (isManager)
                    {
                        foreach (Link_ProjectUsers projectUser in project.Link_ProjectUsers)
                        {
                            if (projectUser.RoleId == 4)
                            {
                                IpsUserProfiles userProfiles = performanceService.GetUserProfilesByProjectProfile(projectUser.UserId, project.Id, null);
                                if (userProfiles != null)
                                {
                                    List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
                                    expiredProfiles = userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList();
                                    List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
                                    if (expiredStageGroupIds.Count() > 0)
                                    {
                                        foreach (IpsUserProfile profile in userProfiles.ActiveProfiles)
                                        {
                                            if (profile.IsExpired == false && profile.PreviousStage == true)
                                            {
                                                if (expiredStageGroupIds.Contains(profile.Stage.StageGroupId))
                                                {
                                                    profile.IsExpired = true;
                                                    profile.IsBlocked = true;
                                                }
                                            }
                                        }
                                    }

                                    project.ActiveProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == false).ToList());
                                    project.ExpiredProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList());
                                    project.CompletedProfiles.AddRange(userProfiles.CompletedProfiles.ToList());
                                    project.HistoryProfiles.AddRange(userProfiles.History.ToList());
                                }

                            }

                        }
                        if (project.ActiveProfiles.Count() > 0)
                        {
                            // active or completed
                            result.ActiveProjects.Add(project);
                        }
                        else if (project.ActiveProfiles.Count() == 0 && project.ExpiredProfiles.Count() > 0)
                        {
                            // active or completed
                            if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                            {
                                result.ActiveProjects.Add(project);
                            }
                            else
                            {
                                result.ExpiredProjects.Add(project);
                            }
                        }
                        else if (project.CompletedProfiles.Count() > 0)
                        {
                            // active or completed
                            if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                            {
                                result.ActiveProjects.Add(project);
                            }
                            else
                            {
                                result.CompletedProjects.Add(project);
                            }
                        }
                        else if (project.HistoryProfiles.Count() > 0)
                        {
                            if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                            {
                                result.ActiveProjects.Add(project);
                            }
                            else
                            {
                                result.HistoryProjects.Add(project);
                            }
                        }
                        else
                        {
                            // active or completed
                            if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                            {
                                result.ActiveProjects.Add(project);
                            }
                            else
                            {
                                result.PendingProjects.Add(project);
                            }
                        }
                    }
                    else
                    {
                        IpsUserProfiles userProfiles = performanceService.GetUserProfilesByProjectProfile(realCurrentUser.User.Id, project.Id, null);
                        if (userProfiles != null)
                        {
                            List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
                            expiredProfiles = userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList();
                            List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
                            if (expiredStageGroupIds.Count() > 0)
                            {
                                foreach (IpsUserProfile profile in userProfiles.ActiveProfiles)
                                {
                                    if (profile.IsExpired == false && profile.PreviousStage == true)
                                    {
                                        if (expiredStageGroupIds.Contains(profile.Stage.StageGroupId))
                                        {
                                            profile.IsExpired = true;
                                            profile.IsBlocked = true;
                                        }
                                    }
                                }
                            }

                            project.ActiveProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == false).ToList());
                            project.ExpiredProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList());
                            project.CompletedProfiles.AddRange(userProfiles.CompletedProfiles.ToList());
                            project.HistoryProfiles.AddRange(userProfiles.History.ToList());

                            if (project.ActiveProfiles.Count() > 0)
                            {
                                // active or completed
                                result.ActiveProjects.Add(project);
                            }
                            else if (project.ActiveProfiles.Count() == 0 && project.ExpiredProfiles.Count() > 0)
                            {
                                // active or completed
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.ExpiredProjects.Add(project);
                                }
                            }
                            else if (project.CompletedProfiles.Count() > 0)
                            {
                                // active or completed
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.CompletedProjects.Add(project);
                                }
                            }
                            else if (project.HistoryProfiles.Count() > 0)
                            {
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.HistoryProjects.Add(project);
                                }
                            }
                            else
                            {
                                // active or pending
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.PendingProjects.Add(project);
                                }
                            }
                        }


                    }



                }
                else
                {
                    // active or completed
                    result.PendingProjects.Add(project);
                }
            }
            return result;
        }

        public IpsUserProjects GetTaskProspectingProjects()
        {
            IpsUserProjects result = new IpsUserProjects();
            DateTime todayDate = DateTime.Today;

            List<IpsUserProjectListModel> list = new List<IpsUserProjectListModel>();
            var currentUser = _authService.getCurrentUser();
            if (currentUser != null)
            {
                var realCurrentUser = _authService.GetUserById(currentUser.Id);
                int userOrganizationId = _authService.GetCurrentUserOrgId();
                PerformanceService performanceService = new PerformanceService();

                List<int?> taskProjectIds = _ipsDataContext.Tasks.Where(x => x.ProjectId > 0).Select(x => x.ProjectId).ToList();
                List<Project> allProjects = _ipsDataContext.Projects.Include("ProjectGoals").Include("Link_ProjectUsers").Where(x => taskProjectIds.Contains(x.Id)).ToList();
                foreach (Project project in allProjects)
                {

                    if (project.Link_ProjectUsers.Any(x => x.UserId == realCurrentUser.User.Id))
                    {
                        int roleId = project.Link_ProjectUsers.Where(x => x.UserId == realCurrentUser.User.Id).Select(x => x.RoleId).FirstOrDefault();

                        list.Add(new IpsUserProjectListModel()
                        {
                            ExpectedEndDate = project.ExpectedEndDate,
                            ExpectedStartDate = project.ExpectedStartDate,
                            Id = project.Id,
                            IsActive = project.IsActive,
                            MissionStatement = project.MissionStatement,
                            Name = project.Name,
                            Summary = project.Summary,
                            VisionStatement = project.VisionStatement,
                            GoalStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == project.Id).Select(y => y.Goal).ToList(),
                            StratagiesStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == project.Id).Select(y => y.Strategy).ToList(),
                            ProjectRoleId = roleId,
                            ProjectRoleName = _ipsDataContext.ProjectRoles.Where(x => x.Id == roleId).Select(x => x.Name).FirstOrDefault(),
                            Link_ProjectUsers = project.Link_ProjectUsers.ToList(),
                        });
                    }
                    else
                    {
                        if (project.CreatedBy == realCurrentUser.User.Id)
                        {

                        }

                    }
                }
                foreach (IpsUserProjectListModel project in list)
                {

                    if (project.IsActive)
                    {
                        bool isManager = project.Link_ProjectUsers.Any(x => x.UserId == realCurrentUser.User.Id && x.RoleId == 1);
                        if (isManager)
                        {
                            foreach (Link_ProjectUsers projectUser in project.Link_ProjectUsers)
                            {
                                if (projectUser.RoleId == 4)
                                {
                                    IpsUserProfiles userProfiles = performanceService.GetUserProfilesByProjectProfile(projectUser.UserId, project.Id, null);
                                    if (userProfiles != null)
                                    {
                                        List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
                                        expiredProfiles = userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList();
                                        List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
                                        if (expiredStageGroupIds.Count() > 0)
                                        {
                                            foreach (IpsUserProfile profile in userProfiles.ActiveProfiles)
                                            {
                                                if (profile.IsExpired == false && profile.PreviousStage == true)
                                                {
                                                    if (expiredStageGroupIds.Contains(profile.Stage.StageGroupId))
                                                    {
                                                        profile.IsExpired = true;
                                                        profile.IsBlocked = true;
                                                    }
                                                }
                                            }
                                        }

                                        project.ActiveProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == false).ToList());
                                        project.ExpiredProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList());
                                        project.CompletedProfiles.AddRange(userProfiles.CompletedProfiles.ToList());
                                        project.HistoryProfiles.AddRange(userProfiles.History.ToList());
                                    }

                                }

                            }
                            if (project.ActiveProfiles.Count() > 0)
                            {
                                // active or completed
                                result.ActiveProjects.Add(project);
                            }
                            else if (project.ActiveProfiles.Count() == 0 && project.ExpiredProfiles.Count() > 0)
                            {
                                // active or completed
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.ExpiredProjects.Add(project);
                                }
                            }
                            else if (project.CompletedProfiles.Count() > 0)
                            {
                                // active or completed
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.CompletedProjects.Add(project);
                                }
                            }
                            else if (project.HistoryProfiles.Count() > 0)
                            {
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.HistoryProjects.Add(project);
                                }
                            }
                            else
                            {
                                // active or completed
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.PendingProjects.Add(project);
                                }
                            }
                        }
                        else
                        {
                            IpsUserProfiles userProfiles = performanceService.GetUserProfilesByProjectProfile(realCurrentUser.User.Id, project.Id, null);
                            if (userProfiles != null)
                            {
                                List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
                                expiredProfiles = userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList();
                                List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
                                if (expiredStageGroupIds.Count() > 0)
                                {
                                    foreach (IpsUserProfile profile in userProfiles.ActiveProfiles)
                                    {
                                        if (profile.IsExpired == false && profile.PreviousStage == true)
                                        {
                                            if (expiredStageGroupIds.Contains(profile.Stage.StageGroupId))
                                            {
                                                profile.IsExpired = true;
                                                profile.IsBlocked = true;
                                            }
                                        }
                                    }
                                }

                                project.ActiveProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == false).ToList());
                                project.ExpiredProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList());
                                project.CompletedProfiles.AddRange(userProfiles.CompletedProfiles.ToList());
                                project.HistoryProfiles.AddRange(userProfiles.History.ToList());

                                if (project.ActiveProfiles.Count() > 0)
                                {
                                    // active or completed
                                    result.ActiveProjects.Add(project);
                                }
                                else if (project.ActiveProfiles.Count() == 0 && project.ExpiredProfiles.Count() > 0)
                                {
                                    // active or completed
                                    if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                    {
                                        result.ActiveProjects.Add(project);
                                    }
                                    else
                                    {
                                        result.ExpiredProjects.Add(project);
                                    }
                                }
                                else if (project.CompletedProfiles.Count() > 0)
                                {
                                    // active or completed
                                    if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                    {
                                        result.ActiveProjects.Add(project);
                                    }
                                    else
                                    {
                                        result.CompletedProjects.Add(project);
                                    }
                                }
                                else if (project.HistoryProfiles.Count() > 0)
                                {
                                    if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                    {
                                        result.ActiveProjects.Add(project);
                                    }
                                    else
                                    {
                                        result.HistoryProjects.Add(project);
                                    }
                                }
                                else
                                {
                                    // active or pending
                                    if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                    {
                                        result.ActiveProjects.Add(project);
                                    }
                                    else
                                    {
                                        result.PendingProjects.Add(project);
                                    }
                                }
                            }


                        }



                    }
                    else
                    {
                        // active or completed
                        result.PendingProjects.Add(project);
                    }
                }
            }
            return result;
        }

        public IpsUserProjects GetServiceProspectingProjects()
        {
            IpsUserProjects result = new IpsUserProjects();
            DateTime todayDate = DateTime.Today;

            List<IpsUserProjectListModel> list = new List<IpsUserProjectListModel>();
            var currentUser = _authService.getCurrentUser();
            var realCurrentUser = _authService.GetUserById(currentUser.Id);
            int userOrganizationId = _authService.GetCurrentUserOrgId();
            PerformanceService performanceService = new PerformanceService();

            List<int?> taskProjectIds = _ipsDataContext.Tasks.Where(x => x.TaskCategoryListItem.Name.ToLower() == "service prospecting").Where(x => x.ProjectId > 0).Select(x => x.ProjectId).ToList();
            List<Project> allProjects = _ipsDataContext.Projects.Include("ProjectGoals").Include("Link_ProjectUsers").Where(x => taskProjectIds.Contains(x.Id)).ToList();
            foreach (Project project in allProjects)
            {

                if (project.Link_ProjectUsers.Any(x => x.UserId == realCurrentUser.User.Id))
                {
                    int roleId = project.Link_ProjectUsers.Where(x => x.UserId == realCurrentUser.User.Id).Select(x => x.RoleId).FirstOrDefault();

                    list.Add(new IpsUserProjectListModel()
                    {
                        ExpectedEndDate = project.ExpectedEndDate,
                        ExpectedStartDate = project.ExpectedStartDate,
                        Id = project.Id,
                        IsActive = project.IsActive,
                        MissionStatement = project.MissionStatement,
                        Name = project.Name,
                        Summary = project.Summary,
                        VisionStatement = project.VisionStatement,
                        GoalStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == project.Id).Select(y => y.Goal).ToList(),
                        StratagiesStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == project.Id).Select(y => y.Strategy).ToList(),
                        ProjectRoleId = roleId,
                        ProjectRoleName = _ipsDataContext.ProjectRoles.Where(x => x.Id == roleId).Select(x => x.Name).FirstOrDefault(),
                        Link_ProjectUsers = project.Link_ProjectUsers.ToList(),
                    });
                }
                else
                {
                    if (project.CreatedBy == realCurrentUser.User.Id)
                    {

                    }

                }
            }
            foreach (IpsUserProjectListModel project in list)
            {

                if (project.IsActive)
                {
                    bool isManager = project.Link_ProjectUsers.Any(x => x.UserId == realCurrentUser.User.Id && x.RoleId == 1);
                    if (isManager)
                    {
                        foreach (Link_ProjectUsers projectUser in project.Link_ProjectUsers)
                        {
                            if (projectUser.RoleId == 4)
                            {
                                IpsUserProfiles userProfiles = performanceService.GetUserProfilesByProjectProfile(projectUser.UserId, project.Id, null);
                                if (userProfiles != null)
                                {
                                    List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
                                    expiredProfiles = userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList();
                                    List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
                                    if (expiredStageGroupIds.Count() > 0)
                                    {
                                        foreach (IpsUserProfile profile in userProfiles.ActiveProfiles)
                                        {
                                            if (profile.IsExpired == false && profile.PreviousStage == true)
                                            {
                                                if (expiredStageGroupIds.Contains(profile.Stage.StageGroupId))
                                                {
                                                    profile.IsExpired = true;
                                                    profile.IsBlocked = true;
                                                }
                                            }
                                        }
                                    }

                                    project.ActiveProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == false).ToList());
                                    project.ExpiredProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList());
                                    project.CompletedProfiles.AddRange(userProfiles.CompletedProfiles.ToList());
                                    project.HistoryProfiles.AddRange(userProfiles.History.ToList());
                                }

                            }

                        }
                        if (project.ActiveProfiles.Count() > 0)
                        {
                            // active or completed
                            result.ActiveProjects.Add(project);
                        }
                        else if (project.ActiveProfiles.Count() == 0 && project.ExpiredProfiles.Count() > 0)
                        {
                            // active or completed
                            if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                            {
                                result.ActiveProjects.Add(project);
                            }
                            else
                            {
                                result.ExpiredProjects.Add(project);
                            }
                        }
                        else if (project.CompletedProfiles.Count() > 0)
                        {
                            // active or completed
                            if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                            {
                                result.ActiveProjects.Add(project);
                            }
                            else
                            {
                                result.CompletedProjects.Add(project);
                            }
                        }
                        else if (project.HistoryProfiles.Count() > 0)
                        {
                            if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                            {
                                result.ActiveProjects.Add(project);
                            }
                            else
                            {
                                result.HistoryProjects.Add(project);
                            }
                        }
                        else
                        {
                            // active or completed
                            if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                            {
                                result.ActiveProjects.Add(project);
                            }
                            else
                            {
                                result.PendingProjects.Add(project);
                            }
                        }
                    }
                    else
                    {
                        IpsUserProfiles userProfiles = performanceService.GetUserProfilesByProjectProfile(realCurrentUser.User.Id, project.Id, null);
                        if (userProfiles != null)
                        {
                            List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
                            expiredProfiles = userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList();
                            List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
                            if (expiredStageGroupIds.Count() > 0)
                            {
                                foreach (IpsUserProfile profile in userProfiles.ActiveProfiles)
                                {
                                    if (profile.IsExpired == false && profile.PreviousStage == true)
                                    {
                                        if (expiredStageGroupIds.Contains(profile.Stage.StageGroupId))
                                        {
                                            profile.IsExpired = true;
                                            profile.IsBlocked = true;
                                        }
                                    }
                                }
                            }

                            project.ActiveProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == false).ToList());
                            project.ExpiredProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList());
                            project.CompletedProfiles.AddRange(userProfiles.CompletedProfiles.ToList());
                            project.HistoryProfiles.AddRange(userProfiles.History.ToList());

                            if (project.ActiveProfiles.Count() > 0)
                            {
                                // active or completed
                                result.ActiveProjects.Add(project);
                            }
                            else if (project.ActiveProfiles.Count() == 0 && project.ExpiredProfiles.Count() > 0)
                            {
                                // active or completed
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.ExpiredProjects.Add(project);
                                }
                            }
                            else if (project.CompletedProfiles.Count() > 0)
                            {
                                // active or completed
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.CompletedProjects.Add(project);
                                }
                            }
                            else if (project.HistoryProfiles.Count() > 0)
                            {
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.HistoryProjects.Add(project);
                                }
                            }
                            else
                            {
                                // active or pending
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.PendingProjects.Add(project);
                                }
                            }
                        }


                    }



                }
                else
                {
                    // active or completed
                    result.PendingProjects.Add(project);
                }
            }
            return result;
        }

        public IpsProjectStatusModel GetProjectStatus(int projectId)
        {

            var currentUser = _authService.getCurrentUser();
            var realCurrentUser = _authService.GetUserById(currentUser.Id);
            int userOrganizationId = _authService.GetCurrentUserOrgId();
            IpsProjectStatusModel IpsUserProjectModel = new IpsProjectStatusModel();
            Project project = _ipsDataContext.Projects.Include("ProjectGoals").Include("Link_ProjectUsers.User").Where(x => x.Id == projectId).FirstOrDefault();
            if (project != null)
            {

                IpsUserProjectModel = new IpsProjectStatusModel()
                {
                    ExpectedEndDate = project.ExpectedEndDate,
                    ExpectedStartDate = project.ExpectedStartDate,
                    Id = project.Id,
                    IsActive = project.IsActive,
                    MissionStatement = project.MissionStatement,
                    Name = project.Name,
                    Summary = project.Summary,
                    VisionStatement = project.VisionStatement,
                    GoalStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == project.Id).Select(y => y.Goal).ToList(),
                    StratagiesStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == project.Id).Select(y => y.Strategy).ToList(),
                    Members = project.Link_ProjectUsers.ToList(),
                };
                List<Profile> AllProfiles = _ipsDataContext.Profiles.Include("PerformanceGroups.Link_PerformanceGroupSkills.Trainings").Include("StageGroups.Stages").Where(x => x.ProjectId == projectId).ToList();
                foreach (Link_ProjectUsers projectUser in project.Link_ProjectUsers)
                {
                    if (projectUser.RoleId == 4 || projectUser.RoleId == 3 || projectUser.RoleId == 2)
                    {
                        PerformanceService performanceService = new PerformanceService();
                        IpsUserProfiles userProfiles = performanceService.GetUserProfilesByProjectProfile(projectUser.UserId, project.Id, null);
                        if (userProfiles != null)
                        {

                            List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
                            expiredProfiles = userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList();
                            List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
                            if (expiredStageGroupIds.Count() > 0)
                            {
                                foreach (IpsUserProfile profile in userProfiles.ActiveProfiles)
                                {
                                    if (profile.IsExpired == false && profile.PreviousStage == true)
                                    {
                                        if (expiredStageGroupIds.Contains(profile.Stage.StageGroupId))
                                        {
                                            profile.IsExpired = true;
                                            profile.IsBlocked = true;
                                        }
                                    }
                                }
                            }

                            IpsUserProjectModel.ActiveProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == false).ToList());
                            IpsUserProjectModel.ExpiredProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList());
                            IpsUserProjectModel.CompletedProfiles.AddRange(userProfiles.CompletedProfiles.ToList());
                        }
                        List<int> activeProfileIds = IpsUserProjectModel.ActiveProfiles.Select(x => x.Profile.Id).ToList();
                        List<int> expiredProfilesIds = IpsUserProjectModel.ExpiredProfiles.Select(x => x.Profile.Id).ToList();
                        List<int> completedProfileIds = IpsUserProjectModel.CompletedProfiles.Select(x => x.Profile.Id).ToList();

                        foreach (Profile profile in AllProfiles)
                        {
                            if (!(activeProfileIds.Contains(profile.Id) || expiredProfilesIds.Contains(profile.Id) || completedProfileIds.Contains(profile.Id)))
                            {
                                IpsUserProjectModel.PendingProfiles.Add(profile);
                            }
                        }
                    }
                }


            }
            return IpsUserProjectModel;
        }

        public List<ProspectingGoalResultModel> getSalesActivityData(int profileId)
        {
            List<ProspectingGoalResultModel> result = new List<ProspectingGoalResultModel>();
            List<Stage> profileStages = new List<Stage>();
            Profile profileSource = _ipsDataContext.Profiles.Include("StageGroups").Where(x => x.Id == profileId).FirstOrDefault();
            List<StageGroup> stageGroupList = new List<StageGroup>(profileSource.StageGroups);
            StageGroupsService stageGroupsService = new StageGroupsService();
            foreach (StageGroup sg in stageGroupList)
            {
                List<Stage> stages = _ipsDataContext.Stages.Where(l => l.StageGroupId == sg.Id).ToList();
                foreach (Stage stage in stages)
                {
                    profileStages.Add(stage);
                }
            }
            foreach (Stage selectedStage in profileStages)
            {
                List<EvaluationParticipant> evaluationParticipants = _ipsDataContext.EvaluationParticipants.Where(x => x.StageGroupId == selectedStage.StageGroupId).ToList();
                ProspectingGoalInfo prospectingGoal = new ProspectingGoalInfo();
                foreach (EvaluationParticipant evaluationParticipant in evaluationParticipants)
                {
                    prospectingGoal = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.ProfileId == profileId && x.ParticipantId == evaluationParticipant.Id && x.GoalStartDate >= selectedStage.StartDateTime && x.GoalEndDate <= selectedStage.EndDateTime).FirstOrDefault();
                    if (prospectingGoal != null)
                    {
                        ProspectingGoalResultModel prospectingGoalResultModel = new ProspectingGoalResultModel();
                        List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                        prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id && x.ScheduleDate >= selectedStage.StartDateTime && x.ScheduleDate <= selectedStage.EndDateTime).ToList();

                        SkillsService _skillService = new SkillsService();
                        List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                        if (prospectingGoal.ProfileId.HasValue)
                        {
                            skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                        }
                        else
                        {
                            skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                        }

                        List<int> customerIds = prospectingCustomers.Select(x => x.Id).ToList();

                        foreach (IpsSkillDDL skill in skills)
                        {
                            int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                            int skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true).Count();
                            prospectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                            {
                                ProspectingGoalId = prospectingGoal.Id,
                                SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                                SkillName = skill.Name,
                                Goal = skillGoal,
                                Count = skillResultCount,
                                Result = skillResultCount > 0 ? ((skillResultCount * 100) / skillGoal) : 0,
                                SeqNo = skill.SeqNo,
                            });
                        }

                        prospectingGoalResultModel.Id = prospectingGoal.Id;
                        prospectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                        prospectingGoalResultModel.UserId = evaluationParticipant.UserId;
                        prospectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                        prospectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                        prospectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                        result.Add(prospectingGoalResultModel);



                        //int calledCount = prospectingCustomers.Where(x => x.IsCalled).Count();
                        //int talkedCount = prospectingCustomers.Where(x => x.IsTalked).Count();
                        //int meetingCount = prospectingCustomers.Where(x => x.IsMeeting).Count();

                        //result.Add(new ProspectingGoalInfoModel()
                        //{
                        //    CallGoal = prospectingGoal.CallGoal,
                        //    CallResult = Convert.ToInt32((calledCount * 100) / prospectingGoal.CallGoal),
                        //    GoalStartDate = prospectingGoal.GoalStartDate,
                        //    GoalEndDate = prospectingGoal.GoalEndDate,
                        //    Id = prospectingGoal.Id,
                        //    MeetingGoal = prospectingGoal.MeetingGoal,
                        //    MeetingResult = Convert.ToInt32((meetingCount * 100) / prospectingGoal.MeetingGoal),
                        //    ParticipantId = prospectingGoal.ParticipantId,
                        //    ProfileId = prospectingGoal.ProfileId,
                        //    TalkGoal = prospectingGoal.TalkGoal,
                        //    TalkResult = Convert.ToInt32((talkedCount * 100) / prospectingGoal.TalkGoal),
                        //    CallCount = calledCount,
                        //    TalkCount = talkedCount,
                        //    MeetingCount = meetingCount,
                        //    StageId = selectedStage.Id,
                        //    StageName = selectedStage.Name,
                        //    UserId = evaluationParticipant.UserId,
                        //});
                    }
                }


            }
            return result;
        }
        public List<UserSalesActivityResultDataModel> getUserSalesActivityData(int profileId, int userId)
        {
            List<UserSalesActivityResultDataModel> result = new List<UserSalesActivityResultDataModel>();
            List<Stage> profileStages = new List<Stage>();
            Profile profileSource = _ipsDataContext.Profiles.Include("StageGroups").Where(x => x.Id == profileId).FirstOrDefault();
            List<StageGroup> stageGroupList = new List<StageGroup>(profileSource.StageGroups);
            SkillsService _skillService = new SkillsService();
            List<IpsSkillDDL> skills = _skillService.getSkillsByProfileId(profileId).OrderBy(x => x.SeqNo).ToList();
            StageGroupsService stageGroupsService = new StageGroupsService();
            foreach (StageGroup sg in stageGroupList)
            {
                List<Stage> stages = _ipsDataContext.Stages.Where(l => l.StageGroupId == sg.Id).ToList();
                foreach (Stage stage in stages)
                {
                    profileStages.Add(stage);
                }
            }

            DateTime today = DateTime.Today;
            DateTime endOfDay = DateTime.Today.AddDays(1);
            foreach (Stage selectedStage in profileStages)
            {
                EvaluationParticipant evaluationParticipant = _ipsDataContext.EvaluationParticipants.Where(x => x.StageGroupId == selectedStage.StageGroupId && x.UserId == userId).FirstOrDefault();
                if (evaluationParticipant != null)
                {
                    List<ProspectingGoalInfo> prospectingGoalList = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.ProfileId == profileId && x.ParticipantId == evaluationParticipant.Id && x.GoalStartDate >= selectedStage.StartDateTime && x.GoalEndDate <= selectedStage.EndDateTime).ToList();
                    foreach (ProspectingGoalInfo prospectingGoalListItem in prospectingGoalList)
                    {
                        UserSalesActivityResultDataModel userProspectingResultModel = new UserSalesActivityResultDataModel();
                        if (evaluationParticipant != null)
                        {
                            List<ProspectingGoalActivityInfo> ProspectingGoalActivityInfoes = _ipsDataContext.ProspectingGoalActivityInfoes.Where(x => x.ProspectingGoalId == prospectingGoalListItem.Id).ToList();
                            foreach (ProspectingGoalActivityInfo prospectingGoalActivityInfo in ProspectingGoalActivityInfoes)
                            {
                                List<ProspectingActivity> prospectingActivities = _ipsDataContext.ProspectingActivities.Include("ExpiredProspectingActivityReasons").Where(x => x.ProspectingGoalActivityId == prospectingGoalActivityInfo.Id).ToList();
                                //userProspectingResultModel

                                foreach (ProspectingActivity prospectingActivy in prospectingActivities)
                                {
                                    userProspectingResultModel = new UserSalesActivityResultDataModel()
                                    {
                                        ActvitiyName = prospectingActivy.Name,
                                        ActvitiyStart = prospectingActivy.ActivityStart,
                                        ActvitiyEnd = prospectingActivy.ActivityEnd,
                                        GoalEndDate = prospectingGoalListItem.GoalEndDate,
                                        GoalStartDate = prospectingGoalListItem.GoalStartDate,
                                        ProspectingGoalId = prospectingGoalListItem.Id,
                                        ProspectingGoalName = prospectingGoalListItem.Name,
                                        UserStartTime = prospectingActivy.StartTime,
                                        UserStopTime = prospectingActivy.StopTime,
                                    };

                                    foreach (IpsSkillDDL skill in skills)
                                    {
                                        int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoalListItem.Id).Select(x => x.Goal).FirstOrDefault();
                                        int skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && x.ProspectingActivityId == prospectingActivy.Id && x.IsDone == true).Count();
                                        userProspectingResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                                        {
                                            ProspectingGoalId = prospectingGoalListItem.Id,
                                            SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                                            SkillName = skill.Name,
                                            Goal = skillGoal,
                                            Count = skillResultCount,
                                            Result = skillResultCount > 0 ? ((skillResultCount * 100) / skillGoal) : 0,
                                            SeqNo = skill.SeqNo,
                                        });
                                        if (!(skillResultCount > 0))
                                        {
                                            if (userProspectingResultModel.ActvitiyStart > endOfDay)
                                            {
                                                userProspectingResultModel.ActivityStatus = "Up-Coming";
                                            }
                                            else if (userProspectingResultModel.ActvitiyStart >= today && userProspectingResultModel.ActvitiyStart < endOfDay)
                                            {
                                                userProspectingResultModel.ActivityStatus = "Pending";
                                            }
                                            else if (userProspectingResultModel.ActvitiyEnd <= today)
                                            {
                                                userProspectingResultModel.ActivityStatus = "Expired";
                                            }
                                        }
                                        else
                                        {
                                            if (userProspectingResultModel.UserStopTime == null)
                                            {
                                                if (userProspectingResultModel.ActvitiyStart >= today && userProspectingResultModel.ActvitiyStart < endOfDay && userProspectingResultModel.UserStopTime == null)
                                                {
                                                    userProspectingResultModel.ActivityStatus = "Pending";
                                                }
                                            }
                                            else
                                            {
                                                userProspectingResultModel.ActivityStatus = "Completed";
                                            }
                                        }
                                        if (prospectingActivy.ExpiredProspectingActivityReasons.Count() > 0)
                                        {
                                            userProspectingResultModel.ExpiredActivityReason = prospectingActivy.ExpiredProspectingActivityReasons.Select(x => x.Reason).FirstOrDefault();
                                        }
                                    }
                                    result.Add(userProspectingResultModel);
                                }
                            }
                        }
                    }
                }
            }
            return result;
        }

        public List<int> GetProfileParticipants(int profileId, int userId)
        {
            var profile = _ipsDataContext.Profiles
                .Include("StageGroups")
                .Include("StageGroups.EvaluationParticipants")
                .FirstOrDefault(p => p.Id == profileId);

            var result = new List<int>();


            foreach (var stageGroup in profile.StageGroups)
            {
                var evaluationParticipants = stageGroup.EvaluationParticipants.Where(e => e.UserId == userId);

                var participants =
                    evaluationParticipants.Where(
                        _ => _.EvaluationRoleId == (int)EvaluationRoleEnum.Participant).ToList();

                foreach (var participant in participants)
                {
                    result.Add(participant.Id);
                }
            }

            return result;
        }

        public Project GetById(int id)
        {
            return _ipsDataContext.Projects.Include("Link_ProjectUsers").Include("ProjectGoals").Include("ProjectSteeringGroups").Include("ProjectGlobalSettings").Include("ProjectDefaultNotificationSettings").Where(_ => _.Id == id).FirstOrDefault();
        }
        public bool Delete(Project project)
        {
            bool result = false;
            using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
            {
                try
                {
                    if (project.Link_ProjectUsers.Count > 0)
                    {
                        _ipsDataContext.Link_ProjectUsers.RemoveRange(project.Link_ProjectUsers);
                    }
                    if (project.ProjectGoals.Count > 0)
                    {
                        _ipsDataContext.ProjectGoals.RemoveRange(project.ProjectGoals);
                    }
                    if (project.ProjectSteeringGroups.Count > 0)
                    {
                        _ipsDataContext.ProjectSteeringGroups.RemoveRange(project.ProjectSteeringGroups);
                    }
                    if (project.ProjectGlobalSettings.Count > 0)
                    {
                        _ipsDataContext.ProjectGlobalSettings.RemoveRange(project.ProjectGlobalSettings);
                    }
                    if (project.ProjectDefaultNotificationSettings.Count > 0)
                    {
                        _ipsDataContext.ProjectDefaultNotificationSettings.RemoveRange(project.ProjectDefaultNotificationSettings);
                    }
                    _ipsDataContext.Projects.Remove(project);
                    int deleted = _ipsDataContext.SaveChanges();
                    if (deleted > 0)
                    {
                        result = true;
                    }
                    dbContextTransaction.Commit();
                    return result;
                }
                catch (DbUpdateConcurrencyException ex)
                {
                    throw new DbUpdateConcurrencyException(ex.Message);
                }
                catch (Exception)
                {
                    dbContextTransaction.Rollback();

                    throw;
                }

            }
        }
        public int Update(Project project)
        {
            var result = -1;
            var source = _ipsDataContext.Projects.FirstOrDefault(_ => _.Id == project.Id);
            if (source != null)
            {
                project.ModifiedOn = DateTime.Now;
                project.ModifiedBy = _authService.GetCurrentUserId();
                _ipsDataContext.Entry(source).CurrentValues.SetValues(project);
                result = _ipsDataContext.SaveChanges();
            }
            return result;
        }

        public IpsProjectModel GetProjectById(int projectId)
        {
            IpsProjectModel projectModel = new IpsProjectModel();
            projectModel = _ipsDataContext.Projects.Where(_ => _.Id == projectId).
                Select(x => new IpsProjectModel()
                {
                    Id = x.Id,
                    ExpectedEndDate = x.ExpectedEndDate,
                    ExpectedStartDate = x.ExpectedStartDate,
                    IsActive = x.IsActive,
                    MissionStatement = x.MissionStatement,
                    Name = x.Name,
                    Summary = x.Summary,
                    VisionStatement = x.VisionStatement,
                    ProjectGoals = x.ProjectGoals.Select(pg => new IpsProjectGoalModel()
                    {
                        Goal = pg.Goal,
                        Strategy = pg.Strategy,
                        Id = pg.Id,
                    }).ToList(),
                    ProjectSteeringGroups = x.ProjectSteeringGroups.Select(sg => new IpsProjectSteeringGroupModel()
                    {
                        Id = sg.Id,
                        Name = sg.Name,
                        ProjectId = sg.ProjectId,
                        OrganizationId = sg.OrganizationId,
                        RoleId = sg.RoleId,
                        Users = sg.Link_ProjectUsers.Select(u => new IpsProjectUsersModel()
                        {
                            ProjectId = u.ProjectId,
                            RoleId = u.RoleId,
                            SteeringGroupId = u.SteeringGroupId,
                            UserId = u.UserId,
                            FirstName = u.User != null ? u.User.FirstName : "",
                            LastName = u.User != null ? u.User.LastName : "",
                            RoleName = u.User != null ? u.ProjectRole.Name : "",
                            UserImage = u.User != null ? u.User.ImagePath : "",
                            OrganizationId = u.User != null ? u.User.OrganizationId : null,
                            Email = u.User != null ? u.User.WorkEmail : null,
                            UserInfo = _ipsDataContext.Users.Where(usr => usr.Id == u.UserId).Select(usr => new IPSUserStatsModel
                            {
                                Id = x.Id,
                                BirthDate = usr.BirthDate,
                                City = usr.City,
                                Country = usr.Country,
                                Departments = usr.Departments1.Select(d => new IPSDepartment { Id = d.Id, Name = d.Name }).ToList(),
                                FirstName = usr.FirstName,
                                ImagePath = usr.ImagePath,
                                JobPositions = usr.JobPositions.Select(j => new IPSJobPosition { Id = j.Id, Name = j.JobPosition1 }).ToList(),
                                LastName = usr.LastName,
                                PrivateEmail = usr.PrivateEmail,
                                State = usr.State,
                                Facebook = usr.Facebook,
                                LinkedIn = usr.Linkedin,
                                Skype = usr.Skype,
                                Twitter = usr.Twitter
                            }).FirstOrDefault(),
                        }).ToList(),
                    }).ToList(),
                }).FirstOrDefault();

            ProjectGlobalSetting pgs = _ipsDataContext.ProjectGlobalSettings.Where(_ => _.ProjectId == projectId).FirstOrDefault();
            if (pgs != null)
            {
                string json = JsonConvert.SerializeObject(pgs);
                IpsProjectGlobalSettingModel newProjectGlobalSetting = JsonConvert.DeserializeObject<IpsProjectGlobalSettingModel>(json);
                projectModel.ProjectGlobalSettings.Add(newProjectGlobalSetting);
            }

            ProjectDefaultNotificationSetting projectDefaultNotificationSetting = _ipsDataContext.ProjectDefaultNotificationSettings.Where(_ => _.ProjectId == projectId).FirstOrDefault();
            if (projectDefaultNotificationSetting != null)
            {
                string json = JsonConvert.SerializeObject(projectDefaultNotificationSetting);
                IpsProjectDefaultNotificationSettingModel newProjectDefaultNotificationSetting = JsonConvert.DeserializeObject<IpsProjectDefaultNotificationSettingModel>(json);
                projectModel.ProjectDefaultNotificationSettings.Add(newProjectDefaultNotificationSetting);
            }
            return projectModel;
        }

        public IpsProjectModel GetProjectByProfileId(int profileId)
        {
            IpsProjectModel projectModel = null;
            Profile profile = _ipsDataContext.Profiles.Where(x => x.Id == profileId).FirstOrDefault();
            if (profile != null)
            {
                if (profile.ProjectId.HasValue)
                {

                    projectModel = _ipsDataContext.Projects.Where(_ => _.Id == profile.ProjectId.Value).
                        Select(x => new IpsProjectModel()
                        {
                            Id = x.Id,
                            ExpectedEndDate = x.ExpectedEndDate,
                            ExpectedStartDate = x.ExpectedStartDate,
                            IsActive = x.IsActive,
                            MissionStatement = x.MissionStatement,
                            Name = x.Name,
                            Summary = x.Summary,
                            VisionStatement = x.VisionStatement,
                            ProjectGoals = x.ProjectGoals.Select(pg => new IpsProjectGoalModel()
                            {
                                Goal = pg.Goal,
                                Strategy = pg.Strategy,
                                Id = pg.Id,
                            }).ToList(),
                            ProjectSteeringGroups = x.ProjectSteeringGroups.Select(sg => new IpsProjectSteeringGroupModel()
                            {
                                Id = sg.Id,
                                Name = sg.Name,
                                ProjectId = sg.ProjectId,
                                OrganizationId = sg.OrganizationId,
                                RoleId = sg.RoleId,
                                Users = sg.Link_ProjectUsers.Select(u => new IpsProjectUsersModel()
                                {
                                    ProjectId = u.ProjectId,
                                    RoleId = u.RoleId,
                                    SteeringGroupId = u.SteeringGroupId,
                                    UserId = u.UserId,
                                    FirstName = u.User != null ? u.User.FirstName : "",
                                    LastName = u.User != null ? u.User.LastName : "",
                                    RoleName = u.User != null ? u.ProjectRole.Name : "",
                                    UserImage = u.User != null ? u.User.ImagePath : "",
                                    OrganizationId = u.User != null ? u.User.OrganizationId : null,
                                    Email = u.User != null ? u.User.WorkEmail : null,
                                    UserInfo = _ipsDataContext.Users.Where(usr => usr.Id == u.UserId).Select(usr => new IPSUserStatsModel
                                    {
                                        Id = x.Id,
                                        BirthDate = usr.BirthDate,
                                        City = usr.City,
                                        Country = usr.Country,
                                        Departments = usr.Departments1.Select(d => new IPSDepartment { Id = d.Id, Name = d.Name }).ToList(),
                                        FirstName = usr.FirstName,
                                        ImagePath = usr.ImagePath,
                                        JobPositions = usr.JobPositions.Select(j => new IPSJobPosition { Id = j.Id, Name = j.JobPosition1 }).ToList(),
                                        LastName = usr.LastName,
                                        PrivateEmail = usr.PrivateEmail,
                                        State = usr.State,
                                        Facebook = usr.Facebook,
                                        LinkedIn = usr.Linkedin,
                                        Skype = usr.Skype,
                                        Twitter = usr.Twitter
                                    }).FirstOrDefault(),
                                }).ToList(),
                            }).ToList(),
                        }).FirstOrDefault();

                    ProjectGlobalSetting pgs = _ipsDataContext.ProjectGlobalSettings.Where(_ => _.ProjectId == profile.ProjectId.Value).FirstOrDefault();
                    if (pgs != null)
                    {
                        string json = JsonConvert.SerializeObject(pgs);
                        IpsProjectGlobalSettingModel newProjectGlobalSetting = JsonConvert.DeserializeObject<IpsProjectGlobalSettingModel>(json);
                        projectModel.ProjectGlobalSettings.Add(newProjectGlobalSetting);
                    }

                    ProjectDefaultNotificationSetting projectDefaultNotificationSetting = _ipsDataContext.ProjectDefaultNotificationSettings.Where(_ => _.ProjectId == profile.ProjectId.Value).FirstOrDefault();
                    if (projectDefaultNotificationSetting != null)
                    {
                        string json = JsonConvert.SerializeObject(projectDefaultNotificationSetting);
                        IpsProjectDefaultNotificationSettingModel newProjectDefaultNotificationSetting = JsonConvert.DeserializeObject<IpsProjectDefaultNotificationSettingModel>(json);
                        projectModel.ProjectDefaultNotificationSettings.Add(newProjectDefaultNotificationSetting);
                    }
                }
            }
            return projectModel;
        }


        public IPSUserStatsModel GetUserInfo(int userId)
        {
            return _ipsDataContext.Users.Where(u => u.Id == userId).Select(x => new IPSUserStatsModel
            {
                Id = x.Id,
                BirthDate = x.BirthDate,
                City = x.City,
                Country = x.Country,
                Departments = x.Departments1.Select(d => new IPSDepartment { Id = d.Id, Name = d.Name }).ToList(),
                FirstName = x.FirstName,
                ImagePath = x.ImagePath,
                JobPositions = x.JobPositions.Select(j => new IPSJobPosition { Id = j.Id, Name = j.JobPosition1 }).ToList(),
                LastName = x.LastName,
                PrivateEmail = x.PrivateEmail,
                State = x.State
            }).FirstOrDefault();

        }
        public IpsProjectModel Add(IpsProjectModel ipsProjectModel)
        {
            AuthService authService = new AuthService();
            int currentUserId = authService.GetCurrentUserId();

            Project project = new Project()
            {
                Id = ipsProjectModel.Id,
                ExpectedEndDate = ipsProjectModel.ExpectedEndDate,
                ExpectedStartDate = ipsProjectModel.ExpectedStartDate,
                IsActive = false,
                MissionStatement = ipsProjectModel.MissionStatement,
                Name = ipsProjectModel.Name,
                Summary = ipsProjectModel.Summary,
                VisionStatement = ipsProjectModel.VisionStatement,
                CreatedOn = DateTime.UtcNow,
                CreatedBy = currentUserId,
                ModifiedOn = DateTime.UtcNow,
                ModifiedBy = currentUserId,
                OrganizationId = authService.GetCurrentUserOrgId()
            };
            project.Link_ProjectUsers = new List<Link_ProjectUsers>();
            foreach (IpsProjectSteeringGroupModel projectSteeringGroup in ipsProjectModel.ProjectSteeringGroups)
            {
                if (projectSteeringGroup.Id < 0)
                {
                    projectSteeringGroup.Id = 0;
                }
                List<Link_ProjectUsers> usersList = new List<Link_ProjectUsers>();
                foreach (IpsProjectUsersModel projectUser in projectSteeringGroup.Users)
                {
                    usersList.Add(new Link_ProjectUsers()
                    {
                        RoleId = projectUser.RoleId,
                        UserId = projectUser.UserId,
                    });
                }
                project.ProjectSteeringGroups.Add(new ProjectSteeringGroup()
                {
                    ProjectId = ipsProjectModel.Id,
                    Id = projectSteeringGroup.Id,
                    Name = projectSteeringGroup.Name,
                    Link_ProjectUsers = usersList,
                });



            }

            foreach (IpsProjectGoalModel projectGoal in ipsProjectModel.ProjectGoals)
            {
                project.ProjectGoals.Add(new ProjectGoal()
                {
                    ProjectId = ipsProjectModel.Id,
                    Goal = projectGoal.Goal,
                    Strategy = projectGoal.Strategy
                });
            }

            foreach (IpsProjectGlobalSettingModel projectGlobalSetting in ipsProjectModel.ProjectGlobalSettings)
            {
                string json = Newtonsoft.Json.JsonConvert.SerializeObject(projectGlobalSetting);
                ProjectGlobalSetting newProjectGlobalSetting = Newtonsoft.Json.JsonConvert.DeserializeObject<ProjectGlobalSetting>(json);
                project.ProjectGlobalSettings.Add(newProjectGlobalSetting);
            }

            foreach (IpsProjectDefaultNotificationSettingModel projectDefaultNotificationSetting in ipsProjectModel.ProjectDefaultNotificationSettings)
            {
                string json = Newtonsoft.Json.JsonConvert.SerializeObject(projectDefaultNotificationSetting);
                ProjectDefaultNotificationSetting newProjectDefaultNotificationSetting = Newtonsoft.Json.JsonConvert.DeserializeObject<ProjectDefaultNotificationSetting>(json);
                newProjectDefaultNotificationSetting.CreatedOn = DateTime.Now;
                newProjectDefaultNotificationSetting.CreatedBy = _authService.GetCurrentUserId();
                project.ProjectDefaultNotificationSettings.Add(newProjectDefaultNotificationSetting);
            }

            _ipsDataContext.Projects.Add(project);

            _ipsDataContext.SaveChanges();

            //foreach(Link_ProjectUsers user in usersList)
            //{
            //    user.ProjectId = project.Id;

            //}
            ipsProjectModel.Id = project.Id;
            return ipsProjectModel;
        }

        public int Update(IpsProjectModel ipsProjectModel)
        {
            int result = 0;
            if (ipsProjectModel.Id > 0)
            {
                using (var dbContextTransaction = _ipsDataContext.Database.BeginTransaction())
                {
                    try
                    {
                        Project original = _ipsDataContext.Projects.Where(x => x.Id == ipsProjectModel.Id).FirstOrDefault();
                        if (original != null)
                        {

                            AuthService authService = new AuthService();
                            int currentUserId = authService.GetCurrentUserId();

                            Project project = new Project()
                            {
                                Id = ipsProjectModel.Id,
                                ExpectedEndDate = ipsProjectModel.ExpectedEndDate,
                                ExpectedStartDate = ipsProjectModel.ExpectedStartDate,
                                IsActive = original.IsActive,
                                MissionStatement = ipsProjectModel.MissionStatement,
                                Name = ipsProjectModel.Name,
                                Summary = ipsProjectModel.Summary,
                                VisionStatement = ipsProjectModel.VisionStatement,
                                CreatedBy = original.CreatedBy,
                                CreatedOn = original.CreatedOn,
                                ModifiedBy = currentUserId,
                                ModifiedOn = DateTime.UtcNow,
                                OrganizationId = original.OrganizationId,
                                StartedOn = original.StartedOn,
                            };
                            project.Link_ProjectUsers = new List<Link_ProjectUsers>();
                            foreach (IpsProjectSteeringGroupModel projectSteeringGroup in ipsProjectModel.ProjectSteeringGroups)
                            {

                                List<Link_ProjectUsers> usersList = new List<Link_ProjectUsers>();
                                foreach (IpsProjectUsersModel projectUser in projectSteeringGroup.Users)
                                {
                                    usersList.Add(new Link_ProjectUsers()
                                    {
                                        ProjectId = ipsProjectModel.Id,
                                        RoleId = projectUser.RoleId,
                                        UserId = projectUser.UserId,
                                    });
                                }
                                project.ProjectSteeringGroups.Add(new ProjectSteeringGroup()
                                {
                                    ProjectId = ipsProjectModel.Id,
                                    Id = projectSteeringGroup.Id,
                                    Name = projectSteeringGroup.Name,
                                    Link_ProjectUsers = usersList,
                                });



                            }

                            foreach (IpsProjectGoalModel projectGoal in ipsProjectModel.ProjectGoals)
                            {
                                project.ProjectGoals.Add(new ProjectGoal()
                                {
                                    ProjectId = ipsProjectModel.Id,
                                    Goal = projectGoal.Goal,
                                    Strategy = projectGoal.Strategy
                                });
                            }
                            original.ProjectSteeringGroups = _ipsDataContext.ProjectSteeringGroups.Where(x => x.ProjectId == ipsProjectModel.Id).ToList();
                            if (original.ProjectSteeringGroups.Count > 0)
                            {
                                _ipsDataContext.ProjectSteeringGroups.RemoveRange(original.ProjectSteeringGroups);
                            }
                            original.ProjectGoals = _ipsDataContext.ProjectGoals.Where(x => x.ProjectId == ipsProjectModel.Id).ToList();
                            if (original.ProjectGoals.Count > 0)
                            {
                                _ipsDataContext.ProjectGoals.RemoveRange(original.ProjectGoals);
                            }
                            _ipsDataContext.ProjectGoals.AddRange(project.ProjectGoals);

                            original.Link_ProjectUsers = _ipsDataContext.Link_ProjectUsers.Where(x => x.ProjectId == ipsProjectModel.Id).ToList();
                            if (original.Link_ProjectUsers.Count > 0)
                            {
                                _ipsDataContext.Link_ProjectUsers.RemoveRange(original.Link_ProjectUsers);
                            }
                            //_ipsDataContext.ProjectSteeringGroups.AddRange(project.ProjectSteeringGroups);



                            if (project.ProjectSteeringGroups.Count > 0)
                            {
                                foreach (ProjectSteeringGroup projectSteeringGroup in project.ProjectSteeringGroups)
                                {
                                    projectSteeringGroup.Id = 0;
                                    foreach (Link_ProjectUsers projectUsers in projectSteeringGroup.Link_ProjectUsers)
                                    {
                                        projectUsers.SteeringGroupId = 0;
                                    }
                                    _ipsDataContext.ProjectSteeringGroups.Add(projectSteeringGroup);
                                }
                            }

                            foreach (IpsProjectGlobalSettingModel projectGlobalSetting in ipsProjectModel.ProjectGlobalSettings)
                            {
                                string json = Newtonsoft.Json.JsonConvert.SerializeObject(projectGlobalSetting);
                                ProjectGlobalSetting newProjectGlobalSetting = Newtonsoft.Json.JsonConvert.DeserializeObject<ProjectGlobalSetting>(json);

                                ProjectGlobalSetting originalProjectGlobalSetting = _ipsDataContext.ProjectGlobalSettings.Where(x => x.ProjectId == project.Id).FirstOrDefault();
                                if (originalProjectGlobalSetting != null)
                                {
                                    _ipsDataContext.Entry(originalProjectGlobalSetting).CurrentValues.SetValues(newProjectGlobalSetting);
                                }
                                else
                                {
                                    newProjectGlobalSetting.ProjectId = project.Id;
                                    _ipsDataContext.ProjectGlobalSettings.Add(newProjectGlobalSetting);
                                }
                            }

                            foreach (IpsProjectDefaultNotificationSettingModel projectDefaultNotificationSetting in ipsProjectModel.ProjectDefaultNotificationSettings)
                            {
                                string json = Newtonsoft.Json.JsonConvert.SerializeObject(projectDefaultNotificationSetting);
                                ProjectDefaultNotificationSetting newProjectDefaultNotificationSetting = Newtonsoft.Json.JsonConvert.DeserializeObject<ProjectDefaultNotificationSetting>(json);

                                ProjectDefaultNotificationSetting originalProjectDefaultNotificationSetting = _ipsDataContext.ProjectDefaultNotificationSettings.Where(x => x.ProjectId == project.Id).FirstOrDefault();
                                if (originalProjectDefaultNotificationSetting != null)
                                {
                                    newProjectDefaultNotificationSetting.ModifiedBy = _authService.GetCurrentUserId();
                                    newProjectDefaultNotificationSetting.ModifiedOn = DateTime.Now;
                                    newProjectDefaultNotificationSetting.CreatedOn = originalProjectDefaultNotificationSetting.CreatedOn;
                                    newProjectDefaultNotificationSetting.CreatedBy = originalProjectDefaultNotificationSetting.CreatedBy;
                                    _ipsDataContext.Entry(originalProjectDefaultNotificationSetting).CurrentValues.SetValues(newProjectDefaultNotificationSetting);
                                }
                                else
                                {
                                    newProjectDefaultNotificationSetting.ProjectId = project.Id;
                                    newProjectDefaultNotificationSetting.CreatedBy = _authService.GetCurrentUserId();
                                    newProjectDefaultNotificationSetting.CreatedOn = DateTime.Now;
                                    _ipsDataContext.ProjectDefaultNotificationSettings.Add(newProjectDefaultNotificationSetting);
                                }
                            }


                            project.ProjectSteeringGroups.Clear();
                            project.ProjectGoals.Clear();
                            project.ModifiedOn = DateTime.Now;
                            project.ModifiedBy = _authService.GetCurrentUserId();
                            _ipsDataContext.Entry(original).CurrentValues.SetValues(project);
                            result = _ipsDataContext.SaveChanges();
                            dbContextTransaction.Commit();
                        }
                    }
                    catch (DbUpdateConcurrencyException ex)
                    {
                        throw new DbUpdateConcurrencyException(ex.Message);
                    }
                    catch (Exception)
                    {
                        dbContextTransaction.Rollback();

                        throw;
                    }
                }

            }
            return result;
        }

        public bool IsProjectInUse(int projectId)
        {
            bool result = false;
            List<Profile> projectProfiles = _ipsDataContext.Profiles
                .Include("PerformanceGroups")
                .Include("StageGroups.Stages")
                .Where(p => p.ProjectId == projectId)
                .ToList();

            foreach (Profile profile in projectProfiles)
            {
                bool isProfileInUse = IsProfileInUse(profile);
                if (isProfileInUse)
                {
                    result = isProfileInUse;
                    break;
                }
            }

            return result;
        }

        public bool IsProfileInUse(Profile profile)
        {
            if (profile != null)
            {
                List<StageGroup> stageGroups = profile.StageGroups.ToList();

                List<Stage> stages = new List<Stage>();
                foreach (StageGroup stageGroup in stageGroups)
                {
                    stages = stageGroup.Stages.Where(st => ((st.EndDateTime < DateTime.Today) || (st.StartDateTime < DateTime.Today && st.EndDateTime > DateTime.Today))).ToList();
                    if (stages.Count > 0)
                    {
                        //Active Stages Exist;
                        return true;
                    }
                    int[] stageIds = stageGroup.Stages.Select(s => s.Id).ToArray();

                    bool answersExist = _ipsDataContext.Answers.Any(a => stageIds.Contains((int)a.StageId));
                    if (answersExist)
                    {
                        return true;
                    }
                }
            }
            return false;
        }
        public bool StartProject(int projectId)
        {
            List<int> TotalProfileSend = new List<int>();
            ProfileService _profileService = new ProfileService();
            NotificationService _notificationService = new NotificationService();
            if (projectId > 0)
            {
                Project original = _ipsDataContext.Projects.Where(x => x.Id == projectId).FirstOrDefault();
                if (original != null)
                {
                    Project project = original;
                    project.IsActive = true;
                    project.StartedOn = DateTime.Now;
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(project);
                    _ipsDataContext.SaveChanges();

                    List<IpsProjectProfileModel> profiles = _profileService.GetProjectProfiles(projectId);
                    if (profiles.Count() > 0)
                    {
                        foreach (IpsProjectProfileModel projectProfileModel in profiles)
                        {
                            Profile profile = _profileService.getFullProfileById(projectProfileModel.Id);
                            if (profile != null)
                            {
                                foreach (StageGroup stageGroup in profile.StageGroups)
                                {
                                    Stage startStage = stageGroup.Stages.OrderBy(x => x.StartDateTime).FirstOrDefault();
                                    if (startStage != null)
                                    {
                                        _notificationService.SendStartNewStageNotification(startStage.Id, null, false);
                                        TotalProfileSend.Add(startStage.Id);
                                        //SendStartNewStageNotification(int? stageId, int? stageEvolutionId, bool toNotInvitedOnly)                                        
                                    }
                                }

                            }
                        }
                    }

                    if (TotalProfileSend.Count() == profiles.Count())
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        public bool IsProjectActive(int projectId)
        {
            bool result = false;
            Project project = _ipsDataContext.Projects
                .Where(p => p.Id == projectId)
                .FirstOrDefault();
            if (project != null)
            {
                return project.IsActive;
            }
            return result;
        }

        public bool SendStageParticipantReminder(int stageId, int participantId)
        {
            bool result = false;
            NotificationService _notificationService = new NotificationService();
            StagesService stageService = new StagesService();
            Stage stage = stageService.Get().Where(s => s.Id == stageId).FirstOrDefault();
            int? userTemplateId = stage.GreenAlarmParticipantTemplateId;
            _notificationService.SendParticipantNotificationTemplatesOfStage(stageId, null, userTemplateId, null, participantId);
            result = true;
            return result;
        }

        public bool SendStageEvaluationReminder(int stageId, int evaluatorId)
        {
            bool result = false;
            NotificationService _notificationService = new NotificationService();
            StagesService stageService = new StagesService();
            Stage stage = stageService.Get().Where(s => s.Id == stageId).FirstOrDefault();
            int? evaluatorTemplateId = stage.GreenAlarmEvaluatorTemplateId;
            _notificationService.SendParticipantNotificationTemplatesOfStage(stageId, null, null, evaluatorTemplateId, evaluatorId);
            result = true;
            return result;
        }


        public IpsUserProjects GetProjectsbyUserId(int userId)
        {
            IpsUserProjects result = new IpsUserProjects();
            DateTime todayDate = DateTime.Today;

            List<IpsUserProjectListModel> list = new List<IpsUserProjectListModel>();

            PerformanceService performanceService = new PerformanceService();


            List<Project> allProjects = _ipsDataContext.Projects.Include("ProjectGoals").Include("Link_ProjectUsers").ToList();
            foreach (Project project in allProjects)
            {

                if (project.Link_ProjectUsers.Any(x => x.UserId == userId))
                {
                    int roleId = project.Link_ProjectUsers.Where(x => x.UserId == userId).Select(x => x.RoleId).FirstOrDefault();

                    list.Add(new IpsUserProjectListModel()
                    {
                        ExpectedEndDate = project.ExpectedEndDate,
                        ExpectedStartDate = project.ExpectedStartDate,
                        Id = project.Id,
                        IsActive = project.IsActive,
                        MissionStatement = project.MissionStatement,
                        Name = project.Name,
                        Summary = project.Summary,
                        VisionStatement = project.VisionStatement,
                        GoalStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == project.Id).Select(y => y.Goal).ToList(),
                        StratagiesStatement = _ipsDataContext.ProjectGoals.Where(p => p.ProjectId == project.Id).Select(y => y.Strategy).ToList(),
                        ProjectRoleId = roleId,
                        ProjectRoleName = _ipsDataContext.ProjectRoles.Where(x => x.Id == roleId).Select(x => x.Name).FirstOrDefault(),
                        Link_ProjectUsers = project.Link_ProjectUsers.ToList(),
                    });
                }
                else
                {
                    if (project.CreatedBy == userId)
                    {

                    }

                }
            }
            foreach (IpsUserProjectListModel project in list)
            {

                if (project.IsActive)
                {
                    bool isManager = project.Link_ProjectUsers.Any(x => x.UserId == userId && x.RoleId == 1);
                    if (isManager)
                    {
                        foreach (Link_ProjectUsers projectUser in project.Link_ProjectUsers)
                        {
                            if (projectUser.RoleId == 4)
                            {
                                IpsUserProfiles userProfiles = performanceService.GetUserProfilesByProjectProfile(projectUser.UserId, project.Id, null);
                                if (userProfiles != null)
                                {
                                    List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
                                    expiredProfiles = userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList();
                                    List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
                                    if (expiredStageGroupIds.Count() > 0)
                                    {
                                        foreach (IpsUserProfile profile in userProfiles.ActiveProfiles)
                                        {
                                            if (profile.IsExpired == false && profile.PreviousStage == true)
                                            {
                                                if (expiredStageGroupIds.Contains(profile.Stage.StageGroupId))
                                                {
                                                    profile.IsExpired = true;
                                                    profile.IsBlocked = true;
                                                }
                                            }
                                        }
                                    }

                                    project.ActiveProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == false).ToList());
                                    project.ExpiredProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList());
                                    project.CompletedProfiles.AddRange(userProfiles.CompletedProfiles.ToList());
                                    project.HistoryProfiles.AddRange(userProfiles.History.ToList());
                                }

                            }

                        }
                        if (project.ActiveProfiles.Count() > 0)
                        {
                            // active or completed
                            result.ActiveProjects.Add(project);
                        }
                        else if (project.ActiveProfiles.Count() == 0 && project.ExpiredProfiles.Count() > 0)
                        {
                            // active or completed
                            if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                            {
                                result.ActiveProjects.Add(project);
                            }
                            else
                            {
                                result.ExpiredProjects.Add(project);
                            }
                        }
                        else if (project.CompletedProfiles.Count() > 0)
                        {
                            // active or completed
                            if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                            {
                                result.ActiveProjects.Add(project);
                            }
                            else
                            {
                                result.CompletedProjects.Add(project);
                            }
                        }
                        else if (project.HistoryProfiles.Count() > 0)
                        {
                            if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                            {
                                result.ActiveProjects.Add(project);
                            }
                            else
                            {
                                result.HistoryProjects.Add(project);
                            }
                        }
                        else
                        {
                            // active or completed
                            if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                            {
                                result.ActiveProjects.Add(project);
                            }
                            else
                            {
                                result.PendingProjects.Add(project);
                            }
                        }
                    }
                    else
                    {
                        IpsUserProfiles userProfiles = performanceService.GetUserProfilesByProjectProfile(userId, project.Id, null);
                        if (userProfiles != null)
                        {
                            List<IpsUserProfile> expiredProfiles = new List<IpsUserProfile>();
                            expiredProfiles = userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList();
                            List<int> expiredStageGroupIds = expiredProfiles.Select(x => x.Stage.StageGroupId).ToList();
                            if (expiredStageGroupIds.Count() > 0)
                            {
                                foreach (IpsUserProfile profile in userProfiles.ActiveProfiles)
                                {
                                    if (profile.IsExpired == false && profile.PreviousStage == true)
                                    {
                                        if (expiredStageGroupIds.Contains(profile.Stage.StageGroupId))
                                        {
                                            profile.IsExpired = true;
                                            profile.IsBlocked = true;
                                        }
                                    }
                                }
                            }

                            project.ActiveProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == false).ToList());
                            project.ExpiredProfiles.AddRange(userProfiles.ActiveProfiles.Where(x => x.IsExpired == true).ToList());
                            project.CompletedProfiles.AddRange(userProfiles.CompletedProfiles.ToList());
                            project.HistoryProfiles.AddRange(userProfiles.History.ToList());

                            if (project.ActiveProfiles.Count() > 0)
                            {
                                // active or completed
                                result.ActiveProjects.Add(project);
                            }
                            else if (project.ActiveProfiles.Count() == 0 && project.ExpiredProfiles.Count() > 0)
                            {
                                // active or completed
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.ExpiredProjects.Add(project);
                                }
                            }
                            else if (project.CompletedProfiles.Count() > 0)
                            {
                                // active or completed
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.CompletedProjects.Add(project);
                                }
                            }
                            else if (project.HistoryProfiles.Count() > 0)
                            {
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.HistoryProjects.Add(project);
                                }
                            }
                            else
                            {
                                // active or pending
                                if (project.ExpectedStartDate <= todayDate && project.ExpectedEndDate > todayDate)
                                {
                                    result.ActiveProjects.Add(project);
                                }
                                else
                                {
                                    result.PendingProjects.Add(project);
                                }
                            }
                        }


                    }



                }
                else
                {
                    // active or completed
                    result.PendingProjects.Add(project);
                }
            }
            return result;
        }


        public List<ProspectingGoalResultModel> getUserAggregatedSalesActivityData(int profileId, int userId)
        {
            List<ProspectingGoalResultModel> result = new List<ProspectingGoalResultModel>();
            List<Stage> profileStages = new List<Stage>();
            Profile profileSource = _ipsDataContext.Profiles.Include("StageGroups").Where(x => x.Id == profileId).FirstOrDefault();
            List<StageGroup> stageGroupList = new List<StageGroup>(profileSource.StageGroups);
            StageGroupsService stageGroupsService = new StageGroupsService();
            foreach (StageGroup sg in stageGroupList)
            {
                List<Stage> stages = _ipsDataContext.Stages.Where(l => l.StageGroupId == sg.Id).ToList();
                foreach (Stage stage in stages)
                {
                    profileStages.Add(stage);
                }
            }
            foreach (Stage selectedStage in profileStages)
            {
                List<EvaluationParticipant> evaluationParticipants = _ipsDataContext.EvaluationParticipants.Where(x => x.StageGroupId == selectedStage.StageGroupId && x.UserId == userId).ToList();
                ProspectingGoalInfo prospectingGoal = new ProspectingGoalInfo();
                foreach (EvaluationParticipant evaluationParticipant in evaluationParticipants)
                {
                    prospectingGoal = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.ProfileId == profileId && x.ParticipantId == evaluationParticipant.Id && x.GoalStartDate >= selectedStage.StartDateTime && x.GoalEndDate <= selectedStage.EndDateTime).FirstOrDefault();
                    if (prospectingGoal != null)
                    {
                        ProspectingGoalResultModel prospectingGoalResultModel = new ProspectingGoalResultModel();
                        List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                        prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id && x.ScheduleDate >= selectedStage.StartDateTime && x.ScheduleDate <= selectedStage.EndDateTime).ToList();

                        SkillsService _skillService = new SkillsService();
                        List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                        if (prospectingGoal.ProfileId.HasValue)
                        {
                            skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                        }
                        else
                        {
                            skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                        }

                        List<int> customerIds = prospectingCustomers.Select(x => x.Id).ToList();

                        foreach (IpsSkillDDL skill in skills)
                        {
                            int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                            int skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true).Count();
                            prospectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                            {
                                ProspectingGoalId = prospectingGoal.Id,
                                SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                                SkillName = skill.Name,
                                Goal = skillGoal,
                                Count = skillResultCount,
                                Result = skillResultCount > 0 ? ((skillResultCount * 100) / skillGoal) : 0,
                                SeqNo = skill.SeqNo,
                            });
                        }

                        prospectingGoalResultModel.Id = prospectingGoal.Id;
                        prospectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                        prospectingGoalResultModel.UserId = evaluationParticipant.UserId;
                        prospectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                        prospectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                        prospectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                        result.Add(prospectingGoalResultModel);
                    }
                }


            }
            return result;
        }



        public List<ProspectingSkillResultModel> getProspectingSkillResultByGoalId(int prospectingGoalId, int skillId)
        {
            List<ProspectingSkillResultModel> result = new List<ProspectingSkillResultModel>();
            ProspectingGoalInfo prospectingGoal = new ProspectingGoalInfo();
            prospectingGoal = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.Id == prospectingGoalId).FirstOrDefault();
            if (prospectingGoal != null)
            {

                List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();

                SkillsService _skillService = new SkillsService();
                List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                if (prospectingGoal.ProfileId.HasValue)
                {
                    skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                }
                else 
                {
                    skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                }

                List<int> customerIds = prospectingCustomers.Select(x => x.Id).ToList();


                List<ProspectingCustomerResult> skillResults = _ipsDataContext.ProspectingCustomerResults.Include("ProspectingCustomer").Where(x => x.SkillId == skillId && customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true).ToList();
                foreach (ProspectingCustomerResult prospectingCustomerResult in skillResults)
                {
                    ProspectingSkillResultModel prospectingSkillResultModel = new ProspectingSkillResultModel()
                    {
                        CustomerInterestRate = prospectingCustomerResult.CustomerInterestRate,
                        Description = prospectingCustomerResult.Description,
                        Id = prospectingCustomerResult.Id,
                        Duration = prospectingCustomerResult.Duration,
                        IsDone = prospectingCustomerResult.IsDone,
                        IsFollowUp = prospectingCustomerResult.IsFollowUp,
                        IsMeeting = prospectingCustomerResult.IsMeeting,
                        IsNoMeeting = prospectingCustomerResult.IsNoMeeting,
                        ProspectingActivityId = prospectingCustomerResult.ProspectingActivityId,
                        Reason = prospectingCustomerResult.Reason,
                        SkillId = prospectingCustomerResult.SkillId,
                        ProspectingCustomerId = prospectingCustomerResult.ProspectingCustomerId,
                        ProspectingCustomer = prospectingCustomerResult.ProspectingCustomer,
                    };
                    if (prospectingCustomerResult.IsMeeting || prospectingCustomerResult.IsFollowUp)
                    {
                        int? taskId = _ipsDataContext.ProspectingSchedules.Where(x => x.ProspectingCustomerResultId == prospectingCustomerResult.Id).Select(x => x.TaskId).FirstOrDefault();
                        if (taskId.HasValue)
                        {
                            prospectingSkillResultModel.ScheduleTime = _ipsDataContext.Tasks.Where(x => x.Id == taskId).Select(x => x.StartDate).FirstOrDefault();
                        }
                        else
                        {
                            if (prospectingCustomerResult.IsMeeting)
                            {
                                int? currentSeqNo = skills.Where(x => x.Id == skillId).Select(x => x.SeqNo).FirstOrDefault();
                                if (currentSeqNo.HasValue)
                                {
                                    int? nextSkillId = skills.Where(x => x.SeqNo == currentSeqNo.Value + 1).Select(x => x.Id).FirstOrDefault();
                                    ProspectingCustomerResult nextSkillResult = _ipsDataContext.ProspectingCustomerResults.Include("ProspectingCustomer").Where(x => x.SkillId == nextSkillId && x.ProspectingCustomerId == prospectingSkillResultModel.ProspectingCustomerId && x.IsDone == true).FirstOrDefault();
                                    if (nextSkillResult != null)
                                    {
                                        int? nextTaskId = _ipsDataContext.ProspectingSchedules.Where(x => x.ProspectingCustomerResultId == nextSkillResult.Id).Select(x => x.TaskId).FirstOrDefault();
                                        if (nextTaskId.HasValue)
                                        {
                                            prospectingSkillResultModel.ScheduleTime = _ipsDataContext.Tasks.Where(x => x.Id == nextTaskId).Select(x => x.StartDate).FirstOrDefault();
                                        }
                                    }
                                }

                            }
                        }
                    }
                    result.Add(prospectingSkillResultModel);
                }
            }
            return result;
        }

        public List<Link_ProjectUsers> getProjectMembers(int projectId)
        {
            List<Link_ProjectUsers> result = new List<Link_ProjectUsers>();
            Project project = _ipsDataContext.Projects.Include("ProjectGoals").Include("Link_ProjectUsers.User").Where(x => x.Id == projectId).FirstOrDefault();
            result = project.Link_ProjectUsers.ToList();
            return result;
        }

        public List<Link_ProjectUsers> getTaskProspectingProjectMembers(int projectId)
        {
            List<Link_ProjectUsers> result = new List<Link_ProjectUsers>();
            Project project = _ipsDataContext.Projects.Include("ProjectGoals").Include("Link_ProjectUsers.User").Where(x => x.Id == projectId).FirstOrDefault();
            List<Task> projectTasks = _ipsDataContext.Tasks.Where(x => x.ProjectId == projectId && (x.TaskCategoryListItem.Name.ToLower() == "sales prospecting" || x.TaskCategoryListItem.Name.ToLower() == "prospecting")).ToList();
            result = project.Link_ProjectUsers.ToList();
            List<int> assignedUsers = projectTasks.Select(x => x.AssignedToId.HasValue ? x.AssignedToId.Value : 0).ToList();
            result = result.Where(x => assignedUsers.Contains(x.UserId)).ToList();
            return result;
        }
        public List<Link_ProjectUsers> getServiceProspectingProjectMembers(int projectId)
        {
            List<Link_ProjectUsers> result = new List<Link_ProjectUsers>();
            Project project = _ipsDataContext.Projects.Include("ProjectGoals").Include("Link_ProjectUsers.User").Where(x => x.Id == projectId).FirstOrDefault();
            List<Task> projectTasks = _ipsDataContext.Tasks.Where(x => x.ProjectId == projectId && x.TaskCategoryListItem.Name.ToLower() == "service prospecting").ToList();
            result = project.Link_ProjectUsers.ToList();
            List<int> assignedUsers = projectTasks.Select(x => x.AssignedToId.HasValue ? x.AssignedToId.Value : 0).ToList();
            result = result.Where(x => assignedUsers.Contains(x.UserId)).ToList();
            return result;
        }

        public List<IpsProjectTaskModel> GetProjectTask(int projectId)
        {
            List<IpsProjectTaskModel> result = new List<IpsProjectTaskModel>();
            result = _ipsDataContext.Tasks.Where(x => x.ProjectId == projectId).Select(x => new IpsProjectTaskModel()
            {
                AssignedToUserId = x.AssignedToId,
                Id = x.Id,
                ProjetId = x.ProjectId,
                Title = x.Title,
            }).ToList();
            return result;
        }

        public List<ProspectingGoalResultModel> getProjectTaskAggregatedActivityData(int projectId)
        {
            List<ProspectingGoalResultModel> result = new List<ProspectingGoalResultModel>();
            if (projectId > 0)
            {
                List<IpsProjectTaskModel> projectTasks = new List<IpsProjectTaskModel>();
                projectTasks = _ipsDataContext.Tasks.Where(x => x.ProjectId == projectId).Select(x => new IpsProjectTaskModel()
                {
                    AssignedToUserId = x.AssignedToId,
                    Id = x.Id,
                    ProjetId = x.ProjectId,
                    Title = x.Title,
                }).ToList();
                List<int> taskIds = projectTasks.Select(x => x.Id).ToList();
                if (projectTasks.Count() > 0)
                {
                    List<ProspectingGoalInfo> prospectingGoals = new List<ProspectingGoalInfo>();
                    prospectingGoals = _ipsDataContext.ProspectingGoalInfoes.Where(x => taskIds.Contains(x.TaskId.HasValue ? x.TaskId.Value : 0)).ToList();
                    foreach (ProspectingGoalInfo prospectingGoal in prospectingGoals)
                    {
                        if (prospectingGoal != null)
                        {
                            ProspectingGoalResultModel prospectingGoalResultModel = new ProspectingGoalResultModel();
                            List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                            prospectingCustomers = _ipsDataContext.ProspectingCustomers.Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();

                            SkillsService _skillService = new SkillsService();
                            List<IpsSkillDDL> skills = new List<IpsSkillDDL>();
                            if (prospectingGoal.ProfileId.HasValue)
                            {
                                skills = _skillService.getSkillsByProfileId(prospectingGoal.ProfileId.Value).OrderBy(x => x.SeqNo).ToList();
                            }
                            else 
                            {
                                skills = _skillService.getSkillsByProspectingGoalId(prospectingGoal.Id).OrderBy(x => x.SeqNo).ToList();
                            }

                            List<int> customerIds = prospectingCustomers.Select(x => x.Id).ToList();

                            foreach (IpsSkillDDL skill in skills)
                            {
                                int skillGoal = _ipsDataContext.ProspectingSkillGoals.Where(x => x.SkillId == skill.Id && x.ProspectingGoalId == prospectingGoal.Id).Select(x => x.Goal).FirstOrDefault();
                                int skillResultCount = 0;
                                skillResultCount = _ipsDataContext.ProspectingCustomerResults.Where(x => x.SkillId == skill.Id && customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true).Count();
                                prospectingGoalResultModel.ProspectingSkillGoalResults.Add(new ProspectingSkillGoalResultModel()
                                {

                                    ProspectingGoalId = prospectingGoal.Id,
                                    SkillId = skill.Id.HasValue ? skill.Id.Value : 0,
                                    SkillName = skill.Name,
                                    Goal = skillGoal,
                                    Count = skillResultCount,
                                    Result = skillResultCount > 0 ? ((skillResultCount * 100) / skillGoal) : 0,
                                    SeqNo = skill.SeqNo,
                                });
                            }

                            prospectingGoalResultModel.Id = prospectingGoal.Id;
                            prospectingGoalResultModel.ProspectingName = prospectingGoal.Name;
                            prospectingGoalResultModel.ParticipantId = prospectingGoal.ParticipantId;
                            prospectingGoalResultModel.UserId = prospectingGoal.UserId.HasValue ? prospectingGoal.UserId.Value : 0;
                            prospectingGoalResultModel.ProfileId = prospectingGoal.ProfileId;
                            prospectingGoalResultModel.GoalStartDate = prospectingGoal.GoalStartDate;
                            prospectingGoalResultModel.GoalEndDate = prospectingGoal.GoalEndDate;
                            result.Add(prospectingGoalResultModel);
                        }
                    }
                    return result;
                }
            }
            return result;
        }

        public List<ProspectingFollowupCustomerModel> getProjectFollowupCustomers(int projectId)
        {
            List<ProspectingFollowupCustomerModel> customers = new List<ProspectingFollowupCustomerModel>();
            if (projectId > 0)
            {
                List<IpsProjectTaskModel> projectTasks = new List<IpsProjectTaskModel>();
                projectTasks = _ipsDataContext.Tasks.Where(x => x.ProjectId == projectId).Select(x => new IpsProjectTaskModel()
                {
                    AssignedToUserId = x.AssignedToId,
                    Id = x.Id,
                    ProjetId = x.ProjectId,
                    Title = x.Title,
                }).ToList();
                List<int> taskIds = projectTasks.Select(x => x.Id).ToList();
                if (projectTasks.Count() > 0)
                {
                    List<ProspectingGoalInfo> prospectingGoals = new List<ProspectingGoalInfo>();
                    prospectingGoals = _ipsDataContext.ProspectingGoalInfoes.Where(x => taskIds.Contains(x.TaskId.HasValue ? x.TaskId.Value : 0)).ToList();
                    foreach (ProspectingGoalInfo prospectingGoal in prospectingGoals)
                    {
                        if (prospectingGoal != null)
                        {
                            List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                            prospectingCustomers = _ipsDataContext.ProspectingCustomers.Include("ProspectingGoalInfo")
                                .Include("CustomerSalesData")
                                .Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();


                            List<int> customerIds = prospectingCustomers.Select(x => x.Id).ToList();

                            List<int> followupCustomers = new List<int>();
                            followupCustomers = _ipsDataContext.ProspectingCustomerResults.Where(x => customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.IsFollowUp == true).Select(x => x.ProspectingCustomerId).ToList();
                            List<int> meetingCustomers = new List<int>();
                            meetingCustomers = _ipsDataContext.ProspectingCustomerResults.Where(x => customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.IsMeeting == true).Select(x => x.ProspectingCustomerId).ToList();

                            List<int> notInterestedCustomers = new List<int>();
                            notInterestedCustomers = _ipsDataContext.ProspectingCustomerResults.Where(x => customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.IsNoMeeting == true).Select(x => x.ProspectingCustomerId).ToList();


                            followupCustomers = followupCustomers.Where(x => meetingCustomers.IndexOf(x) < 0 && notInterestedCustomers.IndexOf(x) < 0).ToList();

                            List<ProspectingFollowupCustomerModel> filteredCustomers = prospectingCustomers.Where(x => followupCustomers.Contains(x.Id)).Select(x => new ProspectingFollowupCustomerModel()
                            {
                                Detail = x.Detail,
                                Id = x.Id,
                                Name = x.Name,
                                Phone = x.Phone,
                                GoalName = x.ProspectingGoalInfo.Name,
                                ProspectingGoalUserId = x.ProspectingGoalInfo.UserId,
                                ProspectingGoalId = x.ProspectingGoalId,
                                ScheduleDate = x.ScheduleDate,
                                CustomerId = x.CustomerId,
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
                            if (filteredCustomers.Count > 0)
                            {
                                foreach (ProspectingFollowupCustomerModel customerInfo in filteredCustomers)
                                {
                                    ProspectingSchedule prospectingSchedule = _ipsDataContext.ProspectingSchedules.Include("ProspectingCustomerResult").Where(x => x.ProspectingCustomerId == customerInfo.Id && x.IsFollowUp == true).OrderByDescending(x => x.CreatedOn).FirstOrDefault();
                                    if (prospectingSchedule != null)
                                    {
                                        customerInfo.ActivityId = prospectingSchedule.ProspectingActivityId;
                                        customerInfo.FollowUpReason = prospectingSchedule.ProspectingCustomerResult != null ? prospectingSchedule.ProspectingCustomerResult.Reason : null;
                                        customerInfo.FollowUpScheduleDate = prospectingSchedule.ScheduleDate;
                                    }
                                }
                                customers.AddRange(filteredCustomers);
                            }
                        }
                    }
                }
            }
            else
            {
                List<ProspectingGoalInfo> prospectingGoals = new List<ProspectingGoalInfo>();
                prospectingGoals = _ipsDataContext.ProspectingGoalInfoes.ToList();
                List<int> taskIds = prospectingGoals.Where(x=>x.TaskId.HasValue == true).Select(x => x.TaskId.Value).ToList();
                List<IpsProjectTaskModel> withoutProjectTasks = new List<IpsProjectTaskModel>();
                List<int> withoutProjectTaskIds = _ipsDataContext.Tasks.Where(x => taskIds.Contains(x.Id) && (x.ProjectId == null || x.ProjectId == 0)).Select(x => x.Id).ToList();
                prospectingGoals = prospectingGoals.Where(x => withoutProjectTaskIds.Contains(x.TaskId.HasValue ? x.TaskId.Value : 0) || x.TaskId.HasValue == false).ToList();

                foreach (ProspectingGoalInfo prospectingGoal in prospectingGoals)
                {
                    if (prospectingGoal != null)
                    {
                        List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                        prospectingCustomers = _ipsDataContext.ProspectingCustomers.Include("ProspectingGoalInfo")
                            .Include("CustomerSalesData")
                            .Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();


                        List<int> customerIds = prospectingCustomers.Select(x => x.Id).ToList();

                        List<int> followupCustomers = new List<int>(); ;
                        followupCustomers = _ipsDataContext.ProspectingCustomerResults.Where(x => customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.IsFollowUp == true).Select(x => x.ProspectingCustomerId).ToList();

                        List<int> meetingCustomers = new List<int>();
                        meetingCustomers = _ipsDataContext.ProspectingCustomerResults.Where(x => customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.IsMeeting == true).Select(x => x.ProspectingCustomerId).ToList();

                        List<int> notInterestedCustomers = new List<int>();
                        notInterestedCustomers = _ipsDataContext.ProspectingCustomerResults.Where(x => customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.IsNoMeeting == true).Select(x => x.ProspectingCustomerId).ToList();

                        followupCustomers = followupCustomers.Where(x => meetingCustomers.IndexOf(x) < 0 && notInterestedCustomers.IndexOf(x) < 0).ToList();

                        List<ProspectingFollowupCustomerModel> filteredCustomers = prospectingCustomers.Where(x => followupCustomers.Contains(x.Id)).Select(x => new ProspectingFollowupCustomerModel()
                        {
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
                        if (filteredCustomers.Count > 0)
                        {
                            foreach (ProspectingFollowupCustomerModel customerInfo in filteredCustomers)
                            {
                                ProspectingSchedule prospectingSchedule = _ipsDataContext.ProspectingSchedules.Include("ProspectingCustomerResult").Where(x => x.ProspectingCustomerId == customerInfo.Id && x.IsFollowUp == true).FirstOrDefault();
                                if (prospectingSchedule != null)
                                {
                                    customerInfo.ActivityId = prospectingSchedule.ProspectingActivityId;
                                    customerInfo.FollowUpReason = prospectingSchedule.ProspectingCustomerResult != null ? prospectingSchedule.ProspectingCustomerResult.Reason : null;
                                    customerInfo.FollowUpScheduleDate = prospectingSchedule.ScheduleDate;
                                }
                            }
                            customers.AddRange(filteredCustomers);
                        }
                    }
                }

            }
            return customers;
        }
        public List<ProspectingCustomerModel> GetProjectCustomers(int projectId)
        {
            List<ProspectingCustomerModel> customers = new List<ProspectingCustomerModel>();
            if (projectId > 0)
            {
                List<IpsProjectTaskModel> projectTasks = new List<IpsProjectTaskModel>();
                projectTasks = _ipsDataContext.Tasks.Where(x => x.ProjectId == projectId).Select(x => new IpsProjectTaskModel()
                {
                    AssignedToUserId = x.AssignedToId,
                    Id = x.Id,
                    ProjetId = x.ProjectId,
                    Title = x.Title,
                }).ToList();
                List<int> taskIds = projectTasks.Select(x => x.Id).ToList();
                if (projectTasks.Count() > 0)
                {
                    List<ProspectingGoalInfo> prospectingGoals = new List<ProspectingGoalInfo>();
                    prospectingGoals = _ipsDataContext.ProspectingGoalInfoes.Where(x => taskIds.Contains(x.TaskId.HasValue ? x.TaskId.Value : 0)).ToList();
                    foreach (ProspectingGoalInfo prospectingGoal in prospectingGoals)
                    {
                        if (prospectingGoal != null)
                        {
                            List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                            prospectingCustomers = _ipsDataContext.ProspectingCustomers.Include("ProspectingGoalInfo")
                                .Include("CustomerSalesData")
                                .Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();


                            List<int> customerIds = prospectingCustomers.Select(x => x.Id).ToList();

                            List<int> meeetingCustomers = new List<int>(); ;
                            meeetingCustomers = _ipsDataContext.ProspectingCustomerResults.Where(x => customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.IsMeeting == true).Select(x => x.ProspectingCustomerId).ToList();


                            List<ProspectingCustomerModel> filteredCustomers = prospectingCustomers.Where(x => meeetingCustomers.Contains(x.Id)).Select(x => new ProspectingCustomerModel()
                            {
                                Detail = x.Detail,
                                Id = x.Id,
                                Name = x.Name,
                                Phone = x.Phone,
                                GoalName = x.ProspectingGoalInfo.Name,
                                ProspectingGoalUserId = x.ProspectingGoalInfo.UserId,
                                ProspectingGoalId = x.ProspectingGoalId,
                                ScheduleDate = x.ScheduleDate,
                                CustomerId = x.CustomerId,
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
                            if (filteredCustomers.Count > 0)
                            {
                                foreach (ProspectingCustomerModel customerInfo in filteredCustomers)
                                {
                                    ProspectingSchedule prospectingSchedule = _ipsDataContext.ProspectingSchedules.Where(x => x.ProspectingCustomerId == customerInfo.Id && x.IsMeeting == true).FirstOrDefault();
                                    if (prospectingSchedule != null)
                                    {
                                        customerInfo.ActivityId = prospectingSchedule.ProspectingActivityId;
                                        customerInfo.MeetingAgenda = prospectingSchedule.Agenda;
                                        customerInfo.MeetingScheduleDate = prospectingSchedule.ScheduleDate;
                                    }
                                    List<ProspectingCustomerOfferDetail> offers = _ipsDataContext.ProspectingCustomerOfferDetails.Where(x => x.ProspectingCustomerId == customerInfo.Id).ToList();
                                    if (offers.Count > 0)
                                    {
                                        ProspectingCustomerOfferDetail lastOffer = offers.LastOrDefault();
                                        if (lastOffer != null)
                                        {
                                            customerInfo.IsOfferSent = true;
                                            customerInfo.OfferPrice = lastOffer.OfferPrice;
                                            customerInfo.OfferFollowUpScheduleDate = lastOffer.OfferFollowUpScheduleDate;
                                            OfferClosingDetail offerClosingDetail = _ipsDataContext.OfferClosingDetails.Where(x => x.ProspectingCustomerOfferDetailId == lastOffer.Id).FirstOrDefault();
                                            if (offerClosingDetail != null)
                                            {
                                                customerInfo.IsOfferClosed = offerClosingDetail.IsClosed;
                                                customerInfo.ClosedOfferStatus = offerClosingDetail.Status;
                                                customerInfo.Possibility = offerClosingDetail.Possibility;
                                                customerInfo.ClosingDate = offerClosingDetail.ClosedTime;
                                            }
                                        }
                                    }

                                }
                                customers.AddRange(filteredCustomers);
                            }
                        }
                    }
                }
            }
            else
            {
                List<ProspectingGoalInfo> prospectingGoals = new List<ProspectingGoalInfo>();
                prospectingGoals = _ipsDataContext.ProspectingGoalInfoes.Where(x => x.TaskId > 0).ToList();
                List<int> taskIds = prospectingGoals.Select(x => x.TaskId.Value).ToList();
                List<IpsProjectTaskModel> withoutProjectTasks = new List<IpsProjectTaskModel>();
                List<int> withoutProjectTaskIds = _ipsDataContext.Tasks.Where(x => taskIds.Contains(x.Id) && (x.ProjectId == null || x.ProjectId == 0)).Select(x => x.Id).ToList();
                prospectingGoals = prospectingGoals.Where(x => withoutProjectTaskIds.Contains(x.TaskId.Value)).ToList();

                foreach (ProspectingGoalInfo prospectingGoal in prospectingGoals)
                {
                    if (prospectingGoal != null)
                    {
                        List<ProspectingCustomer> prospectingCustomers = new List<ProspectingCustomer>();
                        prospectingCustomers = _ipsDataContext.ProspectingCustomers.Include("ProspectingGoalInfo")
                            .Include("CustomerSalesData")
                            .Where(x => x.ProspectingGoalId == prospectingGoal.Id).ToList();


                        List<int> customerIds = prospectingCustomers.Select(x => x.Id).ToList();

                        List<int> meeetingCustomers = new List<int>(); ;
                        meeetingCustomers = _ipsDataContext.ProspectingCustomerResults.Where(x => customerIds.Contains(x.ProspectingCustomerId) && x.IsDone == true && x.IsMeeting == true).Select(x => x.ProspectingCustomerId).ToList();


                        List<ProspectingCustomerModel> filteredCustomers = prospectingCustomers.Where(x => meeetingCustomers.Contains(x.Id)).Select(x => new ProspectingCustomerModel()
                        {
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
                        if (filteredCustomers.Count > 0)
                        {
                            foreach (ProspectingCustomerModel customerInfo in filteredCustomers)
                            {
                                ProspectingSchedule prospectingSchedule = _ipsDataContext.ProspectingSchedules.Where(x => x.ProspectingCustomerId == customerInfo.Id && x.IsMeeting == true).FirstOrDefault();
                                if (prospectingSchedule != null)
                                {
                                    customerInfo.ActivityId = prospectingSchedule.ProspectingActivityId;
                                    customerInfo.MeetingAgenda = prospectingSchedule.Agenda;
                                    customerInfo.MeetingScheduleDate = prospectingSchedule.ScheduleDate;
                                }
                                List<ProspectingCustomerOfferDetail> offers = _ipsDataContext.ProspectingCustomerOfferDetails.Where(x => x.ProspectingCustomerId == customerInfo.Id).ToList();
                                if (offers.Count > 0)
                                {
                                    ProspectingCustomerOfferDetail lastOffer = offers.LastOrDefault();
                                    if (lastOffer != null)
                                    {
                                        customerInfo.IsOfferSent = true;
                                        customerInfo.OfferPrice = lastOffer.OfferPrice;
                                        customerInfo.OfferFollowUpScheduleDate = lastOffer.OfferFollowUpScheduleDate;
                                        OfferClosingDetail offerClosingDetail = _ipsDataContext.OfferClosingDetails.Where(x => x.ProspectingCustomerOfferDetailId == lastOffer.Id).FirstOrDefault();
                                        if (offerClosingDetail != null)
                                        {
                                            customerInfo.IsOfferClosed = offerClosingDetail.IsClosed;
                                            customerInfo.ClosedOfferStatus = offerClosingDetail.Status;
                                            customerInfo.Possibility = offerClosingDetail.Possibility;
                                            customerInfo.ClosingDate = offerClosingDetail.ClosedTime;
                                        }
                                    }
                                }

                            }
                            customers.AddRange(filteredCustomers);
                        }
                    }
                }

            }
            return customers;
        }

        public int AssignUserToCustomer(int customerId, int userId)
        {
            int result = 0;
            if (customerId > 0 && userId > 0)
            {
                ProspectingCustomer original = _ipsDataContext.ProspectingCustomers.Where(x => x.Id == customerId).FirstOrDefault();
                if (original != null)
                {
                    ProspectingCustomer newCustomer = original;
                    newCustomer.AssignedToUserId = userId;
                    newCustomer.AssignedOn = DateTime.Now;
                    newCustomer.AssignedBy = _authService.GetCurrentUserId();
                    _ipsDataContext.Entry(original).CurrentValues.SetValues(newCustomer);
                    result = _ipsDataContext.SaveChanges();
                }
            }
            return result;
        }
    }
}

