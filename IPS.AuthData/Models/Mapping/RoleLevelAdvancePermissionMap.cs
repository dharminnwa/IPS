using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models.Mapping
{
   public class RoleLevelAdvancePermissionMap : EntityTypeConfiguration<RoleLevelAdvancePermission>
    {

        public RoleLevelAdvancePermissionMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.PermissionLevelId);
            this.Property(t => t.RoleLevelId);

            // Table & Column Mappings
            this.ToTable("RoleLevelAdvancePermission");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.RoleLevelId).HasColumnName("RoleLevelId");
            this.Property(t => t.PermissionLevelId).HasColumnName("PermissionLevelId");
        }

    }
}
