using IPS.AuthData.Models;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace IPS.AuthData.Models
{
    public class Resource
    {
        public Resource()
        {
            this.RolePermissions = new List<RolePermission>();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public Nullable<int> ParentResourceId { get; set; }
        public bool IsPage { get; set; }
        public virtual ICollection<RolePermission> RolePermissions { get; set; }
        public virtual ICollection<RoleOrganisationPermission> RoleOrganisationPermissions { get; set; }
    }
}
