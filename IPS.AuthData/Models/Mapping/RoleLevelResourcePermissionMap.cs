using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models.Mapping
{
    public class RoleLevelResourcePermissionMap : EntityTypeConfiguration<RoleLevelResourcePermission>
    {
        public RoleLevelResourcePermissionMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.OperationId);
            this.Property(t => t.ResourceId);
            this.Property(t => t.RoleLevelId);

            // Table & Column Mappings
            this.ToTable("RoleLevelResourcePermissions");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.RoleLevelId).HasColumnName("RoleLevelId");
            this.Property(t => t.OperationId).HasColumnName("OperationId");
            this.Property(t => t.ResourceId).HasColumnName("ResourceId");
        }
    }
}
