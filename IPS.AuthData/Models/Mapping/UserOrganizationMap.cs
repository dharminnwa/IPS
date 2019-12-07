using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace IPS.AuthData.Models.Mapping
{
    public class UserOrganizationMap : EntityTypeConfiguration<UserOrganization>
    {
        public UserOrganizationMap()
        {
            // Primary Key
            this.HasKey(t => new { t.UserId, t.OrganizationId });

            // Properties
            this.Property(t => t.UserId)
                .IsRequired()
                .HasMaxLength(128);

            this.Property(t => t.OrganizationId)
                .HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);

            // Table & Column Mappings
            this.ToTable("UserOrganizations");
            this.Property(t => t.UserId).HasColumnName("UserId");
            this.Property(t => t.OrganizationId).HasColumnName("OrganizationId");

            // Relationships
            this.HasRequired(t => t.ApplicationUser)
                .WithMany(t => t.UserOrganizations)
                .HasForeignKey(d => d.UserId);

        }
    }
}
