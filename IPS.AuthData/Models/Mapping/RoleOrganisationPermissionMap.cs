using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace IPS.AuthData.Models.Mapping
{
    public class RoleOrganisationPermissionMap : EntityTypeConfiguration<RoleOrganisationPermission>
    {
        public RoleOrganisationPermissionMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.RoleId)
                .IsRequired()
                .HasMaxLength(128);

            // Table & Column Mappings
            this.ToTable("RolePermissions");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.RoleId).HasColumnName("RoleId");
            this.Property(t => t.ResourceId).HasColumnName("ResourceId");
            this.Property(t => t.Operations).HasColumnName("Operations");
            this.Property(t => t.IsApplicableToOwnResources).HasColumnName("IsApplicableToOwnResources");
            this.Property(t => t.IsApplicableToAllResources).HasColumnName("IsApplicableToAllResources");

            // Relationships
            this.HasRequired(t => t.Role)
                .WithMany(t => t.RoleOrganisationPermissions)
                .HasForeignKey(d => d.RoleId);
            this.HasRequired(t => t.Resource)
                .WithMany(t => t.RoleOrganisationPermissions)
                .HasForeignKey(d => d.ResourceId);

        }
    }
}

