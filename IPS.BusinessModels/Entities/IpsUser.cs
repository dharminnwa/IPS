using IPS.Data;
using System.Collections.Generic;

namespace IPS.BusinessModels.Entities
{
    public class IpsUser
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string ImageUrl { get; set; }
        public bool IsActive { get; set; }
        public bool IsAdmin { get; set; }
        public string OrganizationName { get; set; }
        public List<IpsUserRole> Roles;
        public IpsUser()
        {
            this.Roles = new List<IpsUserRole>();
        }
        public User User { get; set; }
    }
}
