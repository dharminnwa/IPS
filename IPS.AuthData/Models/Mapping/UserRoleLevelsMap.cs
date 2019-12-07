using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models.Mapping
{
    public class UserRoleLevelsMap : EntityTypeConfiguration<UserRoleLevels>
    {
        public UserRoleLevelsMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties

            this.Property(t => t.Name)
                .IsRequired()
                .HasMaxLength(50);

            this.Property(t => t.OrganizationId);
            this.Property(t => t.ParentRoleLevelId);

            // Table & Column Mappings
            this.ToTable("UserRoleLevels");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Name).HasColumnName("Name");
            this.Property(t => t.OrganizationId).HasColumnName("OrganizationId");
            this.Property(t => t.ParentRoleLevelId).HasColumnName("ParentRoleLevelId");
        }
    }
}
