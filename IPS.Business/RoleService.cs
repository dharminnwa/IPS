using IPS.AuthData.Managers;
using IPS.AuthData.Models;
using IPS.BusinessModels.Entities;
using IPS.Business.Interfaces;
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
    public class RoleService : BaseService, IRoleService
    {
        ApplicationDbContext connection;

        public RoleService()
        {
            connection = new ApplicationDbContext("IdentityConnection");

            AutoMapper.Mapper.CreateMap<IpsRole, ApplicationRole>();
            AutoMapper.Mapper.CreateMap<ApplicationRole, IpsRole>();
        }

        public IQueryable<IpsRole> Get()
        {
            List<ApplicationRole> roles = new List<ApplicationRole>();


            List<int> idList = _authService.GetUserOrganizations();

            if (_authService.IsSuperAdmin())
            {
                roles = connection.Roles.AsNoTracking().ToList();
            }
            else
            {
                roles = connection.Roles.Where(r => idList.Contains(r.OrganizationId)).ToList();
            }

            List<IpsRole> result = AutoMapper.Mapper.Map<List<ApplicationRole>, List<IpsRole>>(roles);

            return result.AsQueryable();
        }

        public List<IpsRole> GetRolesByOrganizationId(int organizationId)
        {
            List<ApplicationRole> roles = connection.Roles.Where(r => r.OrganizationId == organizationId).ToList();
            List<IpsRole> result = AutoMapper.Mapper.Map<List<ApplicationRole>, List<IpsRole>>(roles);
            return result;
        }
        public List<IpsRole> GetRolesByLevelId(int levelId)
        {
            List<ApplicationRole> roles = connection.Roles.Where(r => r.RoleLevel == levelId).ToList();
            List<IpsRole> result = AutoMapper.Mapper.Map<List<ApplicationRole>, List<IpsRole>>(roles);
            return result;
        }

        public IpsRole GetById(string id)
        {
            ApplicationRole role = connection.Roles.Where(i => i.Id == id).FirstOrDefault();
            IpsRole result = AutoMapper.Mapper.Map<ApplicationRole, IpsRole>(role);
            return result;
        }

        public IpsRole Add(IpsRole role)
        {
            string id = Guid.NewGuid().ToString();
            role.Id = id;

            ApplicationRole applicationRole = AutoMapper.Mapper.Map<IpsRole, ApplicationRole>(role);
            connection.Roles.Add(applicationRole);
            connection.SaveChanges();

            return role;
        }

        public bool Update(IpsRole role)
        {
            ApplicationRole applicationRole = AutoMapper.Mapper.Map<IpsRole, ApplicationRole>(role);
            var original = connection.Roles.Find(applicationRole.Id);

            if (original != null)
            {
                connection.Entry(original).CurrentValues.SetValues(applicationRole);
                connection.SaveChanges();
            }

            return true;
        }

        public bool Delete(IpsRole role)
        {
            ApplicationRole applicationRole = AutoMapper.Mapper.Map<IpsRole, ApplicationRole>(role);
            connection.Roles.Remove(applicationRole);
            connection.SaveChangesAsync();

            return true;
        }
        
    }
}
