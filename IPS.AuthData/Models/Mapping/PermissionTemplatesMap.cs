using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models.Mapping
{
    public class PermissionTemplatesMap : EntityTypeConfiguration<PermissionTemplates>
    {
        public PermissionTemplatesMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Name)
                .IsRequired()
                .HasMaxLength(50);

           
            // Table & Column Mappings
            this.ToTable("PermissionTemplates");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Name).HasColumnName("Name");
        }
    }
}
