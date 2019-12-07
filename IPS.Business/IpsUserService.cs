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
using AutoMapper.QueryableExtensions;
using AutoMapper;

namespace IPS.Business
{
    public class IpsUserService : IIpsUserService
    {
        ApplicationDbContext connection = null;
        public IpsUserService()
        {
            connection = ApplicationDbContext.Create("IdentityConnection");

            AutoMapper.Mapper.CreateMap<ApplicationUser, IpsUser>();
            AutoMapper.Mapper.CreateMap<IpsUser, ApplicationUser>();
            AutoMapper.Mapper.CreateMap<ApplicationRole, IpsRole>();
            AutoMapper.Mapper.CreateMap<IpsRole, ApplicationRole>();
            AutoMapper.Mapper.CreateMap<UserOrganization, IpsUserOrganization>();
            AutoMapper.Mapper.CreateMap<ApplicationUserRole, IpsUserRole>();
            AutoMapper.Mapper.CreateMap<IpsUserRole, ApplicationUserRole>();

        }

        public IQueryable<IpsUser> Get()
        {
            return connection.Users.AsNoTracking().Project().To<IpsUser>().AsQueryable();
        }

        public IQueryable<IpsUser> GetById(string id)
        {
            return connection.Users.Where(i => i.Id == id).Project().To<IpsUser>().AsQueryable();

        }

        public string Add(IpsUser user)
        {
            user.Id = Guid.NewGuid().ToString();
            ApplicationUser applicationUser = AutoMapper.Mapper.Map<IpsUser, ApplicationUser>(user);
            connection.Users.Add(applicationUser);
            connection.SaveChanges();

            return applicationUser.Id;
        }

        public bool Update(IpsUser user)
        {
            ApplicationUser applicationUser = AutoMapper.Mapper.Map<IpsUser, ApplicationUser>(user);

            var original = connection.Users.Find(user.Id);

            if (original != null)
            {
                //connection.Entry(original).CurrentValues.SetValues(applicationUser);

                original.FirstName = user.FirstName;
                original.LastName = user.LastName;
                original.ImageUrl = user.ImageUrl;
                original.Email = user.Email;

                if (applicationUser.Roles != null)
                {
                    original.Roles.Clear();
                    foreach (ApplicationUserRole userRole in applicationUser.Roles)
                    {
                        original.Roles.Add(userRole);
                    }
                }

                connection.SaveChanges();
            }

            return true;
        }

        public void UpdateImagePath(string userKey, string imagePath)
        {
            ApplicationUser user = connection.Users.Find(userKey);

            if (user != null)
            {
                user.ImageUrl = imagePath;
                connection.SaveChanges();
            }
        }

       
    }
}

