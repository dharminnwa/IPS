using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models
{
    [Table("UserRoleLevels")]
    public class UserRoleLevels
    {
        [Key]
        public int Id { get; set; }
        [Required]
        [MaxLength(50)]
        public string Name { get; set; }
        public Nullable<int> ParentRoleLevelId { get; set; }
        public Nullable<int> OrganizationId { get; set; }
    }
}
