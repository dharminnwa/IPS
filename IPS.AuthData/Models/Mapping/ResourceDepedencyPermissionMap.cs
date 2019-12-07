using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models.Mapping
{
    public class ResourceDepedencyPermissionMap : EntityTypeConfiguration<ResourceDepedencyPermission>
    {
        public ResourceDepedencyPermissionMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.OperationId);
            this.Property(t => t.ResourceId);
            this.Property(t => t.DependentResourceId);

            // Table & Column Mappings
            this.ToTable("ResourceDepedencyPermissions");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.ResourceId).HasColumnName("ResourceId");
            this.Property(t => t.DependentResourceId).HasColumnName("DependentResourceId");
            this.Property(t => t.OperationId).HasColumnName("OperationId");
        }
    }
}
