using System;
using System.Collections.Generic;
using System.Data.Entity.ModelConfiguration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models.Mapping
{
   public class PermissionLevelMap : EntityTypeConfiguration<PermissionLevelModel>
    {

        public PermissionLevelMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties

            this.Property(t => t.Name)
                .IsRequired()
                .HasMaxLength(50);

          

            // Table & Column Mappings
            this.ToTable("PermissionLevels");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Name).HasColumnName("Name");
        }
    }
}
