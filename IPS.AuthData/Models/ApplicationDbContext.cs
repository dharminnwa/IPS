using IPS.AuthData.Models.Mapping;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models
{
    public class ApplicationUserLogin : IdentityUserLogin<string> { }
    public class ApplicationUserClaim : IdentityUserClaim<string> { }

    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole,
        string, ApplicationUserLogin, ApplicationUserRole, ApplicationUserClaim>
    {
        public ApplicationDbContext(string identityConnection)
            : base(identityConnection)
        {
        }
        static ApplicationDbContext()
        {
            Database.SetInitializer<ApplicationDbContext>(null);
        }

        protected override DbEntityValidationResult ValidateEntity(DbEntityEntry entityEntry, IDictionary<object, object> items)
        {
            var res = base.ValidateEntity(entityEntry, items);
            //hack to convince EF that AspNetRole.Name does not need to be unique
            if (!res.IsValid
                && entityEntry.Entity is ApplicationRole
                && entityEntry.State == EntityState.Added
                && res.ValidationErrors.Count == 1
                && res.ValidationErrors.First().PropertyName == "Role")
            {
                return new DbEntityValidationResult(entityEntry, new List<DbValidationError>());
            }

            return res;

        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ApplicationUserRole>().HasKey((ApplicationUserRole t) => new { UserId = t.UserId, RoleId = t.RoleId, OrganizationId = t.OrganizationId });

            modelBuilder.Configurations.Add(new ClientMap());
            modelBuilder.Configurations.Add(new RefreshTokenMap());
            modelBuilder.Configurations.Add(new ResourceMap());
            modelBuilder.Configurations.Add(new RolePermissionMap());
            modelBuilder.Configurations.Add(new UserOrganizationMap());
            modelBuilder.Configurations.Add(new OperationsMap());
            modelBuilder.Configurations.Add(new UserRoleLevelsMap());
            modelBuilder.Configurations.Add(new PermissionTemplateResourcesMap());
            modelBuilder.Configurations.Add(new PermissionTemplatesMap());
        }
        public static ApplicationDbContext Create(string identityConnection = "IdentityConnection") 
        { 
            return new ApplicationDbContext(identityConnection); 
        }

        public DbSet<RolePermission> RolePermissions { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<Resource> Resources { get; set; }
        public DbSet<UserOrganization> UserOrganizations { get; set; }
        public DbSet<RoleOrganisationPermission> RoleOrganisationPermissions { get; set; }
        public DbSet<OperationModel> Operations{ get; set; }
        public DbSet<UserRoleLevels> UserRoleLevels { get; set; }
        public DbSet<PermissionTemplates> PermissionTemplates { get; set; }
        public DbSet<PermissionTemplateResources> PermissionTemplateResources { get; set; }
        public DbSet<RoleLevelResourcePermission> RoleLevelResourcePermissions { get; set; }
        public DbSet<PermissionLevelModel> PermissionLevels { get; set; }
        public DbSet<RoleLevelAdvancePermission> RoleLevelAdvancePermissions { get; set; }
        public DbSet<ResourceDepedencyPermission> ResourceDepedencyPermissions { get; set; }
    }
}
