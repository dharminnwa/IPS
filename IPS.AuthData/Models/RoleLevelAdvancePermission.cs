using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.AuthData.Models
{
    [Table("RoleLevelAdvancePermission")]
    public class RoleLevelAdvancePermission
    {
        [Key]
        public int Id { get; set; }
        public int RoleLevelId { get; set; }
        public int PermissionLevelId { get; set; }
    }
}
