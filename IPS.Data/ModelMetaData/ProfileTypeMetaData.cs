using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IPS.Data
{
    [MetadataType(typeof(ProfileTypeMetadata))]
    public partial class ProfileType
    {
    }

    internal class ProfileTypeMetadata
    {
        [Required]
        public string Name { get; set; }


    }
}