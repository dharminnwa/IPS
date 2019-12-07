using IPS.AuthData.Models;
using IPS.AuthData.Stores;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Managers
{
    public class ApplicationRoleManager : RoleManager<ApplicationRole>
    {
        public ApplicationRoleManager(IRoleStore<ApplicationRole, string> roleStore)
            : base(roleStore)
        {
        }


        public static ApplicationRoleManager Create(ApplicationDbContext context)
        {
            var manager = new ApplicationRoleManager(
                new ApplicationRoleStore(context));

            return manager;
        }
    }
}
