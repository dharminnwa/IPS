using IPS.Business.Interfaces;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity.Core.Objects;
using System.Diagnostics;
using IPS.BusinessModels.UserModel;
using IPS.BusinessModels.Entities;

namespace IPS.Business
{
    public class UserService : BaseService, IUserService
    {
        public IQueryable<User> Get()
        {
            return _ipsDataContext.Users.AsNoTracking().AsQueryable();
        }

        public User GetById(int id)
        {
            return _ipsDataContext.Users.FirstOrDefault(i => i.Id == id);
        }

        public IQueryable<User> GetQueryableUser(int id)
        {
            return _ipsDataContext.Users.Where(u => u.Id == id);
        }

        public IQueryable<User> GetUserByKey(string userKey)
        {
            return _ipsDataContext.Users.Where(u => u.UserKey == userKey).AsNoTracking().AsQueryable();
        }

        public IQueryable<User> GetUsers(string userKey)
        {
            int orgId = _ipsDataContext.Users.Where(u => u.UserKey == userKey).FirstOrDefault().OrganizationId.Value;
            return _ipsDataContext.Users.Where(i => i.OrganizationId == orgId).AsQueryable();
        }

        public User Add(User user)
        {
            user.UserType = null;
            user.Culture = null;
            List<Department> departments = new List<Department>(user.Departments);
            user.Departments.Clear();

            List<Link_TeamUsers> link_teamUsers = new List<Link_TeamUsers>(user.Link_TeamUsers);
            user.Link_TeamUsers.Clear();

            List<JobPosition> jobPositions = new List<JobPosition>(user.JobPositions);
            user.JobPositions.Clear();

            _ipsDataContext.Users.Add(user);
            _ipsDataContext.SaveChanges();

            foreach (Department department in departments)
            {
                Department departmentDB = _ipsDataContext.Departments.Include("Users").Where(cd => cd.Id == department.Id).FirstOrDefault();
                if (!departmentDB.Users.Contains(user))
                {
                    departmentDB.Users.Add(user);
                }
            }

            foreach (Link_TeamUsers link_TeamUser in link_teamUsers)
            {
                if (link_TeamUser.UserId == -1)
                {
                    Link_TeamUsers newLink_TeamUser = new Link_TeamUsers();
                    newLink_TeamUser.TeamId = link_TeamUser.TeamId;
                    newLink_TeamUser.UserId = user.Id;
                    _ipsDataContext.Link_TeamUsers.Add(newLink_TeamUser);
                }
            }


            foreach (JobPosition jp in jobPositions)
            {
                JobPosition jobPositionDB = _ipsDataContext.JobPositions.Where(j => j.Id == jp.Id).FirstOrDefault();
                user.JobPositions.Add(jobPositionDB);
            }
            //  user.JobPositions = jobPositions;

            _ipsDataContext.SaveChanges();
            return user;
        }

        public bool Update(User user)
        {
            var original = _ipsDataContext.Users.Include("Departments1").Include("Link_TeamUsers").Include("JobPositions").Where(u => u.Id == user.Id).FirstOrDefault();

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(user);
                //Departments Update
                //Delete user from DB departments
                foreach (Department dBDepartment in original.Departments1)
                {
                    Department department = _ipsDataContext.Departments.Include("Users").Where(d => d.Id == dBDepartment.Id).FirstOrDefault();
                    department.Users.Remove(original);
                }
                //!Delete user from DB departments

                //Add User to new departments
                foreach (Department dBDepartment in user.Departments1)
                {
                    Department currentDepartment = _ipsDataContext.Departments.Include("Users").Where(d => d.Id == dBDepartment.Id).FirstOrDefault();
                    currentDepartment.Users.Add(original);
                }
                //!Add User to new departments
                //!Departments Update

                _ipsDataContext.Link_TeamUsers.RemoveRange(original.Link_TeamUsers);
                _ipsDataContext.Link_TeamUsers.AddRange(user.Link_TeamUsers);

                original.JobPositions.Clear();
                foreach (JobPosition jobposition in user.JobPositions)
                {
                    JobPosition jobPositionDB = _ipsDataContext.JobPositions.Where(jp => jp.Id == jobposition.Id).FirstOrDefault();
                    original.JobPositions.Add(jobPositionDB);
                }


                _ipsDataContext.SaveChanges();
            }

            return true;
        }


        public bool Delete(User user)
        {
            User original = _ipsDataContext.Users.Include("Departments1").Include("Link_TeamUsers").Where(u => u.Id == user.Id).FirstOrDefault();

            if (original != null)
            {
                foreach (Department dBDepartment in original.Departments1)
                {
                    Department department = _ipsDataContext.Departments.Include("Users").Where(d => d.Id == dBDepartment.Id).FirstOrDefault();
                    department.Users.Remove(original);
                }

                _ipsDataContext.Link_TeamUsers.RemoveRange(original.Link_TeamUsers);

                _ipsDataContext.Users.Remove(user);

                _ipsDataContext.SaveChangesAsync();
            }

            return true;
        }

        public void UpdateImagePath(int userId, string imagePath)
        {
            User user = _ipsDataContext.Users.FirstOrDefault(u => u.Id == userId);

            if (user != null)
            {
                user.ImagePath = imagePath;
                SaveChanges();
            }
        }
        public bool IsEmailExist(string email)
        {
            bool result = _ipsDataContext.Users.Any(x => x.WorkEmail == email);
            return result;
        }
        public List<IpsUserModel> GetUsersBySearchText(string searchText)
        {
            List<IpsUserModel> result = new List<IpsUserModel>();
            var currentUser = _authService.getCurrentUser();
            var realCurrentUser = _authService.GetUserById(currentUser.Id);
            int userOrganizationId = _authService.GetCurrentUserOrgId();
            List<int> userOrganizationIdList = _authService.GetUserOrganizations();
            if (_authService.IsFromGlobalOrganization(userOrganizationIdList))
            {
                List<IpsUserModel> users = _ipsDataContext.Users.Include("Organization").Where(x => x.FirstName.ToLower().Contains(searchText.ToLower()) || x.LastName.ToLower().Contains(searchText.ToLower()) || x.WorkEmail.ToLower().Contains(searchText.ToLower()))
                    .Select(u => new IpsUserModel()
                    {
                        Id = u.Id,
                        Email = u.WorkEmail,
                        FirstName = u.FirstName,
                        ImageUrl = u.ImagePath,
                        IsActive = u.IsActive,
                        LastName = u.LastName,
                        OrganizationName = u.Organization.Name,
                    }).ToList();
                result.AddRange(users);
            }
            else
            {
                foreach (int userOrgId in userOrganizationIdList)
                {
                    string orgName = _ipsDataContext.Organizations.Where(x => x.Id == userOrgId).Select(x => x.Name).FirstOrDefault();

                    List<IpsUserModel> organizationUsers = _ipsDataContext.Users.Where(x => x.OrganizationId == userOrgId && (x.FirstName.ToLower().Contains(searchText.ToLower()) || x.LastName.ToLower().Contains(searchText.ToLower()) || x.WorkEmail.ToLower().Contains(searchText.ToLower())))
                           .Select(u => new IpsUserModel()
                           {
                               Id = u.Id,
                               Email = u.WorkEmail,
                               FirstName = u.FirstName,
                               ImageUrl = u.ImagePath,
                               IsActive = u.IsActive,
                               LastName = u.LastName,
                               OrganizationName = orgName,
                           }).ToList();
                    result.AddRange(organizationUsers);

                    List<Project> allProjects = _ipsDataContext.Projects.Include("Link_ProjectUsers").Where(x => x.IsActive == true && x.OrganizationId == userOrgId).ToList();
                    List<Link_ProjectUsers> projectMembers = new List<Link_ProjectUsers>();
                    foreach (Project project in allProjects)
                    {
                        bool isExist = project.Link_ProjectUsers.Any(x => x.UserId == realCurrentUser.User.Id);
                        if (isExist)
                        {
                            projectMembers.AddRange(project.Link_ProjectUsers);
                        }
                    }
                    List<int> projectUserIds = projectMembers.Select(x => x.UserId).Distinct().ToList();
                    if (projectUserIds.Count > 0)
                    {
                        List<IpsUserModel> projectUsers = _ipsDataContext.Users.Where(x => projectUserIds.Contains(x.Id) == true && (x.FirstName.ToLower().Contains(searchText.ToLower()) || x.LastName.ToLower().Contains(searchText.ToLower()) || x.WorkEmail.ToLower().Contains(searchText.ToLower()))).Select(u => new IpsUserModel()
                        {
                            Id = u.Id,
                            Email = u.WorkEmail,
                            FirstName = u.FirstName,
                            ImageUrl = u.ImagePath,
                            IsActive = u.IsActive,
                            LastName = u.LastName,
                            OrganizationName = orgName,
                        }).ToList();

                        result.AddRange(projectUsers.Distinct());
                    }

                    //var isAdminOrSuperAdmin = _authService.IsInOrganizationInRoleOf("Admin", userOrgId) || _authService.IsInOrganizationInRoleOf("Super Admin", userOrgId);
                    //if (isAdminOrSuperAdmin)
                    //{


                    //}
                    //else
                    //{

                    //}
                }
            }
            result = result.Where(x => x.Id != realCurrentUser.User.Id).GroupBy(elem => elem.Id).Select(group => group.First()).ToList();
            return result;
        }


        public List<IpsUserModel> GetUsersList()
        {
            List<IpsUserModel> result = new List<IpsUserModel>();
            var currentUser = _authService.getCurrentUser();
            var realCurrentUser = _authService.GetUserById(currentUser.Id);
            int userOrganizationId = _authService.GetCurrentUserOrgId();
            List<int> userOrganizationIdList = _authService.GetUserOrganizations();
            if (_authService.IsFromGlobalOrganization(userOrganizationIdList))
            {
                List<IpsUserModel> users = _ipsDataContext.Users.Include("Organization")
                    .Select(u => new IpsUserModel()
                    {
                        Id = u.Id,
                        Email = u.WorkEmail,
                        FirstName = u.FirstName,
                        ImageUrl = u.ImagePath,
                        IsActive = u.IsActive,
                        LastName = u.LastName,
                        OrganizationName = u.Organization.Name,
                    }).ToList();
                result.AddRange(users);
            }
            else
            {
                foreach (int userOrgId in userOrganizationIdList)
                {
                    string orgName = _ipsDataContext.Organizations.Where(x => x.Id == userOrgId).Select(x => x.Name).FirstOrDefault();

                    List<IpsUserModel> organizationUsers = _ipsDataContext.Users.Where(x => x.OrganizationId == userOrgId)
                           .Select(u => new IpsUserModel()
                           {
                               Id = u.Id,
                               Email = u.WorkEmail,
                               FirstName = u.FirstName,
                               ImageUrl = u.ImagePath,
                               IsActive = u.IsActive,
                               LastName = u.LastName,
                               OrganizationName = orgName,
                           }).ToList();
                    result.AddRange(organizationUsers);

                    List<Project> allProjects = _ipsDataContext.Projects.Include("Link_ProjectUsers").Where(x => x.IsActive == true && x.OrganizationId == userOrgId).ToList();
                    List<Link_ProjectUsers> projectMembers = new List<Link_ProjectUsers>();
                    foreach (Project project in allProjects)
                    {
                        bool isExist = project.Link_ProjectUsers.Any(x => x.UserId == realCurrentUser.User.Id);
                        if (isExist)
                        {
                            projectMembers.AddRange(project.Link_ProjectUsers);
                        }
                    }
                    List<int> projectUserIds = projectMembers.Select(x => x.UserId).Distinct().ToList();
                    if (projectUserIds.Count > 0)
                    {
                        List<IpsUserModel> projectUsers = _ipsDataContext.Users.Where(x => projectUserIds.Contains(x.Id) == true).Select(u => new IpsUserModel()
                        {
                            Id = u.Id,
                            Email = u.WorkEmail,
                            FirstName = u.FirstName,
                            ImageUrl = u.ImagePath,
                            IsActive = u.IsActive,
                            LastName = u.LastName,
                            OrganizationName = orgName,
                        }).ToList();

                        result.AddRange(projectUsers.Distinct());
                    }
                }
            }
            result = result.Where(x => x.Id != realCurrentUser.User.Id).GroupBy(elem => elem.Id).Select(group => group.First()).ToList();
            return result;
        }


        public List<IpsUser> GetUsersByRoleLevelId(int roleLevelId)
        {
            List<IpsUser> result = new List<IpsUser>();
            RoleService roleService = new RoleService();
            UserService userService = new UserService();
            List<IpsRole> roles = roleService.GetRolesByLevelId(roleLevelId);
            foreach (IpsRole role in roles)
            {
                result.AddRange(_authService.GetUsersByRoleId(role.Id).ToList());
            }
            return result;
        }
    }
}
