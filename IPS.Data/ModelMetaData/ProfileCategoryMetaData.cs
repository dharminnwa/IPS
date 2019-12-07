using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Data
{
    [MetadataType(typeof(ProfileCategoryMetadata))]
    public partial class ProfileCategory
    {
    }

    internal class ProfileCategoryMetadata
    {
        [Required]
        public string Name { get; set; }
    }
}