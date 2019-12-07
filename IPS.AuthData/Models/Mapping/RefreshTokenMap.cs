using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity.ModelConfiguration;

namespace IPS.AuthData.Models.Mapping
{
    public class RefreshTokenMap : EntityTypeConfiguration<RefreshToken>
    {
        public RefreshTokenMap()
        {
            // Primary Key
            this.HasKey(t => t.Id);

            // Properties
            this.Property(t => t.Id)
                .IsRequired()
                .HasMaxLength(128);

            this.Property(t => t.Subject)
                .IsRequired()
                .HasMaxLength(50);

            this.Property(t => t.ClientId)
                .IsRequired()
                .HasMaxLength(50);

            this.Property(t => t.ProtectedTicket)
                .IsRequired();

            // Table & Column Mappings
            this.ToTable("RefreshTokens");
            this.Property(t => t.Id).HasColumnName("Id");
            this.Property(t => t.Subject).HasColumnName("Subject");
            this.Property(t => t.ClientId).HasColumnName("ClientId");
            this.Property(t => t.IssuedUtc).HasColumnName("IssuedUtc");
            this.Property(t => t.ExpiresUtc).HasColumnName("ExpiresUtc");
            this.Property(t => t.ProtectedTicket).HasColumnName("ProtectedTicket");
        }
    }
}
