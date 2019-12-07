using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models.Mapping
{
    public class PermissionTemplateResourcesMap : EntityTypeConfiguration<PermissionTemplateResources>
    {
        public PermissionTemplateResourcesMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.OperationId);
            this.Property(t => t.PermissionTemplateId);
            this.Property(t => t.ResourceId);

            // Table & Column Mappings
            this.ToTable("PermissionTemplateResources");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.OperationId).HasColumnName("OperationId");
            this.Property(t => t.PermissionTemplateId).HasColumnName("PermissionTemplateId");
            this.Property(t => t.ResourceId).HasColumnName("ResourceId");
        }
    }
}
