using IPS.AuthData.Models;
using IPS.BusinessModels.Entities;
using IPS.BusinessModels.Enum;
using IPS.BusinessModels.ResourceModels;
using IPS.Data;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Business
{
    public class DepartmentService : BaseService, IPS.Business.IDepartmentService
    {
        public IQueryable<Department> Get()
        {
            return _ipsDataContext.Departments.AsQueryable();
        }

        public IQueryable<Department> GetDepartmentsByOrganizationId(int organizationId)
        {
            return _ipsDataContext.Departments.Where(_ => _.OrganizationId == organizationId);
        }

        public IQueryable<Department> GetById(int id)
        {
            return _ipsDataContext.Departments.Include("Teams").Include("Users").Where(i => i.Id == id).AsQueryable();
        }

        public Department GetDepartmentById(int id)
        {
            return _ipsDataContext.Departments.Include("Teams").Include("Users").Where(i => i.Id == id).FirstOrDefault();
        }

        public Department Add(Department department)
        {
            _ipsDataContext.Departments.Add(department);
            _ipsDataContext.SaveChanges();
            return department;
        }

        public bool Update(Department department)
        {
            var original = _ipsDataContext.Departments.Find(department.Id);

            if (original != null)
            {
                _ipsDataContext.Entry(original).CurrentValues.SetValues(department);

                if (department.Users != null)
                {
                    original.Users.Clear();


                    foreach (User user in department.Users)
                    {
                        User originalUser = _ipsDataContext.Users.FirstOrDefault(u => u.Id == user.Id);
                        original.Users.Add(originalUser);
                    }
                }

                _ipsDataContext.SaveChanges();
            }

            return true;
        }

        public bool Delete(Department department)
        {
            _ipsDataContext.Departments.Remove(department);
            _ipsDataContext.SaveChangesAsync();

            return true;
        }

        public List<Department> GetOrganizationDepartmentsByOrganizationId(int organizationId)
        {
            List<Department> result = new List<Department>();
            if (_authService.IsSuperAdmin())
            {
                result = _ipsDataContext.Departments.Include("Users").Where(_ => _.OrganizationId == organizationId).ToList();
            }
            else
            {
                // 
                int currentUserId = _authService.GetCurrentUserId();
                int currentUserOrgId = _authService.GetCurrentUserOrgId();
                IpsPermissionModel currentUserAllPermissions = _authService.GetCurrentUserPermissions().Where(x => x.OrganizationId == organizationId).FirstOrDefault();
                if (currentUserAllPermissions != null)
                {
                    if (currentUserAllPermissions.PermissionLevelId == (int)PermissionLevelEnum.AllOrganization)
                    {
                        result = _ipsDataContext.Departments.Include("Users").Where(_ => _.OrganizationId == organizationId).ToList();
                    }
                    else if (currentUserAllPermissions.PermissionLevelId == (int)PermissionLevelEnum.OwnOrganization)
                    {
                        if (organizationId == currentUserOrgId)
                        {
                            result = _ipsDataContext.Departments.Include("Users").Where(_ => _.OrganizationId == organizationId).ToList();
                        }
                    }
                    else if (currentUserAllPermissions.PermissionLevelId == (int)PermissionLevelEnum.OwnData)
                    {

                        List<Department> Departments = _ipsDataContext.Departments.Include("Users").Where(_ => _.OrganizationId == organizationId).ToList();
                        foreach (Department department in Departments)
                        {
                            if (department.Users.Any(x => x.Id == currentUserId) || department.ManagerId == currentUserId)
                            {
                                result.Add(department);
                            }
                        }

                    }
                    else if (currentUserAllPermissions.PermissionLevelId == (int)PermissionLevelEnum.SubLevel)
                    {
                        RoleLevelService roleLevelService = new RoleLevelService();
                        List<UserRoleLevels> childUserRoleLevels = roleLevelService.GetRoleLevelChildsRecursive(currentUserAllPermissions.RoleLevelId);
                        List<IpsUser> users = new List<IpsUser>();
                        foreach (UserRoleLevels userroleLevel in childUserRoleLevels)
                        {
                            users.AddRange(roleLevelService.GetChildRoleLevelUsersRecursive(userroleLevel.Id));
                        }
                        List<int> userIds = users.Select(x => x.User.Id).ToList();
                        userIds.Add(currentUserId);
                        List<Department> Departments = _ipsDataContext.Departments.Include("Users").Where(_ => _.OrganizationId == organizationId).ToList();
                        foreach (Department department in Departments)
                        {
                            if (department.Users.Count() > 0)
                            {
                                if (department.Users.Any(x => userIds.Contains(x.Id)) || userIds.Contains(department.ManagerId.HasValue ? department.ManagerId.Value : 0))
                                {
                                    result.Add(department);
                                }
                            }
                            else if (department.ManagerId == currentUserId)
                            {
                                result.Add(department);
                            }
                        }

                        //List<int> subOrganizations = _ipsDataContext.Organizations.Where(x => x.ParentId == currentUserOrgId).Select(x => x.Id).ToList();
                        //if (subOrganizations.Contains(organizationId))
                        //{
                        //    result = _ipsDataContext.Departments.Include("Users").Where(_ => _.OrganizationId == organizationId).ToList();
                        //}

                    }
                }

            }
            return result;
        }
    }
}