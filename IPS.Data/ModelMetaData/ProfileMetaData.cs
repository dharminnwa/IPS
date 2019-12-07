using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Data
{
    [MetadataType(typeof(ProfileMetadata))]
    public partial class Profile
    {
    }

    internal class ProfileMetadata
    {
        [Required]
        public int KPIWeak { get; set; }

        [Required]
        public int KPIStrong { get; set; }
       
        [Required]
        public int ProfileTypeId { get; set; }

    }
}