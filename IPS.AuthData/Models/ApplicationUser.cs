using IPS.AuthData.Managers;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using IPS.Fx.Security.Crytography;


namespace IPS.AuthData.Models
{
    public class ApplicationUser : IdentityUser<string, ApplicationUserLogin, ApplicationUserRole, ApplicationUserClaim>
    {
        public ApplicationUser()
        {
            this.UserOrganizations = new List<UserOrganization>();
        }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string ImageUrl { get; set; }
        public string Password { get; set; }
        public bool IsActive { get; set; }
        public virtual ICollection<UserOrganization> UserOrganizations { get; set; }
        public async Task<ClaimsIdentity> GenerateUserIdentityAsync(ApplicationUserManager manager)
        {
            // Note the authenticationType must match the one defined in CookieAuthenticationOptions.AuthenticationType
            var userIdentity = await manager.CreateIdentityAsync(this, DefaultAuthenticationTypes.ApplicationCookie);
            // Add custom user claims here
            return userIdentity;
        }

        public string DecryptedPassword
        {
            get
            {
                RSAAsymmetricProvider rsaAsymmetricProvider = new RSAAsymmetricProvider();
                return rsaAsymmetricProvider.Decrypt(Password);
            }
        }
    }
}
