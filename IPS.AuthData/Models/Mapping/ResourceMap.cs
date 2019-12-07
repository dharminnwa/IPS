using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace IPS.AuthData.Models.Mapping
{
    public class ResourceMap : EntityTypeConfiguration<Resource>
    {
        public ResourceMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Name)
                .IsRequired()
                .HasMaxLength(100);

            this.Property(t => t.ParentResourceId)
               .IsRequired();

            this.Property(t => t.IsPage)
               .IsRequired();

            // Table & Column Mappings
            this.ToTable("Resources");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Name).HasColumnName("Name");
            this.Property(t => t.ParentResourceId).HasColumnName("ParentResourceId");
            this.Property(t => t.IsPage).HasColumnName("IsPage");
        }
    }
}
